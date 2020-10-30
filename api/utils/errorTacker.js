const fs = require('fs');
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


	// sendNotifyEmail({ to: "aleksa.pesic351@gmail.com", subject: fileName, content: JSON.stringify(jsonContent) });

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