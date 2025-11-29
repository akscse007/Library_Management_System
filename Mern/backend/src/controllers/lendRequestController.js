const LendRequest = require('../models/LendRequest');
const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const Fine = require('../models/Fine');
const calcFine = require('../../utils/calcFine');

// Student: create a lend request
exports.createRequest = async (req, res, next) => {
  try {
    const { studentId, bookId, reason } = req.body || {};
    if (!studentId || !bookId) {
      return res.status(400).json({ message: 'studentId and bookId are required' });
    }

    const [student, book] = await Promise.all([
      User.findById(studentId),
      Book.findById(bookId),
    ]);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book unavailable' });
    }

    // Apply the same rules as issuing directly
    if (student.accountStatus && student.accountStatus !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const unpaidFineExists = await Fine.exists({ student: studentId, paid: false });
    if (unpaidFineExists) {
      return res.status(400).json({ message: 'Unpaid fines present; cannot borrow more books' });
    }

    const maxBooks = student.maxBooks || 2;
    const activeCount = await Borrow.countDocuments({
      student: studentId,
      returnedAt: { $exists: false },
    });
    if (activeCount >= maxBooks) {
      return res.status(400).json({ message: 'Borrow limit reached' });
    }

    const reqDoc = await LendRequest.create({
      requester: studentId,
      book: bookId,
      reason: reason || undefined,
    });

    res.status(201).json(reqDoc);
  } catch (err) { next(err); }
};

// Student & manager: list requests for a student or all
exports.listRequests = async (req, res, next) => {
  try {
    const { student, status } = req.query || {};
    const q = {};
    if (student) q.requester = student;
    if (status) q.status = status;
    const docs = await LendRequest.find(q)
      .populate('requester', 'name email role')
      .populate('book', 'title author availableCopies isbn')
      .sort('-createdAt');
    res.json(docs);
  } catch (err) { next(err); }
};

// Manager: approve request -> create Borrow
exports.approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mgrId = req.user?.id || req.user?._id || null;
    const reqDoc = await LendRequest.findById(id).populate('requester').populate('book');
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') {
      return res.status(400).json({ message: 'Request already handled' });
    }

    const student = reqDoc.requester;
    const book = reqDoc.book;

    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book unavailable' });
    }

    if (student.accountStatus && student.accountStatus !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const unpaidFineExists = await Fine.exists({ student: student._id, paid: false });
    if (unpaidFineExists) {
      return res.status(400).json({ message: 'Unpaid fines present; cannot borrow more books' });
    }

    const maxBooks = student.maxBooks || 2;
    const activeCount = await Borrow.countDocuments({
      student: student._id,
      returnedAt: { $exists: false },
    });
    if (activeCount >= maxBooks) {
      return res.status(400).json({ message: 'Borrow limit reached' });
    }

    const dueAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const borrow = await Borrow.create({ student: student._id, book: book._id, dueAt });

    book.availableCopies -= 1;
    await book.save();

    reqDoc.status = 'approved';
    reqDoc.handledBy = mgrId;
    await reqDoc.save();

    res.json({ request: reqDoc, borrow });
  } catch (err) { next(err); }
};

// Manager: reject request
exports.rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mgrId = req.user?.id || req.user?._id || null;
    const reqDoc = await LendRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') {
      return res.status(400).json({ message: 'Request already handled' });
    }
    reqDoc.status = 'rejected';
    reqDoc.handledBy = mgrId;
    await reqDoc.save();
    res.json(reqDoc);
  } catch (err) { next(err); }
};
