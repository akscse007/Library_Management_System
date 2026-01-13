const express = require("express");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

const {
  addBook,
  getAllBooks,
  getBookById,
  updateBook,
} = require("../controllers/bookController");

const router = express.Router();

router.get("/", protect, getAllBooks);
router.get("/:id", protect, getBookById);

router.post("/", protect, authorize("admin", "manager", "librarian", "stock_manager"), addBook);
router.put("/:id", protect, authorize("admin", "manager", "librarian", "stock_manager"), updateBook);

module.exports = router;
