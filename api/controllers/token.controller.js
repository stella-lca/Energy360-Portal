const axios = require("axios");
const moment = require("moment");
const AWS = require("aws-sdk");
const fs = require("fs");

const {
	Token: { findByToken, createToken, updateToken }
} = require("../models");

const {
	APPSETTING_HOST,
	APPSETTING_CLIENT_ID,
	APPSETTING_CLIENT_SECRET,
	APPSETTING_SUBSCRIPTION_KEY
} = process.env;

const config = {
	bucketName: "greenconnect-logs",
	region: "us-east-1",
	accessKeyId: "AKIAJYI6ZE6ZJLUHEKDQ",
	secretAccessKey: "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"
};

const s3bucket = new AWS.S3(config);

const handleToken = async function(authCode, tokenData) {
	const token = await findByToken(authCode);
	const expiryDate = moment()
		.add(1, "hours")
		.format("YYYY-MM-DD HH:MM:SS");

	tokenData.expiry_date = expiryDate;

	const {
		access_token,
		refresh_token,
		expires_in,
		expiry_date,
		scope,
		resourceURI,
		authorizationURI,
		accountNumber
	} = tokenData;

	try {
		if (token !== undefined) {
			if (moment(token.expiry_date) < moment()) {
				//expired. update the record
				await updateToken(authCode, {
					access_token,
					refresh_token,
					expires_in,
					expiry_date
				});
			}
		} else {
			//save new token.
			await createToken({
				authCode,
				access_token,
				refresh_token,
				expires_in,
				expiry_date,
				scope,
				resourceURI,
				authorizationURI,
				accountNumber
			});
		}
		return tokenData;
	} catch (error) {
		throw error;
	}
};

exports.authenticateToken = async function(req, res) {
	//authorization code generated & sent by Utility
	const { code } = req.query;

	const headers = {
		"content-type": "application/json",
		"ocp-apim-subscription-key": APPSETTING_SUBSCRIPTION_KEY
	};

	const data = {
		grantType: "authorization_code",
		clientId: APPSETTING_CLIENT_ID,
		clientSecret: APPSETTING_CLIENT_SECRET,
		// redirectUri: `${APPSETTING_HOST}/api/auth/token-data`,
		redirectUri: `${APPSETTING_HOST}/auth/callback`,
		authCode: code
	};

	axios
		.post("https://apit.coned.com/gbc/v1/oauth/v1/Token", data, { headers })
		.then(response => response.data)
		.then(async tokenData => await handleToken(authCode, tokenData))
		.then(tokenData => {
			res.json({
				status: 200,
				message: "Successful. Token data has saved",
				data: tokenData,
				requestHeaders: headers,
				requestBody: data
			});
		})
		// .then(tokenData => req.session.shareMyDataToken = tokenData)
		.catch(err => {
			console.log(err);
			res.json({
				status: false,
				message: err.response.data,
				requestHeaders: headers,
				requestBody: data
			});
		});
};

exports.errorTracker = (req, res, next) => {
	const { headers, query, body, originalUrl } = req;
	const data = moment().format("MMM-Do-YYYY-h-mm");
	const logDir = `log/${data}`;
	const fileNameName = originalUrl.replace(/\//g, "-").substring(1) + ".json";
	const newFileName = `${data}/${fileNameName}`;

	var jsonContent = { query, body, url: originalUrl, headers };

	if (/\.jpg|\.png|\.js/.exec(originalUrl)) {
		return false;
	}

	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir);
	}

	var jsonContent = { query, body, url: originalUrl };

	fs.writeFile(
		`log/${newFileName}`,
		JSON.stringify(jsonContent),
		"utf8",
		function(err) {
			if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
			const fileContent = fs.readFileSync(`log/${newFileName}`);

			var params = {
				Bucket: "greenconnect-logs",
				Key: `${newFileName}`, //file.name doesn't exist as a property
				Body: fileContent
			};

			s3bucket.upload(params, function(err, { Location }) {
				if (err) {
					console.log(err);
					// res.status(500).send(err);
				} else {
					console.log(Location);
					// res.status(200).end();
				}
			});
			console.log("JSON file has been saved.");
		}
	);
};
