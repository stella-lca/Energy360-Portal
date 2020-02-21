"use strict";
const express = require("express");
const verify = require("../middleware/auth");
const Router = express.Router();
const { UsersController } = require("../controllers");

Router.post("/", UsersController.signup);
Router.get("/", UsersController.signin);
Router.get("/:id", verify, UsersController.findOne);
Router.delete("/:id", verify, UsersController.delete);
Router.post("/token", verify, UsersController.checkToken);

module.exports = Router;
