const mongoose = require('mongoose');

// Schema aligned with MongoDB fines validator
// required: borrowId, amount, createdAt; additionalProperties: true
const fineSchema = new mongoose.Schema({
  borrowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrow', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reason: { type: String, default: null },
  issuedDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  paidDate: { type: Date, default: null },
  status: { type: String, enum: ['unpaid', 'paid', 'waived', null], default: 'unpaid' },
  amount: { type: Number, required: true, min: 0 },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false,
});

module.exports = mongoose.model('Fine', fineSchema);
