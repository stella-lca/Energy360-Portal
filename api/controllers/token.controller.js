const axios = require("axios");
const moment = require("moment");
const {
	Token: { findByToken, createToken, updateToken }
} = require("../models");

const {
	APPSETTING_HOST,
	APPSETTING_CLIENT_ID,
	APPSETTING_CLIENT_SECRET,
	APPSETTING_SUBSCRIPTION_KEY
} = process.env;

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
		redirectUri: `${APPSETTING_HOST}/api/auth/token-data`,
		authCode: code
	};

	const testResult = { headers, data };
	console.log(testResult);

	axios
		.post("https://apit.coned.com/gbc/v1/oauth/v1/Token", data, { headers })
		.then(response => response.data)
		.then(async tokenData => await handleToken(authCode, tokenData))
		.then(tokenData => {
			res.json({
				status: 200,
				message: "Successful. Token data has saved",
				data: tokenData,
				testResult
			});
		})
		// .then(tokenData => req.session.shareMyDataToken = tokenData)
		.catch(err => {
			res.json({
				status: false,
				message: err.response.data,
				testResult
			});
		});
};
