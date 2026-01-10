const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/borrowController');

router.post('/issue', ctrl.issueBook);
router.post('/return/:borrowId', ctrl.returnBook);
router.get('/history/:studentId?', ctrl.getBorrowHistory);
// list all borrows (for librarian returns view)
router.get('/', ctrl.listAllBorrows);

module.exports = router;
