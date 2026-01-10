const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  issuedAt: { type: Date, default: Date.now },
  dueAt: { type: Date, required: true },
  returnedAt: Date,
  finePaid: { type: Boolean, default: false },
  status: { type: String, enum: ['issued','returned','overdue'], default: 'issued' }
});

module.exports = mongoose.model('Borrow', borrowSchema);
