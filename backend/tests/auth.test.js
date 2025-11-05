const request = require('supertest');
const app = require('../server');

describe('Authentication Middleware', () => {
  let csrfToken;
  let cookies;

  beforeEach(async () => {
    // Get CSRF token before each test
    const response = await request(app)
      .get('/api/csrf-token')
      .expect(200);

    csrfToken = response.body.csrfToken;
    cookies = response.headers['set-cookie'];
  });

  test('Protected routes should reject requests without token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('token');
  });

  test('Protected routes should reject requests with invalid token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer invalid-token-xyz')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  test('Protected routes should accept requests with valid token', async () => {
    // Generate a valid test token
    const token = global.testUtils.generateTestToken(1, 'testuser', 'test@example.com');

    // This will fail with 404 or other error (user doesn't exist in test DB)
    // But it should NOT return 401 if token is valid
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken);

    // Should not be 401 (auth error)
    // Will be 500 or 404 because test database isn't set up
    expect(response.status).not.toBe(401);
  });
});
