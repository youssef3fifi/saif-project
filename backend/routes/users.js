const express = require('express');
const router = express.Router();
const { findOne, findAll } = require('../utils/fileDB');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await findAll('users.json');
    const books = await findAll('books.json');
    
    // Populate borrowed books and remove passwords
    const usersWithBooks = users.map(user => {
      const borrowedBooksPopulated = user.borrowedBooks.map(bb => {
        const book = books.find(b => b.id === bb.book);
        return {
          ...bb,
          book: book || null
        };
      });
      
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        borrowedBooks: borrowedBooksPopulated
      };
    });
    
    // Sort by createdAt descending
    usersWithBooks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      count: usersWithBooks.length,
      data: usersWithBooks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await findOne('users.json', { id: parseInt(req.params.id) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Populate borrowed books
    const books = await findAll('books.json');
    const borrowedBooksPopulated = user.borrowedBooks.map(bb => {
      const book = books.find(b => b.id === bb.book);
      return {
        ...bb,
        book: book || null
      };
    });
    
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      data: {
        ...userWithoutPassword,
        borrowedBooks: borrowedBooksPopulated
      },
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
