const express = require('express');
const { addBook, getAllBooks, getBookById, updateBook } = require('../controllers/bookController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roles');
const router = express.Router();

router.get('/', protect, getAllBooks);
router.post('/', protect, authorize('admin','manager','librarian'), addBook);
router.get('/:id', protect, getBookById);
router.put('/:id', protect, authorize('admin','manager','librarian'), updateBook);

module.exports = router;
