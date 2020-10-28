const fs = require('fs');
const request = require('request');

if (!fs.existsSync("files")) {
	fs.mkdirSync("files");
}

const fileNameAndExt = (str) => {
	var file = str.split('/').pop();
	return [file.substr(0, file.lastIndexOf('.')), file.substr(file.lastIndexOf('.') + 1, file.length)]
}

exports.downloadFile = (url, cb) => {
	try {
		let nameArray = fileNameAndExt(url);
		let fileName = `files/${nameArray[0]}.${nameArray[1]}`;
		let number = 0;

		while (true) {
			if (fs.existsSync(fileName)) {
				number++;
				fileName = `files/${nameArray[0]}_${number}.${nameArray[1]}`;
			} else break;
		}

		const file = fs.createWriteStream(fileName);
		const sendReq = request.get(url);

		sendReq.on('response', (response) => {
			if (response.statusCode !== 200) {
				cb(fileName);
			}

			sendReq.pipe(file);
		});


		file.on('finish', () => { file.close(); cb(fileName); });

		sendReq.on('error', (err) => {
			fs.unlink(fileName);
			cb(false);
		});

		file.on('error', (err) => {
			fs.unlink(fileName);
			cb(false);
		});
	}
	catch (err) {
		cb(false);
	}
};