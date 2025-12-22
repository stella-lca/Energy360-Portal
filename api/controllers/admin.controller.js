// User Signup
exports.fileList = async (req, res) => {
	const testFolder = 'files/';
	const fs = require('fs');
	try {
		fs.readdir(testFolder, (err, files) => {
			if(err) return res.status(400).end('ok');
			return res.status(200).send(files);
		});
	} catch (error) {
		res.status(400).end('ok');
	}
};

