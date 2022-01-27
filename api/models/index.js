const Sequelize = require('sequelize');
require('dotenv').config();

const {
  SQLAZURECONNSTR_DB_HOST,
  SQLAZURECONNSTR_DB_USER,
  SQLAZURECONNSTR_DB_PW,
  SQLAZURECONNSTR_DB_NAME
} = process.env;

const db = {};
trustServerCertificate: true;
const sequelize = new Sequelize(
  SQLAZURECONNSTR_DB_NAME,
  SQLAZURECONNSTR_DB_USER,
  SQLAZURECONNSTR_DB_PW,
  {
    host: SQLAZURECONNSTR_DB_HOST,
    dialect: 'mssql',
    dialectOptions: { options: { encrypt: true } }
  }
);

// sequelize.getQueryInterface().showAllTables().then(function(tables) {
//     console.log(tables);
// });

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
};

db.User = sequelize.import('./user.model');
db.Token = sequelize.import('./token.model');
db.Log = sequelize.import('./log.model');
db.MeterReading = sequelize.import('./meterReading.model');
db.Env = sequelize.import('./env.model');

db.User.hasOne(db.Token, { onDelete: "cascade", foreignKey: 'userId' })
db.Token.hasMany(db.MeterReading, { onDelete: "cascade", foreignKey: 'tokenId' })


db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
