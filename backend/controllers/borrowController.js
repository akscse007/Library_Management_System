const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const User = require("../models/User");
const calcFine = require("../utils/calcFine");
const Fine = require("../models/Fine");

/**
 * STUDENT → request borrow
 */
exports.requestBorrow = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: "Book unavailable" });
    }

    // prevent duplicate active/requested borrows
    const exists = await Borrow.exists({
      student: studentId,
      book: bookId,
      status: { $in: ["requested", "issued"] },
    });
    if (exists) {
      return res.status(400).json({ message: "Already requested or borrowed" });
    }

    // For compatibility with Mongo validator we create a light-weight requested
    // borrow with a provisional due date. Librarian approval will overwrite
    // issuedAt/dueAt when the book is actually issued.
    const borrow = await Borrow.create({
      student: studentId,
      book: bookId,
      status: "requested",
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json(borrow);
  } catch (err) {
    next(err);
  }
};

/**
 * LIBRARIAN → approve borrow (issue book)
 */
exports.issueBook = async (req, res, next) => {
  try {
    const { borrowId, days = 14 } = req.body;

    const borrow = await Borrow.findById(borrowId).populate("book student");
    if (!borrow) {
      return res.status(404).json({ message: "Borrow request not found" });
    }
    if (borrow.status !== "requested") {
      return res.status(400).json({ message: "Invalid borrow state" });
    }

    const book = borrow.book;
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: "Book unavailable" });
    }

    const student = borrow.student;

    // unpaid fines block borrowing
    const unpaidFineExists = await Fine.exists({
      userId: student._id,
      status: "unpaid",
    });
    if (unpaidFineExists) {
      return res.status(400).json({ message: "Unpaid fines present" });
    }

    const maxBooks = student.maxBooks || 2;
    const activeCount = await Borrow.countDocuments({
      student: student._id,
      status: "issued",
    });
    if (activeCount >= maxBooks) {
      return res.status(400).json({ message: "Borrow limit reached" });
    }

    borrow.status = "issued";
    borrow.issuedAt = new Date();
    borrow.dueAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await borrow.save();

    book.availableCopies -= 1;
    await book.save();

    res.json(borrow);
  } catch (err) {
    next(err);
  }
};

/**
 * LIBRARIAN → reject borrow request
 */
exports.rejectBorrow = async (req, res, next) => {
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    if (borrow.status !== "requested") {
      return res.status(400).json({
        message: "Only requested borrows can be rejected",
      });
    }

    // simple, clean rejection for phase-1
    await borrow.deleteOne();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * LIBRARIAN → return book
 */
exports.returnBook = async (req, res, next) => {
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId).populate("book student");
    if (!borrow) {
      return res.status(404).json({ message: "Borrow not found" });
    }
    if (borrow.returnedAt) {
      return res.status(400).json({ message: "Already returned" });
    }

    borrow.returnedAt = new Date();
    borrow.status = "returned";
    await borrow.save();

    const book = await Book.findById(borrow.book._id);
    book.availableCopies += 1;
    await book.save();

    const amount = calcFine(
      borrow.issuedAt,
      borrow.returnedAt,
      2,
      15
    );

    if (amount > 0) {
      const fine = await Fine.create({
        borrowId: borrow._id,
        userId: borrow.student._id,
        amount,
        status: "unpaid",
        issuedDate: borrow.returnedAt,
        dueDate: borrow.dueAt,
      });
      return res.json({ borrow, fine });
    }

    res.json({ borrow, fine: null });
  } catch (err) {
    next(err);
  }
};

/**
 * STUDENT → borrow history (with pagination)
 */
exports.getBorrowHistory = async (req, res, next) => {
  try {
    const studentId =
      req.params.studentId || req.user.id || req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { student: studentId };
    if (req.query.status) filter.status = req.query.status;

    const total = await Borrow.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const records = await Borrow.find(filter)
      .populate("book")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    res.json({
      borrows: records,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * LIBRARIAN → list all borrows (with pagination)
 */
exports.listAllBorrows = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) filter.student = req.query.studentId;
    if (req.query.bookId) filter.book = req.query.bookId;

    const total = await Borrow.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const records = await Borrow.find(filter)
      .populate("book")
      .populate("student")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    res.json({
      borrows: records,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    next(err);
  }
};
/**
 * LIBRARIAN → reject borrow request
 */
exports.rejectBorrow = async (req, res, next) => {
  try {
    const { borrowId } = req.params;

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow request not found" });
    }

    if (borrow.status !== "requested") {
      return res.status(400).json({ message: "Cannot reject this borrow" });
    }

    borrow.status = "rejected";
    await borrow.save();

    res.json({ message: "Borrow request rejected" });
  } catch (err) {
    next(err);
  }
};
