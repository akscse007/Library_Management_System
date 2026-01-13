const Borrow = require("../models/Borrow");
const Book = require("../models/Book");

/**
 * @desc    Get most borrowed books
 * @route   GET /api/analytics/most-borrowed-books
 * @access  Librarian / Manager
 */
const getMostBorrowedBooks = async (req, res) => {
  try {
    const result = await Borrow.aggregate([
      {
        $group: {
          _id: "$book",
          borrowCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $project: {
          _id: 0,
          bookId: "$bookDetails._id",
          title: "$bookDetails.title",
          author: "$bookDetails.author",
          genre: "$bookDetails.genre",
          totalCopies: "$bookDetails.totalCopies",
          availableCopies: "$bookDetails.availableCopies",
          borrowCount: 1,
        },
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
    });
  }
};

module.exports = {
  getMostBorrowedBooks,
};
