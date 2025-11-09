/**
 * Validation middleware
 */

const validateBooking = (req, res, next) => {
  const { name, email, phone, tourId, date, travelers } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!phone || !/^\+?[\d\s\-()]+$/.test(phone)) {
    errors.push('Valid phone number is required');
  }

  if (!tourId || isNaN(parseInt(tourId))) {
    errors.push('Valid tour ID is required');
  }

  if (!date || new Date(date) < new Date()) {
    errors.push('Valid future date is required');
  }

  if (!travelers || travelers < 1 || travelers > 50) {
    errors.push('Number of travelers must be between 1 and 50');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

const validateContact = (req, res, next) => {
  const { name, email, subject, message } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!subject || subject.trim().length < 3) {
    errors.push('Subject must be at least 3 characters long');
  }

  if (!message || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

module.exports = { validateBooking, validateContact };
