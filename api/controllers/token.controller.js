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
	let token = await findByToken(authCode);
	const expiryDate = moment().add(1, "hours").format();

	// console.log('existing token ===>', token)
	module.exports.errorTracker({
		body: {
			state_point: "token already existed"
		},
		result: JSON.stringify(token),
	});

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
		if (token !== undefined && token.access_token) {
			// if (moment(token.expiry_date) < moment()) {
			token = await updateToken(authCode, {
				access_token,
				refresh_token,
				expires_in,
				expiry_date,
			});

			// console.log("updated token ===>", token)

			module.exports.errorTracker({
				body: {
					state_point: token? "token updated successfully" : "token updating error"
				},
				result: JSON.stringify(token),
			});
			// }
		} else {
			//save new token.
			token = await createToken({
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

			// console.log("created token ===>", token)

			module.exports.errorTracker({
				body: {
					state_point: token && token.access_token? "token created successfully" : "token createing - Query Error"
				},
				result: JSON.stringify(token),
			});
		}
		return token;
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
		// .post("https://apit.coned.com/gbc/v1/oauth/v1/Token", data, {
		.get("https://medopad.s3-eu-west-1.amazonaws.com/PatietDetail.json", data, {
			headers
		})
		.then(async (response) => {
			response.data = {
				"access_token": "eyJrawQiOdJDTAREZGFFOFLOV3NPY1dQSGFoT1EsTLhOSIFIVIFFTCLObEwtsUxoQds4IiwivwxnIjoiUlMyNTVifQ.eyIJZZxTiOjEsImpaasIGIkFULKLIM@hfNHNpRISECVVIUDY422FJMWSMUDdNVMVzyNFN@ZmNNSnZXdG8uaJREMIdUZnBgektqviipjZ1hFTTNOQktidnRHaGVVWWEJjYm]jaGQINlgzdz@iLCIpc3Mi0iJodHRwezovL2NvbmVkLmordGFwemV2aWv3LeaNvbSovYXV@aDIvYXVZ0TJ2eDVnMzFRaHLyWWYwaDciLCJhdWQi0dJodHAwezovL2FwaxQuY29uZWQuY29tliwiaWFOljoxNTg3NTUxNJMZLCI1eHALOJELODCINTUyMzMsImNpZCI61jBvYWluZHpqZGZRTIVES1pLMGg3IiwidwlkIjoiMDB1b2s3bwhaZ250RnFPc2@waDciLCJzY3AiOlsiZGN4éLmdivySyZWFkX2NvbmS1lY3RNeURHdGELLCIKY3guZ2)jLnILYWRbwWruYWdlbWVudFJFULRTZXI2aWNlcy1sIm9mZmxpbmVFfYWNjZXNzliwZGN4LmdivySyZWFkX3B1dER1bGVOZUFIdGhvcml6YXRpb24iLCIkY3guZ2)LalYRfemvzb3Vy¥2VMZxZ1bFJFUIQILCIKY3guZ2]jLnILYWRECHVORGVSZXR1QXBwbG1JYXRpb25JbmZvemihdGlvbljle291emNlLiwiZGn4LmdivySyZWFkKX1IFULRmb3ICdbxrl1@sInN1Vil6éImhhbWFAY29uZWQuY29tIiwiYWNjb3VudHMiOlsiMTAwMDAxMzE4MjcxOzsxI119.PdéITzZ4T2on_3nbU@LOEavGu9LBnEwsnjQI]z6F_dEh3GbBZPqbTSdWLGSUTEGp1xhYHpU@G6xPOnBrs_lcpux2SNTuM@-1kH3aakLNouj8-BZ6GBNdx-acR3]]qpd3We@naz4eGhsBecsvTCIUHVO_ZgdPeB7HAG7_gs-NU@aEL8uYCfI7ozG7715gAi-xkSbdHAdiospvR-cdSsO@Lyaxnt2u7TFmFXo__OXY2mNplmgSvoOkBtlyRiAGENN]tWOExxzudaSuTSgrMxoDcal46éxiOSEptusrqjyxrOgenpgegOWvADFRYInYpPyMOTdTPcjia4RaOsmgnDz3scoaA",
				"refresh_token": "_imiaWocizAzXB1ItVQOMFFtznxXvM2flalTHavuQTése",
				"token_type": "Bearer",
				"expires_in": "3600",
				"scope": "FS=1_3_4_5_7_10_13_14_16_18_32_33_35_37_38_41_44;IntervalDurationstion=Monthly_3500_900_300;BlockDuration=Monthly_Daily;HistoryLength=63112904;FB=1_3_4_5_7_10_13_14_18_32_33_35_37_38_41_44;IntervelDuration=Monthly_3600_900_300;BlockDuration=Monthly_Daily;HistoryLength=63113904;FB=1_3_4_5_7_10_13_14_18_32_33_35_37_38_41_44;IntervalDuration=Monthly_3600_900_300;BlockDuration=Monthly_Daily;HistoryLength=63113904;",
				"resourceURI": "https://apit.coned.com/gbc/v1/resource/Batch/Subscription/610",
				"authorizationURI": "https://apit.coned.com/gbe/v1/resource/Authorization/874",
				"accountNumber": "NTg40DA3HDQSMDAWMDI3"
			}

			const {
				data: tokenData
			} = response;

			const resultData = await handleToken(code, tokenData)

			if (resultData && resultData.access_token) {
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
		query = {},
		body = {},
		originalUrl = '/test-action',
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
