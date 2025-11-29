// backend/src/routes/authRouters.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library'); // optional: only if using Google sign-in
const router = express.Router();

// adjust these to match your project structure:
const User = require('../models/User'); // <- ensure this path is correct
const authMiddleware = require('../middleware/auth'); // optional token middleware (example below)

// ENV required:
// JWT_SECRET  (e.g. "supersecret")
// JWT_EXPIRES_IN (optional, e.g. "7d")
// GOOGLE_CLIENT_ID (optional, if using Google login)

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_real_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

/**
 * Helper: generate JWT
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * REGISTER
 * POST /api/auth/register
 * body: { name, email, password, role }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || 'student', // default role
    });

    await user.save();

    const token = signToken({ id: user._id, role: user.role });

    res.status(201).json({
      message: 'User registered',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * LOGIN (local)
 * POST /api/auth/login
 * body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user._id, role: user.role });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GOOGLE SIGN-IN (optional)
 * POST /api/auth/google
 * body: { idToken }  // ID token from client Google Identity
 *
 * This verifies the idToken server-side, upserts a user, and returns a JWT.
 */
router.post('/google', async (req, res) => {
  if (!googleClient) return res.status(400).json({ message: 'Google client not configured' });
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken required' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // contains email, name, picture, etc.

    if (!payload || !payload.email) return res.status(400).json({ message: 'Invalid token' });

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      // create a user with a random password (they'll sign in through Google)
      user = new User({
        name: payload.name || 'Google User',
        email,
        password: (Math.random() + 1).toString(36).slice(2), // not used
        role: 'student',
        google: true,
      });
      await user.save();
    }

    const token = signToken({ id: user._id, role: user.role });
    res.json({
      message: 'Google sign-in successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error('Google signin error:', err);
    res.status(500).json({ message: 'Google signin failed' });
  }
});

/**
 * Example protected route
 * GET /api/auth/me
 * header: Authorization: Bearer <token>
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
