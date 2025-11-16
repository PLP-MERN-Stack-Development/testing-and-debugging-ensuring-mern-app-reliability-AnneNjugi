const { authenticate, errorHandler } = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');

// Mock User model
jest.mock('../../src/models/User');

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        header: jest.fn()
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should authenticate valid token', async () => {
      const userId = 'user123';
      const token = jwt.sign({ userId }, 'test_secret_key_12345');
      const mockUser = { _id: userId, name: 'Test User', email: 'test@example.com' };

      req.header.mockReturnValue(`Bearer ${token}`);
      User.findById.mockResolvedValue(mockUser);

      await authenticate(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(req.userId).toBe(userId);
      expect(next).toHaveBeenCalled();
    });

    test('should reject request without token', async () => {
      req.header.mockReturnValue(undefined);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No authentication token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject invalid token', async () => {
      req.header.mockReturnValue('Bearer invalid_token');

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject token for non-existent user', async () => {
      const userId = 'nonexistent';
      const token = jwt.sign({ userId }, 'test_secret_key_12345');

      req.header.mockReturnValue(`Bearer ${token}`);
      User.findById.mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('errorHandler', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
      console.error = jest.fn(); // Mock console.error
    });

    test('should handle validation errors', () => {
      const err = {
        name: 'ValidationError',
        errors: {
          field1: { message: 'Field 1 is required' },
          field2: { message: 'Field 2 is invalid' }
        }
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: ['Field 1 is required', 'Field 2 is invalid']
      });
    });

    test('should handle duplicate key errors', () => {
      const err = { code: 11000 };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate field value entered'
      });
    });

    test('should handle JWT errors', () => {
      const err = { name: 'JsonWebTokenError' };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token'
      });
    });

    test('should handle generic errors', () => {
      const err = { message: 'Something went wrong' };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Something went wrong'
      });
    });

    test('should handle errors with custom status code', () => {
      const err = { message: 'Not found', statusCode: 404 };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found'
      });
    });
  });
});
