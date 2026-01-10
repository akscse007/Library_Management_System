const express = require('express');
const { createPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');
const router = express.Router();

router.post('/', protect, createPayment);

module.exports = router;
