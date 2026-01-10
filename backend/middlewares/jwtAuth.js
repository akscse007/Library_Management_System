// backend/middleware/jwtAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "replace-me";

async function jwtAuth(req, res, next) {
  try {
    // 1) Try cookie first
    let token = null;
    const cookieName = process.env.COOKIE_NAME || "sess";
    if (req.cookies && req.cookies[cookieName]) token = req.cookies[cookieName];

    // 2) Fallback to Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn("jwtAuth: token verify failed:", err && err.name);
      return res.status(401).json({ message: "Invalid token" });
    }

    // Load user and attach to req.user (strip sensitive fields)
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Invalid token user" });

    req.user = user; // if you prefer attach public DTO: req.user = user.toPublic()
    return next();
  } catch (err) {
    console.error("jwtAuth error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = jwtAuth;
