const axios = require("axios");
const moment = require("moment");
const AWS = require("aws-sdk");
const async = require("async");
const { sendAdminEmail, sendNotifyEmail, sendUserEmail } = require('../utils/email');
const { downloadFile } = require('../utils/downloadFile');
const { addLog, createLogItem } = require('../utils/errorTacker');
const { findNestedObj } = require('../utils/utils');

const {
	Token: { findByToken, createToken, updateToken },
	Log: { findAllLog, createLog, findLog }
} = require("../models");

const {
	APPSETTING_HOST,
	APPSETTING_CLIENT_ID,
	APPSETTING_CLIENT_SECRET,
	APPSETTING_SUBSCRIPTION_KEY,
} = process.env;

const config = {
	bucketName: "increase-prod-logs",
	region: "us-west-2",
	accessKeyId: "dd",
	secretAccessKey: "ad",
};

const s3bucket = new AWS.S3(config);

const handleToken = async function (authCode, tokenData) {
	let token = await findByToken(authCode);
	const expiryDate = moment().add(1, "hours").format();

	console.log('existing token ===>', token)
	var msg = token !== undefined ? "Token already existed" : "Creating new token";
	createLogItem(true, "Token Management", msg);

	tokenData.expiry_date = expiryDate;
	const {
		access_token,
		refresh_token,
		expires_in,
		expiry_date,
		scope,
		resourceURI,
		authorizationURI,
		accountNumber,
	} = tokenData;

	if (!access_token) {
		createLogItem(true, "Token Management", 'Token API ERROR');
		return false;
	}

	try {
		let status;
		if (token !== undefined && token.access_token) {
			// if (moment(token.expiry_date) < moment()) {
			status = await updateToken(authCode, {
				access_token,
				refresh_token,
				expires_in,
				expiry_date,
			});

			console.log("updated token ===>", token)
			msg = status ? "Token updated successfully" : "Token updating error";
			createLogItem(true, "Token Management", msg, JSON.stringify(token));

			return token;
		} else {
			//save new token.
			status = await createToken({
				authCode,
				access_token,
				refresh_token,
				expires_in,
				scope,
				resourceURI,
				authorizationURI,
				accountNumber,
				expiry_date,
			});

			console.log("created token status ===>", status)
			msg = status ? "Token created successfully" : "Token creating - Query Error";
			createLogItem(true, "Token Management", msg, JSON.stringify(token));

			return token;
		}
	} catch (error) {
		console.log("Token handling issue", error);
		const errorJson = (error && error.response) ? error.response.data : error;
		createLogItem(false, "Token Management", "Token handling issue", JSON.stringify(errorJson));

		return false;
	}
};

exports.authenticateToken = async function (req, res) {
	//authorization code generated & sent by Utility
	const { code } = req.query;

	const headers = {
		"content-type": "application/json",
		"ocp-apim-subscription-key": APPSETTING_SUBSCRIPTION_KEY,
	};

	const data = {
		grantType: "authorization_code",
		clientId: APPSETTING_CLIENT_ID,
		clientSecret: APPSETTING_CLIENT_SECRET,
		redirectUri: `${APPSETTING_HOST}/auth/callback`,
		authCode: code,
	};


	axios
		.post("https://apit.coned.com/gbc/v1/oauth/v1/Token", data, {
			headers,
		})
		.then(async (response) => {
			console.log("Token API Response", response);
			createLogItem(true, "TOKEN API", "Token api working correctly", JSON.stringify(tokenData));

			const { data: tokenData } = response;
			const resultData = await handleToken(code, tokenData);

			if (resultData && resultData.access_token) {
				res.redirect("/callback?success=true");
			} else {
				res.redirect("/callback?success=false");
			}
		})
		.catch((error) => {
			const errorJson = (error && error.response) ? error.response.data : error;
			console.log("Token api processing error", error.response.data)
			createLogItem(false, "TOKEN API", "Token api processing error", JSON.stringify(errorJson));
			res.redirect("/callback?success=false");
		});
};

exports.notifyCallback = async function (req, res) {
	try {
		// const list = await findAllLog();
		console.log("Utilify API REQUEST ===>", req.body);
		createLogItem(true, "Utility API Response", "Got the Utility Notify Request TEST", JSON.stringify(req.body));

		let fileUrls = findNestedObj(req.body, 'espi:resources');
		createLogItem(true, "Utility API Response", "Got the Utility Notify Request", JSON.stringify(fileUrls));

		if (fileUrls !== undefined) {
			if(typeof(fileUrls) === 'string') fileUrls = [fileUrls];

			async.mapLimit(fileUrls, 5, async function (url) {
				return new Promise((resolve, reject) => {
					downloadFile(url, resolve)
				})
			}, (err, results) => {
				// console.log("DownlkCaptureoaded ===>", results, err);
				if (err || results.includes(false)) {
					const errorJson = (error && error.response) ? error.response.data : error;
					sendAdminEmail({ content: 'Received the utility callback, but contents error', subject: 'GreenConnect - Utility API Response' })
					createLogItem(false, "Utility API Response", "Received the utility callback, but contents error", JSON.stringify(errorJson));
					res.status(500).send('error');
				} else {
					sendUserEmail({ content: {files: fileUrls}, subject: 'GreenConnect - Utility API Response' });
					createLogItem(true, "Utility API Response", "Proceed the utility callback successfully", JSON.stringify(fileUrls));
					res.status(200).send('ok');
				}
			})
		} else {
			sendAdminEmail({ content: 'Received the utility callback, content is empty', subject: 'GreenConnect - Utility API Response' })
			createLogItem(true, "GreenConnect - Utility API Response", "Received the utility callback, content is empty", JSON.stringify(fileUrls));
			res.status(200).send('ok');
		}

		await createLog({
			content: fileUrls && fileUrls.join(','),
			status: true
		})
	} catch (error) {
		console.log("Utility Notify Callback Error", error)
		try {
			const errorJson = (error && error.response) ? error.response.data : error;
			sendAdminEmail({ content: 'Utility callback error', subject: 'GreenConnect - Utility API Response' })
			createLogItem(true, "Utility API Response", "Utility Notify Callback error", JSON.stringify(error));

			await createLog({
				content: JSON.stringify(fileUrls),
				status: false
			})
			res.status(500).end('internal server error');
		}
		catch (e) {
			console.log("Utility Notify Callback Error", e)
			throw e;
		}
	}
};
