const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookController');

router.get('/', ctrl.getAllBooks);
router.post('/', ctrl.addBook);
router.get('/:id', ctrl.getBookById);
router.put('/:id', ctrl.updateBook);

module.exports = router;
