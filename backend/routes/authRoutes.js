const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Simple, robust wiring to the real authController implementation.
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/google', authCtrl.googleSignIn);
router.post('/refresh', authCtrl.refreshToken);
router.post('/logout', authCtrl.logout);

// /me uses jwtAuth via middleware/auth shim; returns a compact user DTO
router.get('/me', authMiddleware, (req, res) => {
  const u = req.user;
  if (!u) return res.status(401).json({ success: false, message: 'Not authenticated' });
  return res.json({
    success: true,
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      accountStatus: u.accountStatus,
      maxBooks: u.maxBooks,
    },
  });
});

module.exports = router;
