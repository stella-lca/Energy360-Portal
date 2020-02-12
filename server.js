const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const router = require("./api/routes");

app.use(cors());
app.use(express.static(path.resolve(__dirname, "dist")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express Routing
app.use("/api", router);

// React Routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

http.createServer(app).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

module.exports = app;
