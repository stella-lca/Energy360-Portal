"use strict";
const express = require("express");
const Router = express.Router();

// Import all routes here
const UsersRouter = require("./user.route");
const TokenRouter = require("./token.route");
const AdminRouter = require("./admin.route");

Router.use("/api/user", UsersRouter);
Router.use("/api", TokenRouter);
Router.use("/auth", TokenRouter);
Router.use("/admin", AdminRouter);

module.exports = Router;
