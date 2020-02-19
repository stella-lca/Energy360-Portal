const Sequelize = require("sequelize");
require("dotenv").config();

const {
	SQLAZURECONNSTR_DB_HOST,
	SQLAZURECONNSTR_DB_USER,
	SQLAZURECONNSTR_DB_PW,
	SQLAZURECONNSTR_DB_NAME
} = process.env;

const db = {};

const sequelize = new Sequelize(
	SQLAZURECONNSTR_DB_NAME,
	SQLAZURECONNSTR_DB_USER,
	SQLAZURECONNSTR_DB_PW,
	{
		host: SQLAZURECONNSTR_DB_HOST,
		dialect: "mssql", //"mysql" "mssql"
		dialectOptions: { options: { encrypt: true } }
	}
);

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
	return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS");
};

db.User = sequelize.import("./user.model");

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
