const express = require('express');
const app = express();
const path = require('path');
const session =  require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const jwt = require("jwt-simple");
const authController = require('../controllers/auth-controller')
const registerController = require('../controllers/register-controller')
const {findUser} = require('../server/model/User') 

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge:60000}
}))

// app.get('/signin', function (req, res) {  
//     res.sendFile(path.join(__dirname, '../view/index.html'));
//  }) 
 
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

app.get('/', (req, res, next) => {

  // res.setHeader('Content-type', 'text/html')
  
  if(req.session.token){
      res.sendFile(path.join(__dirname, '../view/home.html'))
  }else{
    res.sendFile(path.join(__dirname, '../view/login.html'))
  }

    // if(req.session.views){
    //     req.session.views++
    //     res.setHeader('Content-type', 'text/html')
        
    //     res.write(`<p>views: ${req.session.views}</p>`)
    //     res.write('<p>expire in: '+ (req.session.cookie.maxAge / 1000)+'s</p>')
    //     res.end()
    // } else {
    //     req.session.views=1;
    //     res.end('Welcome to GreenConnect!')
    // }
// console.log(__dirname)
// res.sendFile(path.join(__dirname, '../view/index.html'));
    // res.sendFile(path.join(__dirname,'index.html'));
})

/* route to handle login and registration */
app.post('/api/register', registerController.register);
app.post('/api/authenticate', authController.authenticate);
 
app.post('/controllers/register-controller', registerController.register);
app.post('/controllers/authenticate-controller', authController.authenticate);

app.get('/logout', (req, res, next) => {
    req.session.destroy();
    // res.end(`You are logged out.`)
      res.redirect("/")
})

app.post('/api/sessions', (req, res, next) => {
    const user = req.body;

    findUser(user.email) 
      .then((_user) => {
        if (!_user) {
          throw { status: 401 };
        }
        const token = jwt.encode({id:_user.id}, process.env.JWT_SECRET)

        return res.status(200).send({ token });
      })
      .catch((err) => next(err));
});

module.exports = app