const { findUser } = require("../server/model/User");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv').config();
const nodeoutlook = require('nodejs-nodemailer-outlook');
const async = require('async');

const emailBody = `<style>
h2 {
color: green;
}

#container {
position: relative;
padding: 20px;
margin: 20px auto;
max-width: 500px;
border: 3px solid #f1f1f1;
}

.form-group {
margin:10px
}
</style>                         
<div id="container">
<div class="text-center">
    <img
        class="d-block mx-auto mb-4"
        src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG"
        alt="logo"
        class="d-block"
    />
    <div>
        <p>You requested for a password reset, kindly use this <a href="{{url}}">link</a> to reset your password</p>
        <br>
        
    </div>
</div>
<p>Very Truly Yours, <br>
    Green Connect Entrepreneur Portal
</p>
</div>`

exports.forgotPassword = function(req, res) {
    async.waterfall([
      function(done) {
        findUser(req.body.email)
        .exec(function(err, users) {
            const user = users[0]
          if (user) {
            done(err, user);
          } else {
            done('User not found.');
          }
        });
      },
      function(user, done) {
        // create the reset password token
        const salt = bcrypt.genSaltSync(process.env.SALT_ROUNDS * 1);
        const passwordResetToken = bcrypt.hashSync(process.env.RESET_PASSWORD, salt);
        done(err, user, passwordResetToken);
      },
      function(user, token, done) {
        updateUser(user.id, {resetPasswordToken: token, resetPasswordExpires: Date.now() + 86400000})
        .exec(function(err, new_user) {
          done(err, token, new_user);
        });
      },
      function(token, user, done) {
        //gmail with nodemailer-express-handlebars
        // var data = {
        //   to: user.email,
        //   from: process.env.ADMIN_EMAIL,
        //   template: 'forgot-password-email',
        //   subject: 'GreenConnect - reset your password!',
        //   context: {
        //     url: 'http://localhost:3000/reset_password?token=' + token,
        //     name: user.firstName
        //   }
        // };
        // smtpTransport.sendMail(data, function(err) {
        //   if (!err) {
        //     return res.json({ message: 'Kindly check your email for further instructions' });
        //   } else {
        //     return done(err);
        //   }
        // });

        // Send email using nodemailer-outlook
        nodeoutlook.sendEmail({
            auth: {
                user: process.env.ADMIN_EMAIL,
                pass: process.env.ADMIN_PASSWORD
            },
            from: process.env.ADMIN_EMAIL,
            to: user.email,
            subject: 'GreenConnect - reset your password!',
            html: emailBody,
            replyTo: process.env.ADMIN_EMAIL,
            onError: (err) => done(err),
            onSuccess: () => res.json({ message: 'Kindly check your email for further instructions' })
        });
      }
    ], function(err) {
      return res.status(422).json({ message: err });
    });
  };