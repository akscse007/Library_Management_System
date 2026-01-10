const express = require("express");
const router = express.Router();

const { getMostBorrowedBooks } = require("../controllers/analyticsController");
const auth = require("../../middleware/auth");

/**
 * Role guard middleware
 */
const allowLibrarianAndManager = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!["Librarian", "Manager"].includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  next();
};

router.get(
  "/most-borrowed-books",
  auth,
  allowLibrarianAndManager,
  getMostBorrowedBooks
);

module.exports = router;
