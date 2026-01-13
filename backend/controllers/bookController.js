const Book = require("../models/Book");

const addBook = async (req, res, next) => {
  try {
    const payload = req.body || {};

    if (payload.totalCopies != null && payload.availableCopies == null) {
      payload.availableCopies = payload.totalCopies;
    }

    if (payload.availableCopies > payload.totalCopies) {
      return res.status(400).json({
        message: "availableCopies cannot exceed totalCopies",
      });
    }

    const existing = await Book.findOne({ isbn: payload.isbn });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Book with this ISBN already exists" });
    }

    const book = await Book.create(payload);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
};

const getAllBooks = async (req, res, next) => {
  try {
    const q = {};

    if (req.query.q) {
      q.$or = [
        { title: { $regex: req.query.q, $options: "i" } },
        { author: { $regex: req.query.q, $options: "i" } },
        { isbn: { $regex: req.query.q, $options: "i" } },
      ];
    }

    if (req.query.lowStock === "true") {
      const threshold = Number(req.query.threshold) || 2;
      q.availableCopies = { $lte: threshold };
    }

    const books = await Book.find(q);
    res.json(books);
  } catch (err) {
    next(err);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book)
      return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    next(err);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(book);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
};
