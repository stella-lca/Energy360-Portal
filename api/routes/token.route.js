"use strict";
const express = require("express");
const bodyParser = require("body-parser");
// require('body-parser-xml')(bodyParser);
const Router = express.Router();
const { TokenController } = require("../controllers");

const xmlparser = require("express-xml-bodyparser");

Router.get("/callback", TokenController.authenticateToken);
Router.post("/tracker", TokenController.errorTracker);
Router.get("/token-data", (req, res) => {
	res.send(req.body);
});

Router.post(
	"/notify",
	xmlparser({
		trim: false,
		explicitArray: false,
	}),
	TokenController.notifyCallback
);

module.exports = Router;
