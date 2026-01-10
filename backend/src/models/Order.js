const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  bookTitle: String,
  isbn: String,
  quantity: { type: Number, default: 1 },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['requested','confirmed','delivered','cancelled'], default: 'requested' },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: Date,
  supplierInfo: String
});

module.exports = mongoose.model('Order', orderSchema);
