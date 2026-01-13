const express = require("express");
const router = express.Router();

const { getMostBorrowedBooks } = require("../controllers/analyticsController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

// Librarian / Manager / Admin can view analytics
router.get(
  "/most-borrowed-books",
  protect,
  authorize("librarian", "manager", "admin"),
  getMostBorrowedBooks
);

module.exports = router;
