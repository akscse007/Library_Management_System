const express = require('express');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const { issueBook, returnBook, getBorrowHistory } = require('../controllers/borrowController');
const router = express.Router();

router.post('/issue', protect, authorize('librarian','manager','admin'), issueBook);
router.post('/return/:borrowId', protect, authorize('librarian','manager','admin'), returnBook);
router.get('/history/:studentId?', protect, getBorrowHistory);

module.exports = router;
