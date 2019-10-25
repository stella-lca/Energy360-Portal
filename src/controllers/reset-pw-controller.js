/* Modify this for reset password controller*/

// const { findUser } = require("../server/model/User");
// const bcrypt = require("bcrypt");
// const dotenv = require('dotenv').config();
// const nodeoutlook = require('nodejs-nodemailer-outlook');
// const async = require('async');

// const generateEmailBody = (token) => {
//   const resetPasswordURL = `https://greenconnect-entrepreneur-portal-TestVer.azurewebsites.net/reset-password?token=${token}`
//   return `<style>
//   h2 {
//   color: green;
//   }

//   #container {
//   position: relative;
//   padding: 20px;
//   margin: 20px auto;
//   max-width: 500px;
//   border: 3px solid #f1f1f1;
//   }

//   .form-group {
//   margin:10px
//   }
//   </style>                         
//   <div id="container">
//   <div class="text-center">
//       <img
//           class="d-block mx-auto mb-4"
//           src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG"
//           alt="logo"
//           class="d-block"
//       />
//       <div>
//           <p>You requested for a password reset, kindly use this <a href="${resetPasswordURL}">link</a> to reset your password</p>
//           <br>
          
//       </div>
//   </div>
//   <p>Very Truly Yours, <br>
//       Green Connect Entrepreneur Portal
//   </p>
//   </div>`
// }

// exports.forgotPassword = function(req, res) {
//     async.waterfall([
//       function(done) {
//         findUser(req.body.email)
//         .then((users) => {
//           if(users.length>0){
//             const user = users[0]
//             done(null, user)
//           } else {
//             done('Not found. Email does not exist. ')
//           }
//         })
//       },
//       function(user, done) {
//         // create the reset password token
//         const salt = bcrypt.genSaltSync(process.env.APPSETTING_SALT_ROUNDS * 1);
//         const token = bcrypt.hashSync(process.env.APPSETTING_RESET_PASSWORD, salt);
//         done(null, user, token);
//       },
//       function(user, token, done) {
//         updateUser(user.id, {resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000})
//         .then(() =>{
//           done(null, token, user.email);
//         })
//       },
//       function(token, email, done) {
//         const emailBody = generateEmailBody(token)
//         nodeoutlook.sendEmail({
//             auth: {
//                 user: process.env.APPSETTING_ADMIN_EMAIL,
//                 pass: process.env.APPSETTING_ADMIN_PASSWORD
//             },
//             from: process.env.APPSETTING_ADMIN_EMAIL,
//             to: email,
//             subject: 'GreenConnect - reset your password!',
//             html: emailBody,
//             replyTo: process.env.APPSETTING_ADMIN_EMAIL,
//             onError: (err) => done(err),
//             onSuccess: () => res.send('Kindly check your email for further instructions')
//         });
//       }
//     ], function(err) {
//       return res.status(422).json({ message: err });
//     });
//   };
