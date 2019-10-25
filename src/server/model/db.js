const Sequelize = require("sequelize");
const dotenv = require('dotenv').config();
const { SQLAZURECONNSTR_DB_HOST, SQLAZURECONNSTR_DB_USER, SQLAZURECONNSTR_DB_PW, SQLAZURECONNSTR_DB_NAME } = process.env;
const sequelize = new Sequelize(SQLAZURECONNSTR_DB_NAME, SQLAZURECONNSTR_DB_USER, SQLAZURECONNSTR_DB_PW, {
  host: SQLAZURECONNSTR_DB_HOST,
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