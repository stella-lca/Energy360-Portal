const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

require("dotenv").config();

// ---- Diagnostics (Azure-friendly) ----
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
});

const app = express();
const PORT = Number(process.env.PORT || 5000);

const router = require("./api/routes");
const { EnvCall } = require("./api/utils/errorTacker");

let dbState = { status: false, message: "DB not initialized yet" };
const db = require("./api/models");

// Cron imports
const { meterReading, meterErrorDataInput } = require("./api/cronjob/meterReadingCron");
const { meterHourlyErrorDataInput, meterReadingHourly } = require("./api/cronjob/meterReadingCronHourly");

// Track whether cron started (for /health)
let cronState = {
  enabled: false,
  startedAt: null,
  lastInitOk: null,
  lastInitError: null,
};

// ---- Helpers ----
async function initDatabase() {
  try {
    await db.sequelize.authenticate();

    const isProd = process.env.APPSETTING_NODE_ENV === "production";
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
    req.on("data", (chunk) => (data += chunk));
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
    resave: true,
  })
);

// Allow frontend dev server
const allowedOrigins = [process.env.FRONTEND_ORIGIN || "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.static(path.resolve(__dirname, "dist")));
app.use(express.static("files"));
app.use(express.static("log"));

app.use(anyBodyParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// If you want to run locally without DB, set APPSETTING_SKIP_DB=true in .env
app.use((req, res, next) => {
  if (process.env.APPSETTING_SKIP_DB === "true") return next();
  if (dbState.status) return next();

  return res.status(503).json({
    error: "Database not connected",
    message: dbState.message,
  });
});

// ---- Health (diagnostics) ----
app.get("/health", async (req, res) => {
  let dbOk = false;
  let dbError = null;

  try {
    if (process.env.APPSETTING_SKIP_DB === "true") {
      dbOk = true;
    } else {
      await db.sequelize.authenticate();
      dbOk = true;
    }
  } catch (e) {
    dbOk = false;
    dbError = e?.message || String(e);
  }

  res.json({
    time: new Date().toISOString(),
    nodeEnv: process.env.APPSETTING_NODE_ENV,
    dbState,
    dbOk,
    dbError,
    cronState,
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

  const enableCron =
  (process.env.APPSETTING_ENABLE_CRON || process.env.ENABLE_CRON) === "true";
  cronState.enabled = enableCron;

  console.log("[BOOT] Time:", new Date().toISOString());
  console.log("[BOOT] APPSETTING_NODE_ENV:", process.env.APPSETTING_NODE_ENV);
  console.log("[BOOT] APPSETTING_ENABLE_CRON:", process.env.APPSETTING_ENABLE_CRON);
  console.log("[BOOT] APPSETTING_SKIP_DB:", process.env.APPSETTING_SKIP_DB);

  if (!enableCron) {
    console.log("[CRON] Skipped because APPSETTING_ENABLE_CRON is not 'true'.");
  } else if (dbState.status || process.env.APPSETTING_SKIP_DB === "true") {
    try {
      console.log("[CRON] Initializing cron jobs...");
      cronState.startedAt = new Date().toISOString();

      console.log("[CRON] Starting meterReading...");
      meterReading();
      console.log("[CRON] meterReading initialized.");

      console.log("[CRON] Starting meterErrorDataInput...");
      meterErrorDataInput();
      console.log("[CRON] meterErrorDataInput initialized.");

      console.log("[CRON] Starting meterReadingHourly...");
      meterReadingHourly();
      console.log("[CRON] meterReadingHourly initialized.");

      console.log("[CRON] Starting meterHourlyErrorDataInput...");
      meterHourlyErrorDataInput();
      console.log("[CRON] meterHourlyErrorDataInput initialized.");

      cronState.lastInitOk = new Date().toISOString();
      cronState.lastInitError = null;
      console.log("[CRON] All cron jobs initialized OK.");
    } catch (err) {
      cronState.lastInitOk = null;
      cronState.lastInitError = err?.message || String(err);
      console.error("[CRON] Initialization failed:", err);
    }
  } else {
    console.log("[CRON] NOT started because DB is not connected.");
  }

  // Heartbeat: proves the process is alive in Azure logs
  setInterval(() => {
    console.log("[HEARTBEAT]", new Date().toISOString());
  }, 5 * 60 * 1000);
});

module.exports = app;
