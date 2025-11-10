const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { findOne, findAll, create, update, deleteOne, search } = require('../utils/fileDB');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search: searchTerm, category } = req.query;
    let books;

    if (searchTerm) {
      books = await search('books.json', ['title', 'author', 'isbn'], searchTerm);
    } else {
      books = await findAll('books.json');
    }

    if (category) {
      books = books.filter(book => book.category === category);
    }

    // Sort by createdAt descending
    books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await findOne('books.json', { id: parseInt(req.params.id) });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/books
// @desc    Create a book
// @access  Private/Admin
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('isbn').notEmpty().withMessage('ISBN is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      // Check if ISBN already exists
      const existingBook = await findOne('books.json', { isbn: req.body.isbn });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'Book with this ISBN already exists',
        });
      }

      // Set available to quantity if not provided
      const bookData = {
        ...req.body,
        available: req.body.available !== undefined ? req.body.available : req.body.quantity
      };

      const book = await create('books.json', bookData);
      res.status(201).json({
        success: true,
        data: book,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const book = await update('books.json', req.params.id, req.body);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const book = await deleteOne('books.json', req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully',
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
