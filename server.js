const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

require("dotenv").config(); 

const app = express();
const PORT = process.env.PORT || 3000;

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
    // Safe check: verify credentials/connection without touching schema
    await db.sequelize.authenticate();

    // Only auto-sync in dev (or if explicitly enabled)
    const isProd = process.env.NODE_ENV === "production";
    const autoSync = process.env.AUTO_SYNC === "true"; // optional override
    if (!isProd || autoSync) {
      await db.sequelize.sync({ alter: false });
    }

    dbState.status = true;
    dbState.message = "DB connected";
    console.log("DB connected successfully!");

    // Load Env settings (Slack hook etc.)
    await EnvCall();
  } catch (err) {
    dbState.status = false;
    dbState.message = err?.message || String(err);
    console.log("Database connection error!!!!", err);
  }
}

function anyBodyParser(req, res, next) {
  const { headers } = req;
  const contentType = headers["content-type"];
  if (contentType && contentType.includes("xml")) {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      data += chunk;
    });
    req.on("end", () => {
      req.testBody = data;
      next();
    });
  } else {
    next();
  }
}

// ---- Middleware ----
app.use(session({ secret: "gReEnConNEct", saveUninitialized: true, resave: true }));
app.use(cors());
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

  // Don’t spam sync() per request. Just return a clear error.
  return res.status(503).json({
    error: "Database not connected",
    message: dbState.message
  });
});

// ---- Routes ----
app.use("/", router);

// React Routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

// ---- Server start ----
http.createServer(app).listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}/`);

  // Initialize DB once when server starts
  await initDatabase();

  // Only start cron jobs when DB is connected (or when SKIP_DB=true)
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
