// Utility functions for validation

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  if (password.length > 50) {
    return { valid: false, message: 'Password cannot exceed 50 characters' };
  }
  return { valid: true, message: 'Password is valid' };
};

/**
 * Sanitize string input
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if date is in the future
 */
const isFutureDate = (date) => {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate > now;
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {object} - Formatted error object
 */
const formatError = (message, statusCode = 400) => {
  return {
    success: false,
    error: message,
    statusCode
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  sanitizeString,
  isFutureDate,
  formatError
};
