const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

router.post('/', ctrl.raiseOrder);
router.patch('/:orderId/confirm', ctrl.confirmOrder);
router.patch('/:orderId/deliver', ctrl.markDelivered);

module.exports = router;
