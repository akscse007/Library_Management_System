const express = require('express');
const { listFines, confirmPayment, createManualFine, dailyFines } = require('../controllers/fineController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const router = express.Router();

// List fines (student sees own; manager views via overview; librarian/accountant/admin see full list)
router.get('/', protect, authorize('student','accountant','librarian','admin','manager'), listFines);

// Daily fines report for accountant / manager dashboards
router.get('/daily', protect, authorize('accountant','manager','admin'), dailyFines);

// Create a manual fine (accountant or librarian)
router.post('/manual', protect, authorize('accountant','librarian','admin'), createManualFine);

// Confirm payment of a fine
router.patch('/:id/confirm', protect, authorize('accountant','admin'), confirmPayment);

module.exports = router;
