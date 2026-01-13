const express = require('express');
const { listOrders, raiseOrder, confirmOrder, markDelivered } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const router = express.Router();

// List all orders for history views (librarian, manager, stock manager, admin)
router.get('/', protect, authorize('librarian','manager','stock_manager','admin'), listOrders);

// Raise a new order (manager, librarian, stock manager, admin)
router.post('/', protect, authorize('manager','librarian','stock_manager','admin'), raiseOrder);

// Confirm and mark delivered (manager/admin, supplier_contact)
router.patch('/:orderId/confirm', protect, authorize('manager','admin'), confirmOrder);
router.patch('/:orderId/deliver', protect, authorize('supplier_contact','manager','admin'), markDelivered);

module.exports = router;
