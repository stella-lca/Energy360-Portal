const express = require('express');
const app = express();
const path = require('path');
const session =  require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const jwt = require("jwt-simple");
const authController = require('../controllers/auth-controller')
const registerController = require('../controllers/register-controller')
const {findUser, findByToken} = require('../server/model/User') 
const verify = require("./routes/verifyToken");

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.json());

// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge:60000}
// }))

 app.get('/signup', function (req, res) {  
    res.sendFile(path.join(__dirname, '../view/register.html'));
 }) 

//  app.use((req, res, next) => {
//     const auth = req.headers.authorization;
  
//     if (!auth) {
//       return next();
//     }
  
//     const { id } = jwt.decode(auth, process.env.SESSION_SECRET);
  
//     User.findByPk(id)
//       .then(user => {
//         req.user = user.dataValues;
//         next();
//       })
//       .catch(next);
//   });

// //Middleware for Authorization
app.use( async (req,res,next) => {
  const {authorization} = req.headers
  console.log('auth--->', authorization)

  if(!authorization){
    return next();
  } 
  
  findByToken(authorization)
  .then(user => {
    req.user = user;
    next()
  })
  .catch(next)
  
})

app.get('/', (req, res, next) => {
  console.log('request user info', req)
  if(req.user){
    console.log('successful')
      res.sendFile(path.join(__dirname, '../view/home.html'))
  }else{
    console.log('no user')
    res.sendFile(path.join(__dirname, '../view/login.html'))
  }
})

/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authController.authenticate);
 
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authController.authenticate);

app.get('/logout', (req, res, next) => {
    // req.session.destroy();
    // res.end(`You are logged out.`)
    req.removeHeader('authorization')
    res.redirect("/")
})

app.post('/api/sessions', (req, res, next) => {
    const user = req.body;

    findUser(user.email) 
    .then((users) => {
      if (users.length > 0 ) {
        const token = jwt.encode({id: user.id}, process.env.JWT_SECRET)
        return res.status(200).send({ token });
      }
      throw { status: 401 };
    })
    .catch((err) => next(err));
});

app.get('/api/sessions', (req, res,next) => {

  if(req.headers.authorization){
    res.end();
  } 
  next({status:401})
})

module.exports = app