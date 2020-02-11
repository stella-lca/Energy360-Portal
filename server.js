const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const app = express();

const { port } = require("./config");
const router = require("./api/routes");

app.use(cors());
app.use(express.static(path.resolve(__dirname, "dist")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express Routing
app.use("/", router);

// React Routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

http.createServer(app).listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app;
