const nodeoutlook = require("nodejs-nodemailer-outlook");
const async = require("async");
const {
	APP_HOST,
	APPSETTING_ADMIN_EMAIL,
	APPSETTING_ADMIN_PASSWORD
} = process.env;

const generateEmailBody = token => {
	const resetPasswordURL = `${APP_HOST}/reset-password?token=${token}`;
	return `<style>h2{color:green;}#container{position:relative;padding:20px;margin:20pxauto;max-width:500px;border:3pxsolid#f1f1f1;}.form-group{margin:10px}</style><divid="container"><divclass="text-center"><imgclass="d-blockmx-automb-4"src="https://cutone.org/wp-content/themes/wp_lcassociates/img/GC-logo.PNG"alt="logo"class="d-block"/><div><p>Yourequestedforapasswordreset,kindlyusethis<ahref="${resetPasswordURL}">link</a>toresetyourpassword</p><br></div></div><p>VeryTrulyYours,<br>GreenConnectEntrepreneurPortal</p></div>`;
};

exports.sendEmail = async (email, token, res) => {
	const emailBody = generateEmailBody(token);
	nodeoutlook.sendEmail({
		auth: {
			user: APPSETTING_ADMIN_EMAIL,
			pass: APPSETTING_ADMIN_PASSWORD
		},
		from: APPSETTING_ADMIN_EMAIL,
		to: email,
		subject: "GreenConnect - reset your password!",
		html: emailBody,
		replyTo: APPSETTING_ADMIN_EMAIL,
		onError: err => res.status(404).send(false),
		onSuccess: msg => res.send(msg)
	});
};
