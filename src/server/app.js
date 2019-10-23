const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const authController = require('../controllers/auth-controller')
const registerController = require('../controllers/register-controller')
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
  cookie: { maxAge:60000}
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
    res.status(200).sendFile(path.join(__dirname, '../view/home.html'))
})


/* redirect to utility website */
app.get('/utilityProvider', verify, (req, res) => {
  console.log(req.session)
  const utilityProvider = req.session.accountType;
  const CECONY_redir = `https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${process.env.GreenConnect_ID}`; 
  const ORU_redir = `https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${process.env.GreenConnect_ID}`; 
 

  if(utilityProvider === 'CECONY'){
    res.send('This will be redirect to :'+ CECONY_redir)
    // res.redirect(CECONY_redir)
  } else if(utilityProvider === 'ORU'){
    res.send('This will be redirect to :'+ ORU_redir)
    // res.redirect(ORU_redir)
  }

  // res.status(500)
  // res.render('error', { error: err })
  
})

/* Scope Selection URI */
app.get('/api/scope')

/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authController.authenticate);
 
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authController.authenticate);

/* Log out */
app.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.redirect("/")
})

module.exports = app