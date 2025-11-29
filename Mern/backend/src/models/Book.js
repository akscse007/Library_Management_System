const mongoose = require('mongoose');

// Schema aligned with MongoDB books collection validator provided by user.
const bookSchema = new mongoose.Schema({
  isbn: { type: String, required: true, index: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },

  publisher: { type: String, default: null },
  publicationYear: { type: Number, default: null }, // int in validator
  genre: { type: String, default: null },
  edition: { type: String, default: null },
  language: { type: String, default: null },

  totalCopies: { type: Number, required: true, min: 0 },
  availableCopies: { type: Number, required: true, min: 0 },
  shelfLocation: { type: String, default: null },
  status: {
    type: String,
    enum: ['available', 'reference-only', 'archived', 'out-of-print', 'lost'],
    default: 'available',
  },
  price: { type: Number, default: null },
  acquiredDate: { type: Date, default: null },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  versionKey: false,
});

module.exports = mongoose.model('Book', bookSchema);
