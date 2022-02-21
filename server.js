const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();
const { errorTracker, EnvCall } = require("./api/utils/errorTacker");
require("dotenv").config();
const session = require('express-session');

const PORT = process.env.PORT || 3000;
const router = require("./api/routes");


let dbState = {};

const db = require("./api/models");
const { meterReading, meterErrorDataInput } = require("./api/cronjob/meterReadingCron");
const { meterHourlyErrorDataInput, meterReadingHourly } = require("./api/cronjob/meterReadingCronHourly");
const db_sync = () => {
	db.sequelize
		.sync({ alter: false })
		.then(async msg => {
			console.log("DB connected successfully!");
			dbState.status = true;
			await EnvCall()
		})
		.catch(err => {
			console.log("Datbase connection error!!!!", err);
			dbState.status = false;
			dbState.message = err.message;
		});
};

db_sync();

function anyBodyParser(req, res, next) {
	const { headers } = req;
	const contentType = headers['content-type'];
	if (contentType && contentType.includes('xml')) {
		var data = '';
		req.setEncoding('utf8');
		req.on('data', function (chunk) {
			data += chunk;
		});
		req.on('end', function () {
			req.testBody = data;
			next();
		});
	} else {
		next();
	}
}

app.use(session({ secret: 'gReEnConNEct', saveUninitialized: true, resave: true }));
app.use(cors());
app.use(express.static(path.resolve(__dirname, "dist")));

app.use(express.static('files'))
app.use(express.static('log'))

app.use(anyBodyParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));


app.use((req, res, next) => {
	// errorTracker(req, res);
	console.log("Check db state here", dbState);
	// next();

	if (dbState && dbState.status) {
		next();
	} else {
		db_sync();
		res.status(500).send(dbState);
	}
});


/**
 * Cron
 */

meterReading();
// meterErrorDataInput();
meterReadingHourly();
// meterHourlyErrorDataInput();

// Express Routing
app.use("/", router);

// React Routing
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "dist/index.html"));
});

http.createServer(app).listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});

module.exports = app;