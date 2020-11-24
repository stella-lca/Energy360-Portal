"use strict";
const express = require("express");
const Router = express.Router();
const xmlparser = require("express-xml-bodyparser");
const { TokenController } = require("../controllers");
const { errorTracker } = require("../utils/errorTacker");

Router.get("/callback", TokenController.authenticateToken);
Router.post("/tracker", errorTracker);
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
