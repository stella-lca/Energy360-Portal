const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { User } = require("../models");

const {
  APPSETTING_JWT_SECRET,
  APPSETTING_JWT_EXPIRED,
  APPSETTING_REFTOKEN_EXPIRED
} = process.env;

// User Signup
exports.signup = async (req, res) => {
  const {
    body: params,
    body: { email, password }
  } = req;

  // Request Params Validation
  if (!email && password) {
    res.status(202).send({
      message: "User Email or Password can not be empty!"
    });
    return;
  }

  // Check User already exist and create new user!
  User.findOne({
    where: {
      email: email
    }
  }).then(user => {
    if (user) {
      return res.status(202).send({ message: "User already Exist!" });
    } else {
      User.create({ ...params, password: bcrypt.hashSync(password, 8) })
        .then(user => {
          const { firstName, lastName, email, accountTypeDetail } = user;
          res.status(200).send({ firstName, lastName, email, accountTypeDetail });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    }
  });
};

// User Signin
exports.signin = (req, res) => {
  const { email, password } = req.query;

  User.findOne({
    where: {
      email
    }
  })
    .then(user => {
      // Email validation
      if (!user) {
        return res.status(202).send({ message: "User Not found." });
      }

      // Password Validation
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        return res.status(202).send({
          message: "Password is wrong!"
        });
      }

      delete user.password;
      const token = jwt.sign(user, APPSETTING_JWT_SECRET, { expiresIn: APPSETTING_JWT_EXPIRED})
      const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: APPSETTING_REFTOKEN_EXPIRED})
      res.status(200).send({ token, refreshToken });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const { id } = req.params;

  User.findByPk(id)
    .then(user => {
      if (user) {
        const { firstName, lastName, email } = user;
        return res.send({ firstName, lastName, email });
      } else {
        return res.status(404).send({ message: "User Not found." });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const { id } = req.params;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "User was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id=" + id
      });
    });
};
