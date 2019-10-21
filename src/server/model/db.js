const Sequelize = require("sequelize");
const dotenv = require('dotenv').config();
const { SQL_DB_HOST, SQL_DB_USER, SQL_DB_PW, SQL_DB_NAME } = process.env;
const sequelize = new Sequelize(SQL_DB_NAME, SQL_DB_USER, SQL_DB_PW, {
  host: SQL_DB_HOST,
  dialect: "mssql",
  dialectOptions: { options: { encrypt: true } }
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully");
  })
  .catch(err => console.log("Unable to connect to the database", err));

module.exports = sequelize;