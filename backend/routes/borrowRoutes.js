const express = require("express");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

const {
  requestBorrow,
  issueBook,
  returnBook,
  getBorrowHistory,
  listAllBorrows,
  rejectBorrow,
} = require("../controllers/borrowController");

const router = express.Router();

/**
 * STUDENT
 */
router.post("/request", protect, authorize("student"), requestBorrow);
router.get("/history/:studentId?", protect, getBorrowHistory);

/**
 * LIBRARIAN / MANAGER / ADMIN
 */
router.get("/", protect, authorize("librarian", "manager", "admin"), listAllBorrows);
router.post("/issue", protect, authorize("librarian", "manager", "admin"), issueBook);
router.post("/return/:borrowId", protect, authorize("librarian", "manager", "admin"), returnBook);
router.post("/reject/:borrowId", protect, authorize("librarian", "manager", "admin"), rejectBorrow);

module.exports = router;
