// backend/middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  console.warn("verifyToken: JWT_ACCESS_SECRET not set in .env");
}

async function verifyToken(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ success: false, message: "Authorization header missing or malformed" });
    }
    const token = parts[1];

    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    // Attach payload to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    // Optionally, you can load the full user from DB if you need more fields:
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    req.currentUser = user;

    next();
  } catch (err) {
    console.error("verifyToken error:", err.message || err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
