const express = require('express');
const { raiseOrder, confirmOrder, markDelivered } = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const router = express.Router();

router.post('/', protect, authorize('manager','librarian','admin'), raiseOrder);
router.patch('/:orderId/confirm', protect, authorize('manager','admin'), confirmOrder);
router.patch('/:orderId/deliver', protect, authorize('supplier','manager','admin'), markDelivered);

module.exports = router;
