const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a book title'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Please provide an author name'],
    trim: true,
  },
  isbn: {
    type: String,
    required: [true, 'Please provide an ISBN'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Children', 'Other'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 0,
    default: 1,
  },
  available: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Set available to quantity by default before saving
bookSchema.pre('save', function(next) {
  if (this.isNew && this.available === undefined) {
    this.available = this.quantity;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
