'use strict';
const express = require('express');
const Router = express.Router();

// Import all routes here
const UsersRouter = require('./user.route');
const TokenRouter = require('./token.route');

Router.use('/user', UsersRouter);
Router.use('/auth', TokenRouter);

module.exports = Router;