'use strict';
const express = require('express');
const Router = express.Router();

// Import all routes here
const UsersRouter = require('./user.route');

Router.use('/user', UsersRouter);

module.exports = Router;