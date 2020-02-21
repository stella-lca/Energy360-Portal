"use strict";
const express = require("express");
const Router = express.Router();
const { TokenController } = require("../controllers");

Router.get("/callback", TokenController.authenticateToken);
Router.get("/token-data", (req, res) => {
  res.send(req.body);
});

module.exports = Router;
