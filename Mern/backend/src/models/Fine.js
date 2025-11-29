const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  borrow: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrow' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  reason: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
  receiptId: String
});

module.exports = mongoose.model('Fine', fineSchema);
