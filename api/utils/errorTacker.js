const fs = require('fs');
const axios = require("axios");
const moment = require("moment");
const { sendNotifyEmail } = require('./email');

exports.addLog = (text, json, error) => {
	module.exports.errorTracker({
		body: { state_point: text },
		result: JSON.stringify(json),
		error: error
	});
}

exports.errorTracker = (req, res, next) => {
	const {
		query = {},
		body = {},
		originalUrl = "/test-action",
		result,
		error,
	} = req;
	const date = moment().format("MM-DD-YYYY-h:mm:ss");
	const data1 = moment().format("YYYY-MM-DD");
	const logDir = `log/`;

	const actionName = originalUrl.replace(/\//g, "-").substring(1);
	const fileName = actionName + "=>" + date + ".json";
	if (!actionName) return false;

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

	exports.createLogItem(true, originalUrl, "successfully", JSON.stringify(jsonContent))

	// sendNotifyEmail({ to: "aleksa.pesic351@gmail.com", subject: fileName, content: JSON.stringify(jsonContent) });

	fs.writeFile(
		`log/${fileName}`,
		JSON.stringify(jsonContent),
		"utf8",
		function (err) {
			if (err) {
				console.log("An error occured while writing JSON Object to File.");
				// if(res) res.status(500).send('error');
				return console.log(err);
			}
			const fileContent = fs.readFileSync(`log/${fileName}`);

			var params = {
				Bucket: "greenconnect-logs",
				Key: `${data1}/${fileName}`, //file.name doesn't exist as a property
				Body: fileContent,
			};

			// if(res) res.status(200).send('ok');;
			// s3bucket.upload(params, function (err, data) {
			// 	if (err) {
			// 		console.log(err);
			// 		// res.status(500).send(err);
			// 	} else {
			// 		console.log(data);
			// 		// res.status(200).end();
			// 	}
			// });
			console.log("JSON file has been saved.");
		}
	);
};

exports.createLogItem = (status, url, msg, data='') => {
	// console.log(status, url, msg, data)
	const body = {
		"text": "GreenButton Log Created",
		"blocks": [
			{ "type": "divider" },
			{
				"type": "context",
				"elements": [
					{
						"type": "mrkdwn",
						"text": `*Status:* ${status ? ':white_check_mark:' : ':x:'}`
					}
				]
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "mrkdwn",
						"text": `*URL:*    ${url}`
					}
				]
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "mrkdwn",
						"text": `*Date:*   ${new Date().toLocaleString()}`
					}
				]
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "mrkdwn",
						"text": `*MSG:*   ${msg}`
					}
				]
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "mrkdwn",
						"text": `*Data:*`
					}
				]
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "mrkdwn",
						"text": "```" + data + "```"
					}
				]
			}
			// {
			// 	"type": "section",
			// 	"elements": [
			// 		{
			// 			"type": "plain_text",
			// 			"text": `${data}`
			// 		}
			// 	]
			// }
		]
	};

	axios
		.post("https://hooks.slack.com/services/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", body, { "content-type": "application/json" })
		.then((res) => {
			console.log("log created")
		})
		.catch((err) => {
			console.log("log creating error")
		});
}
