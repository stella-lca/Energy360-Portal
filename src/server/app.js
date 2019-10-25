const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const authController = require('../controllers/auth-controller')
const registerController = require('../controllers/register-controller')
const redirectController = require('../controllers/redirect-controller')
const redirectBackController = require('../controllers/redirect-back-controller')
const tokenController = require('../controllers/token-controller')
const resetPasswordController = require('../controllers/reset-pw-controller')
const verify = require("./routes/verifyToken");
const session = require('express-session')

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.json());

//need to revise secret & expire
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge:600000} // 10 mins
}))

/* Register */
 app.get('/signup', function (req, res) {  
    res.sendFile(path.join(__dirname, '../view/register.html'));
 }) 

 /* Login */
app.get('/', function (req, res) {  
  res.sendFile(path.join(__dirname, '../view/login.html'));
}) 

/* Forgot my password*/
app.get('/forgot-my-password', (req, res) =>{
  res.sendFile(path.join(__dirname, '../view/forgot-password.html'));
})

/* Send email to reset password*/
app.post('/forgot-my-password/', resetPasswordController.forgotPassword)

/* Reset my password */
app.get('/reset-password', (req, res) =>{
  res.sendFile(path.join(__dirname, '../view/reset-password.html'));
})

/* Home */
app.get('/home', verify, (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '../view/home.html'))
})

/* redirect to utility website */
app.get('/utility/callback', verify, redirectController.redirect)


/* 
Scope Selection URI 
example: http://localhost:3000/scope-selection/?accountid=159&startdate=05/21/2019&enddate=12/21/2019&DataCustodianID=ConEdison
*/

app.get('/scope-selection', verify, (req, res) => {
  
  if(req.session && req.session.user){
    const keys = ['accountid', 'startdate', 'enddate', 'DataCustodianID'];
    keys.map( key => req.session.user[key] = req.query[key])
  }

  res.status(200).sendFile(path.join(__dirname, '../view/scopeSelection.html'))

})

/* redirect customer back to utility website */
app.post('/scope-selection/callback', verify, redirectBackController.redirectBack)

/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authController.authenticate);

/* Utility sends generated authorization code */
app.get('/auth/callback', tokenController.authenticateToken);

/* Log out */
app.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.status(200).redirect("/")
})

module.exports = app