const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  User: { findByID, findUser, createUser, deleteUser, updateUser }
} = require('../models');
const { sendEmail, sendAdminEmail } = require('../utils/email');
const db = require('../models');

const {
  APPSETTING_JWT_SECRET,
  APPSETTING_JWT_EXPIRED,
  APPSETTING_GREENCONNECT_ID,
  APPSETTING_CLIENT_ID
} = process.env;

const createJwtToken = async user => {
  const payload = {
    userId: user.id,
    email: user.email
  };

  return await jwt.sign(payload, APPSETTING_JWT_SECRET, {
    expiresIn: APPSETTING_JWT_EXPIRED
  });
};

const userData = user => {
  user = {
    ...user.dataValues,
    APPSETTING_GREENCONNECT_ID,
    APPSETTING_CLIENT_ID
  };
  delete user.password;
  return user;
};

// User Signup
exports.signup = async (req, res) => {
  const {
    body: params,
    body: { email, password }
  } = req;

  // Request Params Validation
  if (!email && password) {
    return res.status(202).send({
      message: 'User Email or Password can not be empty!'
    });
  }

  // Check User already exist and create new user!
  let user = await findUser(email);
  if (user !== undefined) {
    return res.status(202).send({
      message: 'User already Exist!'
    });
  } else {
    user = await createUser({
      ...params,
      password: bcrypt.hashSync(password, 8)
    });
    console.log(user);
    if (user !== undefined) {
      const token = await createJwtToken(user);
      req.session.token = token
      const userName = `${user.firstName} ${user.lastName}`;
      user = userData(user);
      sendAdminEmail({
        content: `${
          userName.charAt(0).toUpperCase() + userName.slice(1)
          } just joined to Greenconnect. <br/>`,
        subject: 'Greenconnect - User Profile'
      });
      res.status(200).send({ user, token });
    } else {
      res.status(500).send({
        message: 'err.message '
      });
    }
  }
};

// User Signin
exports.signin = async (req, res) => {
  const { email, password } = req.query;

  let user = await findUser(email);
  if (user !== undefined) {
    // Password Validation
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(202).send({
        message: 'Password is wrong!'
      });
    }

    user = userData(user);
    const token = await createJwtToken(user);
    req.session.token = token
    res.status(200).send({
      token,
      user
    });
  } else {
    return res.status(202).send({
      message: 'User Not found.'
    });
  }
};

exports.update = async (req, res) => {
  const { email } = req.body;
  let user = await updateUser(email, req.body);

  if (user !== undefined) {
    user = await findUser(email);
    if (user !== undefined) {
      user = userData(user);
      const user_name = user.firstName + user.lastName;
      sendAdminEmail({
        content: `${user_name} profile was updated!`,
        subject: 'Greenconnect - User Profile'
      });
      res.status(200).send({ user });
    } else {
      res.status(500).send({ message: 'Server error' });
    }
  } else {
    return res.status(500).send({ message: 'Profile updates was failt' });
  }
};

// Find a single User with an id
exports.findOne = async (req, res) => {
  const { id } = req.params;
  let user = await findByID(id);
  if (user !== undefined) {
    user = userData(user);
    return res.send({
      user
    });
  } else {
    return res.status(404).send({
      message: 'User Not found.'
    });
  }
};

// Delete a User with the specified id in the request
exports.delete = async (req, res) => {
  const { id } = req.params;

  if (await deleteUser(id)) {
    return res.send({
      message: 'User was deleted successfully!'
    });
  } else {
    res.send({
      message: `Cannot delete User with id=${id}. Maybe User was not found!`
    });
  }
};

// Check token validation
exports.checkToken = async (req, res) => {
  const { id } = req.user;
  // let user = await findByID(id);
  let user = await db.User.findOne({
    where: { id: id },
    include: [{
      model: db.Token
    }]
  })
  if (user !== undefined) {
    user = userData(user);
    return res.send({
      user
    });
  } else {
    return res.status(404).send({
      message: 'User Not found.'
    });
  }
};

// Send Forgot password Email
exports.sendForgotEmail = async (req, res) => {
  const { email } = req.body;
  let user = await findUser(email);

  if(!user){
    return res.status(202).send({message:"Email not found."});
  }

  const token = await createJwtToken({
      userId: user.id,
      email: user.email
    });

  await user.update({
      password: token
    });

  sendEmail({ email, token, res });
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token) {
    return res.status(401).json({
      message: 'Token required'
    });
  } else {
    try {
      const { email } = jwt.verify(token, APPSETTING_JWT_SECRET);
      let user = await findUser(email);
      if (user !== undefined && user.password === token) {
        user.update({
          password: bcrypt.hashSync(password, 8)
        });
        return res.status(200).json({
          message: 'Password updated succesfully'
        });
      } else {
        return res.status(202).json({
          message: 'This link is already used'
        });
      }
    } catch (e) {
      res.status(401).send({
        message: 'Invalid Token'
      });
    }
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password) {
    return res.status(202).json({
      message: 'Email and Passsword should be exist.'
    });
  } else {
    let user = await findUser(email);
    if (user !== undefined) {
      user.update({
        password: bcrypt.hashSync(password, 8)
      });
      return res.status(200).json({
        message: 'Password updated succesfully'
      });
    } else {
      return res.status(202).json({
        message: 'User Not Found!'
      });
    }
  }
};

// SEND EMAIL
exports.sendEmail = async (req, res) => {
  try {
    const { name, email, content } = req.body;
    const user_name = name.charAt(0).toUpperCase() + name.slice(1);
    sendAdminEmail({
      content: `${user_name} just sent a new message. <br/><br/><b>Contents:</b>${content}</br> from ${email}`,
      subject: 'Greenconnect - Notification'
    });
    res.send(true);
  } catch (e) {
    res.status(404).send(false);
  }
};
