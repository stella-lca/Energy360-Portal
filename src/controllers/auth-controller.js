const { findUser } = require("../server/model/User");
const bcrypt = require("bcrypt");
const axios = require("axios");
const sequelize = require("../server/model/db");
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv').config();

module.exports.authenticate = function(req, res) {
  const { email, password } = req.body;

  findUser(email)
    .then(users => {
      if (users.length > 0) {
        if (bcrypt.compareSync(password, users[0].password)) {
          jwt.sign({user: users[0]}, process.env.JWT_SECRET, {expiresIn: '1h'}, (err, token) => {
            // res.json({
            //   token
            // })
            
            // res.redirect(`/api/token=${token}`)
            const {firstName, lastName, email, accountTypeDetail} = users[0];
            const user = {firstName, lastName, email, accountTypeDetail}
            req.session.loggedIn = true;
            req.session.token = token;
            req.session.user = user;
            // req.session.user.accountTypeDetail = users[0].accountTypeDetail
            // req.session.user = users[0]

            // const keys = ['firstName', 'lastName', 'email', 'accountTypeDetail']
            // keys.map(key => req.session.user[key] = users[0][key])

            // console.log('authcontroll session --->', req.session)
            // if(req.session.scopeSelection){
            //   req.session.scopeSelection = false
            //     res.redirect('/scope-selection') 
            // } else {
            //   res.redirect('/home')
            // }
            const redirectUrl = req.session.redirectUrl || '/home';
            delete req.session.redirectUrl;
            res.redirect(redirectUrl);

          })
        } else {
          res.status(403)
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