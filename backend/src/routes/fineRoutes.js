const express = require('express');
const { listFines, confirmPayment } = require('../controllers/fineController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const router = express.Router();

router.get('/', protect, authorize('accountant','librarian','admin'), listFines);
router.patch('/:id/confirm', protect, authorize('accountant','admin'), confirmPayment);

module.exports = router;
