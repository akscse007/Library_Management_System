const LendRequest = require('../models/LendRequest');
const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const Fine = require('../models/Fine');
const calcFine = require('../../utils/calcFine');

// Student: create a lend request
exports.createRequest = async (req, res, next) => {
  try {
    const { studentId, userId, bookId, reason } = req.body || {};
    const sid = studentId || userId;
    if (!sid || !bookId) {
      return res.status(400).json({ message: 'studentId/userId and bookId are required' });
    }

    const [student, book] = await Promise.all([
      User.findById(sid),
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

    const unpaidFineExists = await Fine.exists({ userId: sid, status: 'unpaid' });
    if (unpaidFineExists) {
      return res.status(400).json({ message: 'Unpaid fines present; cannot borrow more books' });
    }

    const maxBooks = student.maxBooks || 2;
    const activeCount = await Borrow.countDocuments({
      student: sid,
      returnedAt: { $exists: false },
    });
    if (activeCount >= maxBooks) {
      return res.status(400).json({ message: 'Borrow limit reached' });
    }

    const reqDoc = await LendRequest.create({
      userId: sid,
      bookId,
      requestDate: new Date(),
      status: 'pending',
      notes: reason || null,
    });

    res.status(201).json(reqDoc);
  } catch (err) { next(err); }
};

// Student & manager: list requests for a student or all
exports.listRequests = async (req, res, next) => {
  try {
    const { student, status } = req.query || {};
    const q = {};
    if (student) q.userId = student;
    if (status) q.status = status;
    const docs = await LendRequest.find(q)
      .populate('userId', 'name email role')
      .populate('bookId', 'title author availableCopies isbn')
      .sort('-createdAt');
    res.json(docs);
  } catch (err) { next(err); }
};

// Manager: approve request -> create Borrow
exports.approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mgrId = req.user?.id || req.user?._id || null;
    const reqDoc = await LendRequest.findById(id).populate('userId').populate('bookId');
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending') {
      return res.status(400).json({ message: 'Request already handled' });
    }

    const student = reqDoc.userId;
    const book = reqDoc.bookId;

    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book unavailable' });
    }

    if (student.accountStatus && student.accountStatus !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const unpaidFineExists = await Fine.exists({ userId: student._id, status: 'unpaid' });
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
    reqDoc.approveDate = new Date();
    reqDoc.dueDate = dueAt;
    reqDoc.approvedBy = mgrId;
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
    reqDoc.approvedBy = mgrId;
    await reqDoc.save();
    res.json(reqDoc);
  } catch (err) { next(err); }
};
