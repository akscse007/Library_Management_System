const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fine: { type: mongoose.Schema.Types.ObjectId, ref: 'Fine' },
  amount: Number,
  provider: String,
  providerRef: String,
  success: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
