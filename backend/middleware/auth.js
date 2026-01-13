const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[PROTECT] FAILED: No authorization header. Headers:", Object.keys(req.headers));
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("[PROTECT] Token found, verifying. Token:", token.substring(0, 20) + "...");
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[PROTECT] Token verified. Payload:", decoded);
    } catch (tokenErr) {
      console.log("[PROTECT] Token verification failed:", tokenErr.message);
      throw tokenErr;
    }

    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      console.log("[PROTECT] FAILED: User not found for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    console.log("[PROTECT] SUCCESS: User authenticated -", user.email, "role:", user.role);
    req.user = user;
    next();
  } catch (err) {
    console.log("[PROTECT] FAILED: Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token", error: err.message });
  }
};
