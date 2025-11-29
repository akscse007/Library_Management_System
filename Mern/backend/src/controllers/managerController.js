const User = require('../models/User');
const Borrow = require('../models/Borrow');
const Fine = require('../models/Fine');

// List students with simple summary of active borrows and unpaid fines
exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).lean();
    const result = [];
    for (const s of students) {
      const [activeBorrows, unpaidFines] = await Promise.all([
        Borrow.countDocuments({ student: s._id, returnedAt: { $exists: false } }),
        Fine.aggregate([
          { $match: { student: s._id, paid: false } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
      ]);
      const finesAgg = unpaidFines[0] || { total: 0, count: 0 };
      result.push({
        id: s._id,
        name: s.name,
        email: s.email,
        role: s.role,
        accountStatus: s.accountStatus,
        activeBorrows,
        unpaidFineAmount: finesAgg.total,
        unpaidFineCount: finesAgg.count,
      });
    }
    res.json(result);
  } catch (err) { next(err); }
};

// Manager / accountant can update account status (active/suspended/inactive)
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body || {};
    if (!['active', 'suspended', 'inactive'].includes(accountStatus)) {
      return res.status(400).json({ message: 'Invalid accountStatus' });
    }
    const user = await User.findByIdAndUpdate(id, { accountStatus }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
    });
  } catch (err) { next(err); }
};

// Simple fines overview for manager dashboard
exports.finesOverview = async (req, res, next) => {
  try {
    const unpaidAgg = await Fine.aggregate([
      { $match: { paid: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const todayStr = new Date().toISOString().slice(0, 10);
    const start = new Date(todayStr + 'T00:00:00.000Z');
    const end = new Date(todayStr + 'T23:59:59.999Z');
    const todayAgg = await Fine.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      unpaid: unpaidAgg[0] || { total: 0, count: 0 },
      today: todayAgg[0] || { total: 0, count: 0 },
    });
  } catch (err) { next(err); }
};
