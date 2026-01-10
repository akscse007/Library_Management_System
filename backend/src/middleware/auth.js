const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_a_real_secret";

function auth(req, res, next) {
  const authHeader =
    req.header("Authorization") || req.header("authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const parts = authHeader.split(" ");
  const token =
    parts.length === 2 && parts[0] === "Bearer" ? parts[1] : parts[0];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
}

module.exports = auth;
