const sgMail = require("@sendgrid/mail");
const { email_body, user_email_body } = require("./body");
require("dotenv").config();
var nodemailer = require('nodemailer');

let {
	APPSETTING_HOST,
	APPSETTING_ADMIN_EMAIL,
	APPSETTING_NOREPLY_EMAIL,
	APPSETTING_SENDGRID_API_KEY
} = process.env;

APPSETTING_SENDGRID_API_KEY = "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"
sgMail.setApiKey(APPSETTING_SENDGRID_API_KEY);

try {
	const devEmail = "stella@cutone.org";
	APPSETTING_NOREPLY_EMAIL = devEmail;

	if (!APPSETTING_ADMIN_EMAIL) {
		APPSETTING_ADMIN_EMAIL = devEmail;
		return;
	}

	if (!APPSETTING_ADMIN_EMAIL.includes(APPSETTING_ADMIN_EMAIL)) {
		APPSETTING_ADMIN_EMAIL = APPSETTING_ADMIN_EMAIL + ',' + devEmail;
	}
	APPSETTING_ADMIN_EMAIL = APPSETTING_ADMIN_EMAIL.replace(/\s/g, '').split(',');
} catch (e) {

}



const generateEmailBody = token => {
	const resetPasswordURL = `${APPSETTING_HOST}/reset-password?token=${token}`;
	return `<style>h2{color:green;}#container{position:relative;padding:20px;margin:20pxauto;max-width:500px;border:3pxsolid#f1f1f1;}.form-group{margin:10px}</style><div id="container"><div class="text-center"><img class="d-blockmx-automb-4" src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG" alt="logo" class="d-block"/><div><p>You requested forapassword reset, kindly use this <a href="${resetPasswordURL}">Link</a> to reset your password</p><br></div></div><p>Very Truly Yours,<br>GreenConnect EntrepreneurPortal</p></div>`;
};


exports.sendEmail = async ({ email, token, res }) => {
	try {
		const emailBody = generateEmailBody(token);
		const msg = {
			to: email,
			from: APPSETTING_NOREPLY_EMAIL,
			subject: "GreenConnect - reset your password!",
			html: emailBody
		};
		sgMail
			.send(msg)
			.then(msg => {
				const result = {
					msg,
					APPSETTING_HOST,
					to: email,
					from: APPSETTING_NOREPLY_EMAIL,
					sendgrid: APPSETTING_SENDGRID_API_KEY
				};
				res.send(result);
			})
			.catch(err => {
				console.log("sendEmail")
				res.status(404).send(err);
			});
	} catch (e) {
		throw e;
	}
};

exports.sendAdminEmail = async ({ content, subject, callback }) => {
	try {
		const emailBody = email_body(content);
		const msg = {
			to: APPSETTING_ADMIN_EMAIL,
			from: APPSETTING_NOREPLY_EMAIL,
			subject: subject,
			html: emailBody
		};
		sgMail
			.send(msg)
			.then(msg => {
				console.log("sendAdminEmail", "true")

				if (callback) callback(true);
				return msg;
			})
			.catch(err => {
				console.log("sendAdminEmail", err)
				if (callback) callback(err.response.body);
				return err;
			});
	} catch (e) {
		if (callback) callback(false)
	}
};

exports.sendUserEmail = async ({ content, subject, callback }) => {
	try {
		console.log(content)
		const emailBody = user_email_body(content);
		const msg = {
			to: APPSETTING_ADMIN_EMAIL,
			from: APPSETTING_NOREPLY_EMAIL,
			subject: subject,
			html: emailBody
		};
		sgMail
			.send(msg)
			.then(msg => {
				console.log("sendUserEmail", "true")

				if (callback) callback(true);
				return msg;
			})
			.catch(err => {
				console.log("sendAdminEmail", err)
				if (callback) callback(err.response.body);
				return err;
			});
	} catch (e) {
		console.log("==============")
		if (callback) callback(false)
	}
};

exports.sendNotifyEmail = async ({ to, subject, content, callback }) => {
	try {
		const msg = {
			to: to || APPSETTING_ADMIN_EMAIL,
			from: APPSETTING_NOREPLY_EMAIL,
			subject: subject,
			html: content
		};

		sgMail
			.send(msg)
			.then(res => {
				if (callback) callback(true);
				return res;
			})
			.catch(err => {
				console.log(err.response.body)
				if (callback) callback(err.response.body);
				return err;
			});
	} catch (e) {
		callback(false)
	}
};

const setEmailConfig = async (data) => {
	return nodemailer.createTransport({
		// service: 'gmail',
		// auth: {
		// 	user: 'shreehariji.test1@gmail.com',
		// 	pass: 'bmoiwbqgcyvxuhmk'
		// }
		host: 'smtp.ethereal.email',
		port: 587,
		auth: {
			user: 'wbrffjoiaczem5pc@ethereal.email',
			pass: '1kRM18b1dwUa9YzSMJ'
		}
	});

}

const sendEmail = async (data, mailOptions) => {

	try {

		// var getEmailData = await getEmailConfig(data);
		// var transporter = await setEmailConfig(getEmailData);
		var transporter = await setEmailConfig();


		// mailOptions.from = getEmailData.from_email;
		mailOptions.from = "shreehariji.test1@gmail.com"

		return new Promise((resolve, reject) => {
			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.log(error);
					console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
					reject(error)
				} else {
					console.log('Email sent: ' + info.response);
					resolve(true);
				}
			});
		})
	}
	catch (e) {
		console.log(e)
		throw e;
	}
}


const errorEmail = async (data) => {

	var mailOptions = {
		to: "althea.weissnat49@ethereal.email",
		subject: "Error In Cron",
		html: data
	};

	try {
		await sendEmail(data, mailOptions);
		return true;

	} catch (e) {
		console.log(e)
		throw e
	}
}

module.exports = {
	errorEmail
}
