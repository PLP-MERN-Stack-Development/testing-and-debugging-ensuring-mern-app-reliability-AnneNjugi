const { generateToken } = require('../../src/controllers/authController');
const jwt = require('jsonwebtoken');

describe('Auth Controller', () => {
  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      const userId = '123456789';
      const token = generateToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key_12345');
      expect(decoded.userId).toBe(userId);
    });

    test('should generate different tokens for different users', () => {
      const token1 = generateToken('user1');
      const token2 = generateToken('user2');
      
      expect(token1).not.toBe(token2);
    });

    test('should include expiration in token', () => {
      const userId = '123456789';
      const token = generateToken(userId);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret_key_12345');
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });
});
