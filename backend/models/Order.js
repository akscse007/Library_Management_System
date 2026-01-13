const mongoose = require('mongoose');

// Order schema aligned with bookOrders validator shared by user.
// We keep existing helper fields (bookTitle, isbn, quantity, requestedBy) but also
// populate the required JSON Schema fields so inserts always pass validation.
const orderSchema = new mongoose.Schema({
  // existing helper fields for UI
  bookTitle: { type: String, default: null },
  isbn: { type: String, default: null },
  quantity: { type: Number, default: 1 },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // validator fields
  approvedDate: { type: Date, default: null },
  // createdAt is required; we let Mongoose timestamps manage it
  items: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  }],
  notes: { type: String, default: null },
  orderDate: { type: Date, default: Date.now },
  receivedDate: { type: Date, default: null },
  status: { type: String, default: 'requested' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, required: true },
  totalAmount: { type: Number, required: true },
  updatedAt: { type: Date, default: null },

  deliveredAt: { type: Date, default: null },
  supplierInfo: { type: String, default: null },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'bookOrders',
});

module.exports = mongoose.model('Order', orderSchema);
