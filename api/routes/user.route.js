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
Router.post("/forgot-password", UsersController.sendForgotEmail);
Router.post("/forgotpass-callback", UsersController.forgotPassword);
Router.post("/reset-password", verify, UsersController.resetPassword);

module.exports = Router;
