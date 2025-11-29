const Payment = require('../models/Payment');
const Fine = require('../models/Fine');

exports.createPayment = async (req, res, next) => {
  try {
    const { fineId, provider, providerRef } = req.body;
    const fine = await Fine.findById(fineId);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });

    // create payment record - use fine.student so we don't depend on req.user
    const payment = await Payment.create({
      student: fine.student,
      fine: fineId,
      amount: fine.amount,
      provider,
      providerRef,
      success: true, // in real integration, verify with gateway
    });

    fine.paid = true;
    fine.paidAt = new Date();
    fine.receiptId = `R-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    await fine.save();

    res.status(201).json({ payment, fine });
  } catch (err) { next(err); }
};
