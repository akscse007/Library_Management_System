// backend/src/middlewares/protect.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    let token;
    // 1) Check cookie
    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    // 2) Or Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'You are not logged in' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select('+password');
    if (!currentUser) return res.status(401).json({ success: false, message: 'User no longer exists' });

    // optional: check passwordChangedAt...
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
