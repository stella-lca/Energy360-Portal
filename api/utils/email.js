const sgMail = require("@sendgrid/mail");

const {
	APPSETTING_HOST,
	APPSETTING_ADMIN_EMAIL,
	APPSETTING_SENDGRID_API_KEY
} = process.env;

sgMail.setApiKey(APPSETTING_SENDGRID_API_KEY);

const generateEmailBody = token => {
	const resetPasswordURL = `${APPSETTING_HOST}/reset-password?token=${token}`;
	return `<style>h2{color:green;}#container{position:relative;padding:20px;margin:20pxauto;max-width:500px;border:3pxsolid#f1f1f1;}.form-group{margin:10px}</style><div id="container"><div class="text-center"><img class="d-blockmx-automb-4" src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG" alt="logo" class="d-block"/><div><p>You requested forapassword reset, kindly use this <a href="${resetPasswordURL}">Link</a> to reset your password</p><br></div></div><p>Very Truly Yours,<br>GreenConnect EntrepreneurPortal</p></div>`;
};

exports.sendEmail = async (email, token, res) => {
	const emailBody = generateEmailBody(token);
	const msg = {
		to: email,
		from: APPSETTING_ADMIN_EMAIL,
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
				from: APPSETTING_ADMIN_EMAIL,
				sendgrid: APPSETTING_SENDGRID_API_KEY
			};
			res.send(result);
		})
		.catch(err => {
			res.status(404).send(err);
		});
};
