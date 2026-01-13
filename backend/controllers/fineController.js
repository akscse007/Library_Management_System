const mongoose = require('mongoose');
const Fine = require('../models/Fine');
const Borrow = require('../models/Borrow');

exports.listFines = async (req, res, next) => {
  try {
    const q = {};
    if (req.query.student) q.userId = req.query.student;
    if (req.query.paid) {
      q.status = req.query.paid === 'true' ? 'paid' : 'unpaid';
    }
    const fines = await Fine.find(q).populate('userId').populate('borrowId');
    res.json(fines);
  } catch (err) { next(err); }
};

// Accountant (or librarian): create manual fine with a cause.
//
// The fines collection validator requires borrowId, amount and createdAt.
// For manual fines where no specific borrow is provided, we synthesize a minimal
// Borrow document linked to the student so validation always passes.
exports.createManualFine = async (req, res, next) => {
  try {
    const { studentId, amount, reason, borrowId } = req.body || {};
    if (!studentId || amount == null) {
      return res.status(400).json({ message: 'studentId and amount are required' });
    }

    let effectiveBorrowId = borrowId;

    // If caller did not supply a borrowId, create a lightweight "manual" borrow record.
    if (!effectiveBorrowId) {
      const dummyBookId = new mongoose.Types.ObjectId();
      const borrow = await Borrow.create({
        student: studentId,
        book: dummyBookId,
        dueAt: new Date(),
      });
      effectiveBorrowId = borrow._id;
    }

    const fine = await Fine.create({
      borrowId: effectiveBorrowId,
      userId: studentId,
      amount,
      reason: reason || null,
      status: 'unpaid',
      issuedDate: new Date(),
    });
    res.status(201).json(fine);
  } catch (err) { next(err); }
};

// Accountant: list fines created on a specific day
exports.dailyFines = async (req, res, next) => {
  try {
    const dateStr = req.query.date; // YYYY-MM-DD
    if (!dateStr) return res.status(400).json({ message: 'date query param required (YYYY-MM-DD)' });
    const start = new Date(dateStr + 'T00:00:00.000Z');
    const end = new Date(dateStr + 'T23:59:59.999Z');
    const fines = await Fine.find({ createdAt: { $gte: start, $lte: end } })
      .populate('userId')
      .populate('borrowId');
    res.json(fines);
  } catch (err) { next(err); }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });
    fine.status = 'paid';
    fine.paidDate = new Date();
    await fine.save();
    res.json(fine);
  } catch (err) { next(err); }
};
