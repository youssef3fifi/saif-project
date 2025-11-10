const express = require('express');
const router = express.Router();
const { findOne, findAll, create, update, readJSON, writeJSON } = require('../utils/fileDB');
const { protect } = require('../middleware/auth');

// @route   POST /api/transactions/borrow
// @desc    Borrow a book
// @access  Private
router.post('/borrow', protect, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Check if book exists and is available
    const book = await findOne('books.json', { id: parseInt(bookId) });
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
    const transactions = await findAll('transactions.json');
    const existingTransaction = transactions.find(t => 
      t.user === req.user.id && 
      t.book === parseInt(bookId) && 
      t.status === 'active'
    );

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book',
      });
    }

    // Calculate due date (14 days from now)
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create transaction
    const transaction = await create('transactions.json', {
      user: req.user.id,
      book: parseInt(bookId),
      type: 'borrow',
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'active',
    });

    // Update book availability
    const books = await readJSON('books.json');
    const bookIndex = books.findIndex(b => b.id === parseInt(bookId));
    books[bookIndex].available -= 1;
    await writeJSON('books.json', books);

    // Update user borrowed books
    const users = await readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === req.user.id);
    users[userIndex].borrowedBooks.push({
      book: parseInt(bookId),
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
    });
    await writeJSON('users.json', users);

    // Populate transaction with book and user data
    const user = users[userIndex];
    const populatedTransaction = {
      ...transaction,
      book: book,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };

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
    const transactions = await readJSON('transactions.json');
    const transactionIndex = transactions.findIndex(t =>
      t.user === req.user.id &&
      t.book === parseInt(bookId) &&
      t.status === 'active'
    );

    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'No active borrowing transaction found for this book',
      });
    }

    // Update transaction
    const returnDate = new Date().toISOString();
    transactions[transactionIndex].type = 'return';
    transactions[transactionIndex].returnDate = returnDate;
    transactions[transactionIndex].status = 'returned';
    await writeJSON('transactions.json', transactions);

    // Update book availability
    const books = await readJSON('books.json');
    const bookIndex = books.findIndex(b => b.id === parseInt(bookId));
    books[bookIndex].available += 1;
    await writeJSON('books.json', books);

    // Remove from user borrowed books
    const users = await readJSON('users.json');
    const userIndex = users.findIndex(u => u.id === req.user.id);
    users[userIndex].borrowedBooks = users[userIndex].borrowedBooks.filter(
      bb => bb.book !== parseInt(bookId)
    );
    await writeJSON('users.json', users);

    // Populate transaction with book and user data
    const book = books[bookIndex];
    const user = users[userIndex];
    const populatedTransaction = {
      ...transactions[transactionIndex],
      book: book,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };

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
    const userId = parseInt(req.params.userId);
    
    // Users can only view their own transactions, admins can view all
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these transactions',
      });
    }

    const transactions = await findAll('transactions.json', { user: userId });
    const books = await findAll('books.json');

    // Populate book data
    const populatedTransactions = transactions.map(t => ({
      ...t,
      book: books.find(b => b.id === t.book) || null
    }));

    // Sort by createdAt descending
    populatedTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: populatedTransactions.length,
      data: populatedTransactions,
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

    const transactions = await findAll('transactions.json');
    const books = await findAll('books.json');
    const users = await findAll('users.json');

    // Populate book and user data
    const populatedTransactions = transactions.map(t => ({
      ...t,
      book: books.find(b => b.id === t.book) || null,
      user: (() => {
        const user = users.find(u => u.id === t.user);
        return user ? { id: user.id, name: user.name, email: user.email } : null;
      })()
    }));

    // Sort by createdAt descending
    populatedTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: populatedTransactions.length,
      data: populatedTransactions,
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
