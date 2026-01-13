const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../models/User");
const { protect } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const signToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, referralCode } = req.body;

    if (!name || !email || !password || !referralCode)
      return res.status(400).json({ message: "Missing required fields: name, email, password, referralCode" });

    // Normalize email
    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: "User exists" });

    // Hash password here before storing
    console.log("[REGISTER] Hashing password for new user");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("[REGISTER] Password hashed successfully, hash length:", hashedPassword.length);

    // Store hashed password (only `passwordHash`) and *do not* persist referralCode
    console.log("[REGISTER DEBUG] Creating user with data:", { name, email: normalizedEmail, role: role || "student" });
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,  // Store hashed password only
      role: role || "student",
    });
    console.log("[REGISTER DEBUG] User created successfully:", user._id);
    console.log("[REGISTER DEBUG] Stored passwordHash:", !!user.passwordHash, "length:", user.passwordHash?.length);

    const accessToken = signToken({ id: user._id, role: user.role });

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    console.log(`[REGISTER SUCCESS] User registered: ${email}, role: ${user.role}`);
    // Return with success flag and multiple token fields for compatibility
    res.status(201).json({ 
      success: true,
      user: userResponse, 
      token: accessToken,
      accessToken: accessToken,
      access: accessToken
    });
  } catch (err) {
    console.error("[REGISTER ERROR] Full error:", err);
    console.error("[REGISTER ERROR] Stack:", err.stack);
    console.error("[REGISTER ERROR] Message:", err.message);
    res.status(500).json({ message: err.message || "Registration error", error: err.message });
  }
});

// Valid roles that can login
const VALID_ROLES = ['student', 'teacher', 'admin', 'librarian', 'manager', 'accountant', 'stock_manager', 'supplier_contact'];

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      console.log("[LOGIN] Missing email or password");
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2. Normalize email
    const normalizedEmail = String(email).toLowerCase().trim();

    // 3. Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`[LOGIN FAILED] User not found: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Check if user account exists and has passwordHash
    if (!user.passwordHash) {
      console.log(`[LOGIN FAILED] User has no passwordHash set: ${email}`);
      return res.status(401).json({ message: "User account error: no password set" });
    }

    // 5. Verify password with comparePassword method
    console.log(`[LOGIN DEBUG] Checking password for user: ${email}, has passwordHash: ${!!user.passwordHash}`);
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      console.log(`[LOGIN FAILED] Password mismatch for: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 6. Validate role exists and is allowed
    if (!user.role) {
      console.log(`[LOGIN FAILED] User has no role assigned: ${email}`);
      return res.status(401).json({ message: "User account error: no role assigned" });
    }

    if (!VALID_ROLES.includes(user.role)) {
      console.log(`[LOGIN FAILED] User has invalid role: ${email}, role: ${user.role}`);
      return res.status(401).json({ message: `Role '${user.role}' is not allowed to login` });
    }

    // 9. Generate token with both 'token' and 'accessToken' for compatibility
    const accessToken = signToken({ id: user._id, role: user.role });
    if (!accessToken) {
      console.log(`[LOGIN FAILED] Token generation failed: ${email}`);
      return res.status(401).json({ message: "Could not generate auth token" });
    }

    // 10. Return user without passwordHash
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    console.log(`[LOGIN SUCCESS] User logged in: ${email}, role: ${user.role}`);
    // Return with success flag and multiple token fields for compatibility
    res.json({ 
      success: true,
      user: userResponse, 
      token: accessToken,
      accessToken: accessToken,
      access: accessToken
    });
  } catch (err) {
    console.error("[LOGIN ERROR] Full error:", err);
    console.error("[LOGIN ERROR] Message:", err.message);
    console.error("[LOGIN ERROR] Stack:", err.stack);
    res.status(500).json({ message: err.message || "Login error", error: err.message });
  }
});

/**
 * Reset/Set password endpoint
 * Used when user doesn't have a password set
 */
router.post("/set-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Set the new password (pre-save hook will hash it)
    user.passwordHash = password;
    await user.save();

    console.log(`[PASSWORD SET] Password set for user: ${email}`);
    res.json({ message: "Password set successfully" });
  } catch (err) {
    console.error("[SET PASSWORD ERROR]", err);
    res.status(500).json({ message: "Password set error", error: err.message });
  }
});

/**
 * Change password endpoint (authenticated users)
 */
router.post("/change-password", protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords required" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid)
      return res.status(401).json({ message: "Current password is incorrect" });

    // Set new password (pre-save hook will hash it)
    user.passwordHash = newPassword;
    await user.save();

    console.log(`[PASSWORD CHANGED] Password changed for user: ${user.email}`);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("[CHANGE PASSWORD ERROR]", err);
    res.status(500).json({ message: "Password change error", error: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    console.log(`[/auth/me] User requested: ${req.user.email}`);
    const userResponse = req.user.toObject ? req.user.toObject() : req.user;
    delete userResponse.passwordHash;
    
    console.log(`[/auth/me] Returning user ${req.user.email}, role: ${req.user.role}`);
    res.json({ user: userResponse });
  } catch (err) {
    console.error("[/auth/me ERROR]", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

/**
 * Refresh token endpoint
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Check if user is still active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is inactive" });
    }

    // Generate new access token
    const accessToken = signToken({ id: user._id, role: user.role });

    // Optionally generate new refresh token for rotation
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update user's refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    delete userResponse.refreshToken;

    res.json({
      user: userResponse,
      token: accessToken,
      accessToken: accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error("[REFRESH TOKEN ERROR]", err);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

/**
 * Logout endpoint
 */
router.post("/logout", (req, res) => {
  // Logout is handled by frontend clearing localStorage
  // Backend can optionally blacklist tokens here
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
