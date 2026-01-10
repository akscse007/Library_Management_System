const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

// list all orders (for librarian order history / stock manager dashboard)
router.get('/', ctrl.listOrders);
router.post('/', ctrl.raiseOrder);
router.patch('/:orderId/confirm', ctrl.confirmOrder);
router.patch('/:orderId/deliver', ctrl.markDelivered);

module.exports = router;
