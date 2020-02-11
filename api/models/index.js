const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
var basename = path.basename(module.filename);
require("dotenv").config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
const db = {};

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: "mysql"
});

db.User = sequelize.import("./user.model");

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
