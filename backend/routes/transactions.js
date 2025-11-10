const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   POST /api/transactions/borrow
// @desc    Borrow a book
// @access  Private
router.post('/borrow', protect, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    if (book.available <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available',
      });
    }

    // Check if user already borrowed this book
    const existingTransaction = await Transaction.findOne({
      user: req.user._id,
      book: bookId,
      status: 'active',
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book',
      });
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      book: bookId,
      type: 'borrow',
      dueDate,
      status: 'active',
    });

    // Update book availability
    book.available -= 1;
    await book.save();

    // Update user borrowed books
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        borrowedBooks: {
          book: bookId,
          borrowDate: new Date(),
          dueDate,
        },
      },
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/transactions/return
// @desc    Return a book
// @access  Private
router.post('/return', protect, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Find active transaction
    const transaction = await Transaction.findOne({
      user: req.user._id,
      book: bookId,
      status: 'active',
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'No active borrowing transaction found for this book',
      });
    }

    // Update transaction
    transaction.type = 'return';
    transaction.returnDate = new Date();
    transaction.status = 'returned';
    await transaction.save();

    // Update book availability
    const book = await Book.findById(bookId);
    book.available += 1;
    await book.save();

    // Remove from user borrowed books
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        borrowedBooks: { book: bookId },
      },
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('book')
      .populate('user', 'name email');

    res.json({
      success: true,
      data: populatedTransaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/transactions/user/:userId
// @desc    Get all transactions for a user
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    // Users can only view their own transactions, admins can view all
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these transactions',
      });
    }

    const transactions = await Transaction.find({ user: req.params.userId })
      .populate('book')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view all transactions',
      });
    }

    const transactions = await Transaction.find()
      .populate('book')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;
