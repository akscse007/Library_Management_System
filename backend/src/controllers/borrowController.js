const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');
const calcFine = require('../../utils/calcFine');
const Fine = require('../models/Fine');

exports.issueBook = async (req, res, next) => {
  try {
    const { studentId, bookId, days = 14 } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book unavailable' });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // account status check
    if (student.accountStatus && student.accountStatus !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // unpaid fines block borrowing
    const unpaidFineExists = await Fine.exists({ userId: studentId, status: 'unpaid' });
    if (unpaidFineExists) {
      return res.status(400).json({ message: 'Unpaid fines present; cannot borrow more books' });
    }

    // borrow limit based on active Borrow records
    const maxBooks = student.maxBooks || 2;
    const activeCount = await Borrow.countDocuments({
      student: studentId,
      returnedAt: { $exists: false },
    });
    if (activeCount >= maxBooks) {
      return res.status(400).json({ message: 'Borrow limit reached' });
    }

    const dueAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const borrow = await Borrow.create({ student: studentId, book: bookId, dueAt });

    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(borrow);
  } catch (err) { next(err); }
};

exports.returnBook = async (req, res, next) => {
  try {
    const { borrowId } = req.params;
    const borrow = await Borrow.findById(borrowId).populate('book student');
    if (!borrow) return res.status(404).json({ message: 'Borrow not found' });
    if (borrow.returnedAt) return res.status(400).json({ message: 'Already returned' });

    borrow.returnedAt = new Date();
    borrow.status = 'returned';
    await borrow.save();

    // update book
    const book = await Book.findById(borrow.book._id);
    book.availableCopies += 1;
    await book.save();

    // calculate fine according to business rule:
    // 2 Rs per day after 15 days from borrowing (issuedAt)
    const amount = calcFine(borrow.issuedAt || borrow.createdAt, borrow.returnedAt, 2, 15);
    if (amount > 0) {
      const fine = await Fine.create({
        borrowId: borrow._id,
        userId: borrow.student?._id || borrow.student,
        amount,
        status: 'unpaid',
        issuedDate: borrow.returnedAt,
        dueDate: borrow.dueAt,
      });
      return res.json({ borrow, fine });
    }

    res.json({ borrow, fine: null });
  } catch (err) { next(err); }
};

exports.getBorrowHistory = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user?.id || req.user?._id;
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }
    const records = await Borrow.find({ student: studentId })
      .populate('book')
      .sort('-issuedAt');
    res.json(records);
  } catch (err) { next(err); }
};

// Librarian/manager: list all borrow records, optionally filtered by status and/or book.
exports.listAllBorrows = async (req, res, next) => {
  try {
    const q = {};

    if (req.query.status === 'returned') {
      q.returnedAt = { $exists: true };
    } else if (req.query.status === 'active') {
      q.returnedAt = { $exists: false };
    }

    // Optional filter: only borrows for a particular book (for librarian drill-down).
    if (req.query.book) {
      q.book = req.query.book;
    }

    const records = await Borrow.find(q)
      .populate('book')
      .populate('student')
      .sort('-issuedAt');
    res.json(records);
  } catch (err) { next(err); }
};
