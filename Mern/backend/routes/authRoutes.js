/**
 * E:\Codes\LibRepo\Mern\backend\routes\authRoutes.js
 *
 * Crash-proof router: never calls router.post with undefined.
 * - Attempts to load authController from common locations.
 * - For missing handlers it mounts a fallback handler that returns a clear JSON error.
 * - Logs details to console so you can see what's missing.
 *
 * This prevents the app from crashing and gives actionable diagnostics.
 */

const express = require('express');
const router = express.Router();

function tryRequire(paths) {
  let lastErr = null;
  for (const p of paths) {
    try {
      const mod = require(p);
      return { mod, path: p };
    } catch (err) {
      lastErr = err;
    }
  }
  return { error: lastErr };
}

const attempt = tryRequire([
  '../controllers/authController',
  '../src/controllers/authController',
  './authController',
  '../controllers/auth'
]);

if (attempt.error) {
  console.warn('authRoutes: warning — could not require authController from common paths. Last error:', attempt.error.message);
} else {
  console.log('authRoutes: loaded authController from', attempt.path, 'type:', typeof attempt.mod);
  if (attempt.mod && typeof attempt.mod === 'object') {
    console.log('authRoutes: controller keys ->', Object.keys(attempt.mod));
  }
}

const authCtrl = attempt.mod || {};

// helper to make a fallback handler that returns JSON with helpful message
function fallbackHandler(name) {
  return (req, res) => {
    const msg = `authRoutes: handler "${name}" is not implemented on the server. Check controllers/authController.js export.`;
    console.warn(msg);
    return res.status(501).json({ success: false, message: msg });
  };
}

// safe getter: returns the function if present, otherwise a fallback that logs
function getHandler(name) {
  const fn = authCtrl && typeof authCtrl[name] === 'function' ? authCtrl[name] : null;
  if (!fn) {
    console.warn(`authRoutes: missing handler -> ${name}`);
    return fallbackHandler(name);
  }
  return fn;
}

// mount routes using safe handlers
router.post('/register', getHandler('register'));
router.post('/login', getHandler('login'));
router.post('/google', getHandler('googleSignIn'));
router.post('/refresh', getHandler('refreshToken'));
router.post('/logout', getHandler('logout'));

// Protected /me route — try to load verifyToken from common middleware locations
let verifyToken = null;
const mwAttempt = tryRequire([
  '../middleware/auth',
  '../middlewares/jwtAuth',
  '../src/middleware/auth',
  '../src/middleware/authMiddleware',
  '../middlewares/auth'
]);

if (mwAttempt.error) {
  console.warn('authRoutes: verifyToken middleware not found via fallbacks. Protected routes will return diagnostic responses.');
} else {
  console.log('authRoutes: loaded middleware from', mwAttempt.path, 'type:', typeof mwAttempt.mod);
  const mw = mwAttempt.mod;
  verifyToken = (mw && typeof mw.verifyToken === 'function') ? mw.verifyToken : (typeof mw === 'function' ? mw : null);
  if (!verifyToken) {
    console.warn('authRoutes: verifyToken resolved but is not a function; it will not be used for /me.');
  }
}

if (typeof verifyToken === 'function') {
  router.get('/me', verifyToken, (req, res) => res.json({ success: true, user: req.user }));
} else {
  router.get('/me', (req, res) => res.status(501).json({ success: false, message: 'Auth middleware (verifyToken) not configured on server.' }));
}

module.exports = router;
