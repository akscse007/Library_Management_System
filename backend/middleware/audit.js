const AuditLog = require('../models/AuditLog');

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const startTime = Date.now();

    // Override res.send to log after response
    res.send = function(data) {
      const duration = Date.now() - startTime;

      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          const logEntry = {
            user: req.user._id,
            action: action,
            resource: resource,
            resourceId: getResourceId(req, resource),
            details: {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode,
              duration: duration,
              userAgent: req.get('User-Agent'),
              ipAddress: req.ip || req.connection.remoteAddress
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
          };

          // Log asynchronously without blocking response
          AuditLog.create(logEntry).catch(err => {
            console.error('Audit logging failed:', err.message);
          });
        } catch (err) {
          console.error('Audit logging error:', err.message);
        }
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

// Helper function to extract resource ID from request
function getResourceId(req, resource) {
  switch (resource) {
    case 'BOOK':
      return req.params.id || req.params.bookId;
    case 'BORROW':
      return req.params.id || req.params.borrowId;
    case 'FINE':
      return req.params.id;
    case 'PAYMENT':
      return req.params.id;
    case 'ORDER':
      return req.params.id || req.params.orderId;
    case 'LEND_REQUEST':
      return req.params.id;
    case 'USER':
      return req.params.id || req.user._id;
    default:
      return null;
  }
}

module.exports = auditLogger;
