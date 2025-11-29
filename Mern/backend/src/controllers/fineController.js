const Fine = require('../models/Fine');

exports.listFines = async (req, res, next) => {
  try {
    const q = {};
    if (req.query.student) q.student = req.query.student;
    if (req.query.paid) q.paid = req.query.paid === 'true';
    const fines = await Fine.find(q).populate('student borrow');
    res.json(fines);
  } catch (err) { next(err); }
};

// Accountant: create manual fine with a cause
exports.createManualFine = async (req, res, next) => {
  try {
    const { studentId, amount, reason } = req.body || {};
    if (!studentId || !amount) {
      return res.status(400).json({ message: 'studentId and amount are required' });
    }
    const fine = await Fine.create({
      student: studentId,
      amount,
      reason: reason || undefined,
      createdBy: req.user && req.user.id ? req.user.id : undefined,
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
    const fines = await Fine.find({ createdAt: { $gte: start, $lte: end } }).populate('student borrow');
    res.json(fines);
  } catch (err) { next(err); }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });
    fine.paid = true;
    fine.paidAt = new Date();
    fine.receiptId = `R-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    await fine.save();
    res.json(fine);
  } catch (err) { next(err); }
};
