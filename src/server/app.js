const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken')
const authController = require('../controllers/auth-controller')
const registerController = require('../controllers/register-controller')
const {findUser, findByToken} = require('../server/model/User') 
const verify = require("./routes/verifyToken");

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.json());


 app.get('/signup', function (req, res) {  
    res.sendFile(path.join(__dirname, '../view/register.html'));
 }) 

app.get('/', function (req, res) {  
  res.sendFile(path.join(__dirname, '../view/login.html'));
}) 

app.get('/api/:token', (req, res)=> {
  const token = req.params['token'].split('=')[1];
  console.log(token)
  jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
    if(err){
      res.sendStatus(403)
    }else{
      res.status(200).sendFile(path.join(__dirname, '../view/home.html'))
    }
  })
})

app.get('/api', (req,res) => {
  res.write('Welcome to the GreenConnect API');
})

/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authController.authenticate);
 
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authController.authenticate);

/* Log out */
app.get('/logout', (req, res, next) => {
    // res.end(`You are logged out.`)
    res.redirect("/")
})


// app.post('/api/sessions', (req, res, next) => {
//     const user = req.body;

//     findUser(user.email) 
//     .then((users) => {
//       if (users.length > 0 ) {
//         const token = jwt.encode({id: user.id}, process.env.JWT_SECRET)
//         return res.status(200).send({ token });
//       }
//       throw { status: 401 };
//     })
//     .catch((err) => next(err));
// });

// app.get('/api/sessions', (req, res,next) => {
//   if(req.headers.authorization){
//     res.end();
//   } 
//   next({status:401})
// })

module.exports = app