const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  issuedAt: { type: Date, default: Date.now },
  // For requested borrows we still set a provisional dueAt in the controller,
  // but we relax the validator here so legacy records without dueAt are allowed.
  dueAt: { type: Date, required: false },
  returnedAt: Date,
  finePaid: { type: Boolean, default: false },
  status: { type: String, enum: ['requested','issued','returned','overdue'], default: 'issued' }
});

module.exports = mongoose.model('Borrow', borrowSchema);
