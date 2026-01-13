// backend/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    required: true,
    enum: ['BOOK_OPERATION', 'BORROW_OPERATION', 'FINE_OPERATION', 'PAYMENT_OPERATION', 'ORDER_OPERATION', 'LEND_REQUEST_OPERATION', 'MANAGER_OPERATION']
  },
  resource: { 
    type: String, 
    required: true,
    enum: ['BOOK', 'BORROW', 'FINE', 'PAYMENT', 'ORDER', 'LEND_REQUEST', 'USER']
  },
  resourceId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: false 
  },
  details: {
    method: String,
    url: String,
    statusCode: Number,
    duration: Number,
    userAgent: String,
    ipAddress: String
  },
  ipAddress: { 
    type: String, 
    required: false 
  },
  userAgent: { 
    type: String, 
    required: false 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 2592000 // TTL: 30 days
  }
});

// Index for efficient queries
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
