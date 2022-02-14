'use strict';
const express = require('express');
const Router = express.Router();
const xmlparser = require('express-xml-bodyparser');
const { TokenController } = require('../controllers');
const { errorTracker } = require('../utils/errorTacker');
const { sendAdminEmail } = require('../utils/email');

Router.get('/callback', TokenController.authenticateToken);
Router.get('/cuscall', TokenController.externalAPI)
Router.get('/errorcron', TokenController.MeterErrorCron);
Router.get('/meterread', TokenController.meterReadingAPI)
Router.get('/intervalblock', TokenController.intervalBlockApi)
Router.get('/intervalblocktest', TokenController.intervalBlockFunction)
Router.get('/deletedata', TokenController.deleteData);
Router.post('/tracker', errorTracker);
Router.get('/token-data', (req, res) => {
  res.send(req.body);
});

Router.post(
  '/notify',
  // xmlparser({
  //   trim: false,
  //   explicitArray: false,
  // }),
  TokenController.notifyCallback
);
Router.get('/notify', (req, res) => {
  sendAdminEmail({
    content: 'GET method is not acceptable',
    subject: 'GreenConnect - Utility API Response'
  })
  res.send("GET method is not acceptable");
});

module.exports = Router;
