/**
 * E:\Codes\LibRepo\Mern\backend\middleware\auth.js
 * Compatibility shim — re-exports the real middleware implementation.
 */

try {
  // Prefer the existing middlewares folder if present
  module.exports = require('../middlewares/jwtAuth');
} catch (e) {
  try {
    // Fallback to src middleware (common in some project layouts)
    module.exports = require('../src/middleware/auth');
  } catch (err) {
    throw new Error('Auth middleware not found. Expected ../middlewares/jwtAuth or ../src/middleware/auth. Original errors: ' + e.message + ' | ' + err.message);
  }
}
