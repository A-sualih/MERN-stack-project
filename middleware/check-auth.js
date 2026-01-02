const jwt = require("jsonwebtoken")
const HttpError = require("../models/http-error");
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication failed");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY)
    req.userData = { userId: decodedToken.userId };
    next()
  } catch (err) {
    console.log("Check Auth Failed:", err.message);
    console.log("Token Received:", req.headers.authorization);
    const error = new HttpError("Authentication failed", 401);
    return next(error);
  }
};
