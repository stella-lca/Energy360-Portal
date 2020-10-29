const axios = require("axios");
const moment = require("moment");
const AWS = require("aws-sdk");
const async = require("async");
const { sendAdminEmail } = require('../utils/email');
const { downloadFile } = require('../utils/downloadFile');
const { addLog } = require('../utils/errorTacker');

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

	// console.log('existing token ===>', token)
	addLog("token already existed", token)

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

			// console.log("updated token ===>", token)
			const msg = status ? "Token updated successfully" : "Token updating error";
			addLog(msg, token);
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

			// console.log("created token ===>", token)
			const msg = status ? "Token created successfully" : "Token createing - Query Error";
			addLog(msg, status);
		}
		status ? res.status(200).end() : res.status(205).end();
	} catch (error) {
		console.log(error);
		res.status(500).end()
	}
};

exports.authenticateToken = function (req, res) {
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
			const { data: tokenData } = response;
			addLog("Token api working correctly", response.data)
			const resultData = await handleToken(code, tokenData);

			if (resultData && resultData.access_token) {
				res.redirect("/callback?success=true");
			} else {
				res.redirect("/callback?success=false");
			}
		})
		.catch((err) => {
			res.redirect("/callback?success=false");
			addLog("token api process error", data, err)
		});
};

exports.notifyCallback = async function (req, res) {
	try {

		// const list = await findAllLog();
		// console.log("log list ===>", list)

		const body = req.body;
		let fileUrls = [];
		if (body) {
			fileUrls = body['espi:batchlist']['espi:resources'];
		}

		if (fileUrls.length > 0) {
			async.mapLimit(fileUrls, 5, async function (url) {
				return new Promise((resolve, reject) => {
					downloadFile(url, resolve)
				})
			}, (err, results) => {
				if (err || results.includes(false)) {
					sendAdminEmail('Received the utility callback, but contents error', 'GreenConnect - Utility API Response')
					addLog('Received the utility callback, but contents error');
					res.status(500).send();
				} else {
					sendAdminEmail('Proceed the utility callback successfully', 'GreenConnect - Utility API Response')
					addLog('Proceed the utility callback successfully', fileUrls);
					res.status(200).send();
				}
			})
		} else {
			sendAdminEmail('Received the utility callback, content is empty', 'GreenConnect - Utility API Response')
			addLog('Received the utility callback, content is empty', fileUrls);
			res.status(200).send("ok");
		}
		
		await createLog({
			content: fileUrls && fileUrls.join(','),
			status: true
		})
	} catch (error) {
		sendAdminEmail('Utility callback error', 'GreenConnect - Utility API Response')
		addLog('Utility callback error')
		await createLog({
			content: JSON.stringify(fileUrls),
			status: false
		})
		res.status(500).end('internal server error');
	}
};


