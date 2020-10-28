const jwt = require("jsonwebtoken");

const {
  APPSETTING_JWT_SECRET
} = process.env;

module.exports = function(req, res, next) {
  const token = req.header("token");
  if (!token) return res.status(401).json({ message: "Authentication error. Token required" });

  try {
    const {userId, email} = jwt.verify(token, APPSETTING_JWT_SECRET);
    req.user = {
      id: userId,
      email
    };
    next();
  } catch (e) {
    res.status(401).send({ message: "Invalid Token" });
  }
};