const Sequelize = require("sequelize");

const {
  SQLAZURECONNSTR_DB_HOST,
  SQLAZURECONNSTR_DB_USER,
  SQLAZURECONNSTR_DB_PW,
  SQLAZURECONNSTR_DB_NAME
} = process.env;

// Fail fast with a clear message if env vars are missing
const missing = [];
if (!SQLAZURECONNSTR_DB_HOST) missing.push("SQLAZURECONNSTR_DB_HOST");
if (!SQLAZURECONNSTR_DB_USER) missing.push("SQLAZURECONNSTR_DB_USER");
if (!SQLAZURECONNSTR_DB_PW) missing.push("SQLAZURECONNSTR_DB_PW");
if (!SQLAZURECONNSTR_DB_NAME) missing.push("SQLAZURECONNSTR_DB_NAME");

if (missing.length) {
  throw new Error(
    `Missing required DB env var(s): ${missing.join(
      ", "
    )}. Check your .env file and make sure it is loaded before models are required.`
  );
}

const sequelize = new Sequelize(
  SQLAZURECONNSTR_DB_NAME,
  SQLAZURECONNSTR_DB_USER,
  SQLAZURECONNSTR_DB_PW,
  {
    host: SQLAZURECONNSTR_DB_HOST,
    dialect: "mssql",

    // Azure SQL + tedious settings
    dialectOptions: {
      options: {
        encrypt: true,
        // Set explicitly to silence the tedious warning & avoid future default changes
        trustServerCertificate: true
      }
    },

    // Optional but helpful for stability
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    },

    logging: false 
  }
);

// Keep your existing DATE formatting behavior
Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS");
};

const db = {};

db.User = sequelize.import("./user.model");
db.Token = sequelize.import("./token.model");
db.IntervalBlockPayload = sequelize.import("./intervalBlockPayload.model");
db.Log = sequelize.import("./log.model");
db.MeterReading = sequelize.import("./meterReading.model");
db.MeterReadingHourly = sequelize.import("./meterReadingHourly.model");
db.Env = sequelize.import("./env.model");
db.Meter = sequelize.import("./meter.model");
db.MeterCronError = sequelize.import("./meterCronError.model");
db.MeterHourlyCronError = sequelize.import("./meterHourlyCronError.model");

db.User.hasOne(db.Token, { onDelete: "cascade", foreignKey: "userId" });

db.Token.hasMany(db.IntervalBlockPayload, { onDelete: "cascade", foreignKey: "tokenId" });
db.IntervalBlockPayload.belongsTo(db.Token, { onDelete: "cascade", foreignKey: "tokenId" });

db.IntervalBlockPayload.hasMany(db.MeterReading, { onDelete: "cascade", foreignKey: "intervalBlockPayloadId" });
db.IntervalBlockPayload.hasMany(db.MeterReadingHourly, { onDelete: "cascade", foreignKey: "intervalBlockPayloadId" });

db.IntervalBlockPayload.hasMany(db.MeterCronError, { onDelete: "cascade", foreignKey: "intervalBlockPayloadId" });
db.MeterCronError.belongsTo(db.IntervalBlockPayload, { onDelete: "cascade", foreignKey: "intervalBlockPayloadId" });

db.User.hasMany(db.Meter, { onDelete: "cascade", foreignKey: "userId" });
db.Meter.belongsTo(db.User, { onDelete: "cascade", foreignKey: "userId" });

db.IntervalBlockPayload.hasMany(db.MeterHourlyCronError, { onDelete: "cascade", foreignKey: "intervalBlockPayloadId" });
db.MeterHourlyCronError.belongsTo(db.IntervalBlockPayload, { onDelete: "cascade", foreignKey: "intervalBlockPayloadId" });

db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;
