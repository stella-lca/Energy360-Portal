const axios = require("axios");
const moment = require("moment");
const AWS = require("aws-sdk");
const fs = require("fs");

const {
	Token: {
		findByToken,
		createToken,
		updateToken
	},
} = require("../models");

const {
	APPSETTING_HOST,
	APPSETTING_CLIENT_ID,
	APPSETTING_CLIENT_SECRET,
	APPSETTING_SUBSCRIPTION_KEY,
} = process.env;

const config = {
	bucketName: "greenconnect-logs",
	region: "us-east-1",
	accessKeyId: "AKIAJYI6ZE6ZJLUHEKDQ",
	secretAccessKey: "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",
};

const s3bucket = new AWS.S3(config);

const handleToken = async function (authCode, tokenData) {
	const token = await findByToken(authCode);
	const expiryDate = moment().add(1, "hours").format();

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
		if (token !== undefined) {
			if (moment(token.expiry_date) < moment()) {
				await updateToken(authCode, {
					access_token,
					refresh_token,
					expires_in,
					expiry_date,
				});
			}
		} else {
			//save new token.
			await createToken({
				authCode,
				access_token,
				refresh_token,
				expires_in,
				scope,
				resourceURI,
				authorizationURI,
				accountNumber,
				expiry_date
			});
		}
		return tokenData;
	} catch (error) {
		throw error;
	}
};

exports.authenticateToken = function (req, res) {
	//authorization code generated & sent by Utility
	const {
		code
	} = req.query;

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
		.post("https://medopad.s3-eu-west-1.amazonaws.com/PatietDetail.json", data, {
			headers
		})
		.then(async (response) => {
			const {
				data: tokenData
			} = response;

			const resultData = await handleToken(code, tokenData)

			if (resultData) {
				res.redirect('/callback?success=true');
			} else {
				res.redirect('/callback?success=false');
			}

			module.exports.errorTracker({
				...req,
				body: {
					...data,
					state_point: "token api working correctly"
				},
				result: JSON.stringify(response.data),
			});
		})
		.catch((err) => {
			res.redirect('/callback?success=false');
			// res.status(202).json({
			// 	message: `token api api ==>, ${err.stack}`
			// })

			module.exports.errorTracker({
				...req,
				body: {
					...data,
					state_point: "token api error"
				},
				error: err,
			});
		});
};

exports.errorTracker = (req, res, next) => {
	const {
		query,
		body,
		originalUrl,
		result,
		error
	} = req;
	const date = moment().format("MM-DD-YYYY-h:mm:ss");
	const data1 = moment().format("YYYY-MM-DD");
	const logDir = `log/`;
	const fileName =
		originalUrl.replace(/\//g, "-").substring(1) + "=>" + date + ".json";

	if (/\.jpg|\.png|\.ico|\.js/.exec(originalUrl)) {
		return false;
	}

	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir);
	}

	var jsonContent = {
		query,
		body,
		url: originalUrl,
		result,
		error,
	};

	fs.writeFile(
		`log/${fileName}`,
		JSON.stringify(jsonContent),
		"utf8",
		function (err) {
			if (err) {
				console.log("An error occured while writing JSON Object to File.");
				return console.log(err);
			}
			const fileContent = fs.readFileSync(`log/${fileName}`);

			var params = {
				Bucket: "greenconnect-logs",
				Key: `${data1}/${fileName}`, //file.name doesn't exist as a property
				Body: fileContent,
			};

			s3bucket.upload(params, function (err, {
				Location
			}) {
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