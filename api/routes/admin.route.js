"use strict";
const express = require("express");
const Router = express.Router();
const { AdminController } = require("../controllers");

Router.get("/fileList", AdminController.fileList);

module.exports = Router;
