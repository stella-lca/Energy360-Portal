const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const authController = require('../controllers/auth-controller')
const registerController = require('../controllers/register-controller')
const redirectController = require('../controllers/redirect-controller')
const redirectBackController = require('../controllers/redirect-back-controller')
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

/* Home */
app.get('/home', verify, (req, res) => {
    console.log('home session',req.session)
    res.status(200).sendFile(path.join(__dirname, '../view/home.html'))
})

/* redirect to utility website */
app.get('/utility/callback', verify, redirectController.redirect)


/* Scope Selection URI */
app.get('/scope-selection', verify, (req, res) => {
  
  console.log(req.query)
  if(req.session && req.session.user){
    const keys = ['accountid', 'startdate', 'enddate', 'DataCustodianID'];
  keys.map( key => req.session.user[key] = req.query[key])
  }
  
  console.log(req.session.user)

  res.status(200).sendFile(path.join(__dirname, '../view/scopeSelection.html'))

})

/* redirect back to utility website */
app.post('/utility/core-auth/callback', verify, redirectBackController.redirectBack)

/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authController.authenticate);
 

// app.post('/controllers/register-controller', registerController.register);
// app.post('/controllers/authenticate-controller', authController.authenticate);

/* Log out */
app.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect("/")
})

module.exports = app