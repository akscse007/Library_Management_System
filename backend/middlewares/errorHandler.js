/**
 * E:\Codes\LibRepo\Mern\backend\middlewares\errorHandler.js
 *
 * Centralized error handler. Placed last in middleware chain in server.js.
 * Logs error and returns a JSON response with status code.
 */

module.exports = (err, req, res, next) => {
  // Provide richer debug information in development
  const isDev = process.env.NODE_ENV !== 'production';

  console.error('Unhandled error:', {
    message: err?.message,
    stack: isDev ? err?.stack : undefined
  });

  const status = err.statusCode && Number.isFinite(err.statusCode) ? err.statusCode : 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDev ? { stack: err.stack } : {})
  });
};
