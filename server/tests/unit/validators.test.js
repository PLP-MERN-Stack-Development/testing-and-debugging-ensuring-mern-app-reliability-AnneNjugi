const {
  isValidEmail,
  validatePassword,
  sanitizeString,
  isFutureDate,
  formatError
} = require('../../src/utils/validators');

describe('Validator Utilities', () => {
  describe('isValidEmail', () => {
    test('should return true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    test('should return false for invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should return valid for strong password', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Password is valid');
    });

    test('should return invalid for short password', () => {
      const result = validatePassword('12345');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password must be at least 6 characters');
    });

    test('should return invalid for empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password must be at least 6 characters');
    });

    test('should return invalid for too long password', () => {
      const longPassword = 'a'.repeat(51);
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password cannot exceed 50 characters');
    });

    test('should return invalid for null password', () => {
      const result = validatePassword(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    test('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\n\ttest\n')).toBe('test');
    });

    test('should remove HTML tags', () => {
      expect(sanitizeString('hello<script>alert("xss")</script>')).toBe('helloalert("xss")');
      expect(sanitizeString('test<>test')).toBe('testtest');
    });

    test('should handle non-string input', () => {
      expect(sanitizeString(123)).toBe('');
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });

    test('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('isFutureDate', () => {
    test('should return true for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFutureDate(futureDate)).toBe(true);
    });

    test('should return false for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isFutureDate(pastDate)).toBe(false);
    });

    test('should handle string dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isFutureDate(futureDate.toISOString())).toBe(true);
    });
  });

  describe('formatError', () => {
    test('should format error with default status code', () => {
      const error = formatError('Test error');
      expect(error).toEqual({
        success: false,
        error: 'Test error',
        statusCode: 400
      });
    });

    test('should format error with custom status code', () => {
      const error = formatError('Server error', 500);
      expect(error).toEqual({
        success: false,
        error: 'Server error',
        statusCode: 500
      });
    });
  });
});
