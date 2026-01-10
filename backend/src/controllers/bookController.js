const Book = require('../models/Book');

// create book (admin/manager)
exports.addBook = async (req, res, next) => {
  try {
    const payload = req.body || {};
    // ensure availableCopies is not more than totalCopies
    if (payload.totalCopies != null && payload.availableCopies == null) {
      payload.availableCopies = payload.totalCopies;
    }
    if (payload.availableCopies > payload.totalCopies) {
      return res.status(400).json({ message: 'availableCopies cannot exceed totalCopies' });
    }
    const existing = await Book.findOne({ isbn: payload.isbn });
    if (existing) {
      return res.status(409).json({ message: 'Book with this ISBN already exists' });
    }

    const b = await Book.create(payload);
    res.status(201).json(b);
  } catch (err) { next(err); }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const q = {};

    // Optional text search across title/author/isbn
    if (req.query.q) {
      q.$or = [
        { title: { $regex: req.query.q, $options: 'i' } },
        { author: { $regex: req.query.q, $options: 'i' } },
        { isbn: { $regex: req.query.q, $options: 'i' } },
      ];
    }

    // Optional low-stock filter for stock manager dashboard
    if (req.query.lowStock === 'true') {
      const threshold = Number(req.query.threshold) || 2;
      // If there is already a $or text query, we still want to enforce low stock,
      // so we simply add another top-level condition.
      q.availableCopies = { $lte: threshold };
    }

    const books = await Book.find(q).lean();
    res.json(books);
  } catch (err) { next(err); }
};

exports.getBookById = async (req, res, next) => {
  try {
    const b = await Book.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Book not found' });
    res.json(b);
  } catch (err) { next(err); }
};

// update stock when delivered or changed
exports.updateBook = async (req, res, next) => {
  try {
    const b = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(b);
  } catch (err) { next(err); }
};
