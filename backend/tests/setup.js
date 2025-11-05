/**
 * Jest Test Setup
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-do-not-use-in-production';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'bettercv_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  // Keep log, error, and warn for debugging
  log: jest.fn(),
  error: console.error,
  warn: console.warn,
  info: jest.fn(),
  debug: jest.fn(),
};

// Set up global test utilities if needed
global.testUtils = {
  // Helper to generate test JWT tokens
  generateTestToken: (userId, username, email) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, username, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  // Helper to create test user data
  createTestUser: () => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    is_active: true,
    is_verified: true
  }),

  // Helper to generate CSRF token for tests
  generateCsrfToken: () => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
};
