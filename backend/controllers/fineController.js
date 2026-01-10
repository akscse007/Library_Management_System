/**
 * backend/controllers/fineController.js
 *
 * Thin shim that re-exports the real implementation from src/controllers/fineController.js
 * so that route files requiring '../controllers/fineController' get full functionality.
 */

module.exports = require('../src/controllers/fineController');
