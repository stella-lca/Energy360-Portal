const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const authController = require('../controllers/auth-controller')
const registerController = require('../controllers/register-controller')
const redirectController = require('../controllers/redirect-controller')
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
app.get('/utilityProvider', verify, redirectController.redirect)

/* Scope Selection URI */
app.get('/api/scope-selection', (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, '../view/scopeSelection.html'))
})

/* redirect back to utility website */
app.post('/api/redirect-back', (req, res) => {
  const ceconyRedirectBackURL = `https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${process.env.GREENCONNECT_ID}`
  const oruRedirectBackURL = `https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${process.env.GREENCONNECT_ID}`
  
  if(utilityProvider === 'CECONY'){
    res.send('This will be redirect to :'+ ceconyRedirectBackURL)
    // res.redirect(CECONY_redir)
  } else if(utilityProvider === 'ORU'){
    res.send('This will be redirect to :'+ oruRedirectBackURL)
    // res.redirect(ORU_redir)
  }

  // res.status(500)
  // res.render('error', { error: err })
})

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