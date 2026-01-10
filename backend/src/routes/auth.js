// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN = "15m",
  REFRESH_TOKEN_EXPIRES_IN = "7d",
} = process.env;

// helper to sign tokens
function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

// -------------------------
// POST /auth/login
// -------------------------
router.post("/login", async (req, res) => {
  try {
    const { email = "", password = "" } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    // create tokens
    const access = signAccessToken(user);
    const refresh = signRefreshToken(user);

    return res.json({
      success: true,
      message: "Authenticated",
      access,
      refresh,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("POST /auth/login", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

// -------------------------
// GET /auth/me  (protected)
// -------------------------
router.get("/me", verifyToken, (req, res) => {
  return res.json({ success: true, user: req.currentUser });
});

module.exports = router;
