const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');

router.post('/', ctrl.createPayment);

module.exports = router;
