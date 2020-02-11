'use strict';
const express = require('express');
const Router = express.Router();
const { UsersController } = require('../controllers');

Router.post("/", UsersController.signup);
Router.get("/", UsersController.signin);
Router.get("/:id", UsersController.findOne);
Router.delete("/:id", UsersController.delete);

module.exports = Router;
