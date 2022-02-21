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
db.IntervalBlockPayload = sequelize.import('./intervalBlockPayload.model');
db.Log = sequelize.import('./log.model');
db.MeterReading = sequelize.import('./meterReading.model');
db.MeterReadingHourly = sequelize.import('./meterReadingHourly.model');
db.Env = sequelize.import('./env.model');
db.Meter = sequelize.import('./meter.model');
db.MeterCronError = sequelize.import('./meterCronError.model');
db.MeterHourlyCronError = sequelize.import('./meterHourlyCronError.model');

db.User.hasOne(db.Token, { onDelete: "cascade", foreignKey: 'userId' })

db.Token.hasMany(db.IntervalBlockPayload, { onDelete: "cascade", foreignKey: 'tokenId' })
db.IntervalBlockPayload.belongsTo(db.Token, { onDelete: "cascade", foreignKey: 'tokenId' })

db.IntervalBlockPayload.hasMany(db.MeterReading, { onDelete: "cascade", foreignKey: 'intervalBlockPayloadId' })
db.IntervalBlockPayload.hasMany(db.MeterReadingHourly, { onDelete: "cascade", foreignKey: 'intervalBlockPayloadId' })

db.User.hasMany(db.Meter, { onDelete: "cascade", foreignKey: 'userId' })
db.Meter.belongsTo(db.User, { onDelete: "cascade", foreignKey: 'userId' })

db.Token.hasMany(db.MeterCronError, { onDelete: "cascade", foreignKey: 'tokenId' })
db.MeterCronError.belongsTo(db.Token, { onDelete: "cascade", foreignKey: 'tokenId' })

db.Token.hasMany(db.MeterHourlyCronError, { onDelete: "cascade", foreignKey: 'tokenId' })
db.MeterHourlyCronError.belongsTo(db.Token, { onDelete: "cascade", foreignKey: 'tokenId' })



db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
