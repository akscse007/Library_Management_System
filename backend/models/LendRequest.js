const mongoose = require('mongoose');

// Schema aligned with MongoDB lendRequests validator
// required: userId, bookId, requestDate, status, createdAt
const lendRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  requestDate: { type: Date, default: Date.now, required: true },
  approveDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  returnDate: { type: Date, default: null },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue'],
    default: 'pending',
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  fine: { type: Number, default: null },
  notes: { type: String, default: null, maxlength: 1000 },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false,
});

module.exports = mongoose.model('LendRequest', lendRequestSchema);
