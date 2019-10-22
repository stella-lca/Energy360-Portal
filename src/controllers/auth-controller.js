// const dotenv = require('dotenv');
const { findUser } = require("../server/model/User");
const bcrypt = require("bcrypt");
const axios = require("axios");
const sequelize = require("../server/model/db");

module.exports.authenticate = function(req, res) {
  const { email, password } = req.body;

  findUser(email)
    .then(users => {
      if (users.length > 0) {
        if (bcrypt.compareSync(password, users[0].password)) {
          axios.post("http://localhost:3000/api/sessions", users[0])
            .then(res => res.data.token)
            .then(async token => {
              await axios.get("http://localhost:3000/api/sessions",{
                headers: {
                  authorization: token
                }
              })
              res.redirect("/");
            })
            .catch(err => console.log(err));
        } else {
          res.json({
            status: false,
            message: "Error: email and password do not match"
          });
        }
      }
    })
    .catch(error =>
      res.json({
        status: false,
        message: error
      })
    );
};
