// middlewares/errorHandler.js
/**
 * Improved error handler that prints raw body on JSON parse errors.
 * Drop this file into backend/middlewares/errorHandler.js (overwrite).
 */

module.exports = (err, req, res, next) => {
  try {
    console.error('=== ERROR HANDLER ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    // If body-parser JSON parse error, log raw body and headers
    if (err instanceof SyntaxError && err.message && (err.message.includes('JSON') || err.message.includes('Unexpected'))) {
      console.error('[ERROR] JSON parse error detected.');
      try {
        console.error('[ERROR] Request path:', req.method, req.originalUrl || req.url);
        console.error('[ERROR] Request headers:', {
          'content-type': req.headers['content-type'],
          referer: req.headers.referer,
          origin: req.headers.origin,
          host: req.headers.host
        });
        if (req.rawBody !== undefined) {
          console.error('[ERROR] Raw request body (full):\n', req.rawBody);
        } else {
          console.error('[ERROR] Raw request body not available (verify hook not set).');
        }
      } catch (logErr) {
        console.error('[ERROR] while printing raw body:', logErr);
      }
    } else {
      // Generic error logging
      console.error(err);
    }
  } catch (handlerErr) {
    console.error('Error while running errorHandler:', handlerErr);
  }

  // Send client-friendly message
  const status = err.status || (err.name === 'SyntaxError' ? 400 : 500);
  const message = err.status ? err.message : (err.name === 'SyntaxError' ? 'Malformed JSON in request body' : 'Server error');
  res.status(status).json({ success: false, message });
};
