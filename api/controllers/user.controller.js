const bcrypt = require("bcrypt");
const { User } = require("../models");

// User Signup
exports.signup = async (req, res) => {
  const {
    body: params,
    body: { email, password }
  } = req;

  // Request Params Validation
  if (!email && password) {
    res.status(400).send({
      message: "User name or password can not be empty!"
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
      return res.status(400).send({ message: "User already Exist!" });
    } else {
      User.create({ ...params, password: bcrypt.hashSync(password, 8) })
        .then(user => {
          res.send({ message: "User was registered successfully!", user });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    }
  });
};

// User Signin
exports.signin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({
    where: {
      email
    }
  })
    .then(user => {
      // Email validation
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      // Password Validation
      const passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({
          message: "Invalid Password!"
        });
      }

      res.status(200).send({ user });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const { id } = req.params;

  User.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id
      });
    });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  User.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tutorial was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Tutorial with id=" + id
      });
    });
};

// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Tutorial was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Tutorial with id=" + id
      });
    });
};

// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
  User.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Tutorials were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials."
      });
    });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
  User.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};
