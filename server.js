const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

const router = require("./api/routes");
const { EnvCall } = require("./api/utils/errorTacker");

let dbState = { status: false, message: "DB not initialized yet" };
const db = require("./api/models");

// Cron imports
const { meterReading, meterErrorDataInput } = require("./api/cronjob/meterReadingCron");
const { meterHourlyErrorDataInput, meterReadingHourly } = require("./api/cronjob/meterReadingCronHourly");

// ---- Helpers ----
async function initDatabase() {
  try {
    await db.sequelize.authenticate();

    const isProd = process.env.NODE_ENV === "production";
    const autoSync = process.env.AUTO_SYNC === "true";
    if (!isProd || autoSync) {
      await db.sequelize.sync({ alter: false });
    }

    dbState.status = true;
    dbState.message = "DB connected";
    console.log("DB connected successfully!");

    await EnvCall();
  } catch (err) {
    dbState.status = false;
    dbState.message = err?.message || String(err);
    console.log("Database connection error!!!!", err);
  }
}

function anyBodyParser(req, res, next) {
  const contentType = req.headers["content-type"];
  if (contentType && contentType.includes("xml")) {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", chunk => (data += chunk));
    req.on("end", () => {
      req.testBody = data;
      next();
    });
  } else {
    next();
  }
}

// ---- Middleware ----
app.use(
  session({
    secret: process.env.SESSION_SECRET || "gReEnConNEct",
    saveUninitialized: true,
    resave: true
  })
);

// Allow frontend dev server
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || "http://localhost:3000"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(express.static(path.resolve(__dirname, "dist")));
app.use(express.static("files"));
app.use(express.static("log"));

app.use(anyBodyParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// If you want to run locally without DB, set SKIP_DB=true in .env
app.use((req, res, next) => {
  if (process.env.SKIP_DB === "true") return next();
  if (dbState.status) return next();

  return res.status(503).json({
    error: "Database not connected",
    message: dbState.message
  });
});

// ---- Routes ----
app.use("/", router);

// React Routing (only for prod build / dist)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

// ---- Server start ----
http.createServer(app).listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}/`);

  await initDatabase();

  if (dbState.status || process.env.SKIP_DB === "true") {
    meterReading();
    meterErrorDataInput();
    meterReadingHourly();
    meterHourlyErrorDataInput();
  } else {
    console.log("Cron jobs NOT started because DB is not connected.");
  }
});

module.exports = app;
