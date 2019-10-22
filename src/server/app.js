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
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

 app.get('/signup', function (req, res) {  
    res.sendFile(path.join(__dirname, '../view/register.html'));
 }) 

app.get('/', function (req, res) {  
  res.sendFile(path.join(__dirname, '../view/login.html'));
}) 

app.get('/api', verify, (req,res) => {
    res.status(200).sendFile(path.join(__dirname, '../view/home.html'))
})

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