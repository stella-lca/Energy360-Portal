const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();
const { errorTracker } = require("./api/utils/errorTacker");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const router = require("./api/routes");

let dbState = {};

const db = require("./api/models");
const db_sync = () => {
	db.sequelize
		.sync()
		// .sync({ alter: true })
		.then(msg => {
			console.log("DB connected successfully!");
			dbState.status = true;
		})
		.catch(err => {
			console.log("Datbase connection error!!!!");
			dbState.status = false;
			dbState.message = err.message;
		});
};

db_sync();

app.use((req, res, next) => {
	errorTracker(req, res);
	// console.log("Check db state here", dbState);

	if (dbState && dbState.status) {
		next();
	} else {
		db_sync();
		res.status(500).send(dbState);
	}
});


app.use(cors());
app.use(express.static(path.resolve(__dirname, "dist")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));


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