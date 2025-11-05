const request = require('supertest');
const app = require('../server');

describe('CSRF Protection', () => {
  let csrfToken;
  let cookies;

  beforeEach(async () => {
    // Get CSRF token
    const response = await request(app)
      .get('/api/csrf-token')
      .expect(200);

    csrfToken = response.body.csrfToken;
    cookies = response.headers['set-cookie'];
  });

  test('GET /api/csrf-token should return a CSRF token', async () => {
    const response = await request(app)
      .get('/api/csrf-token')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('csrfToken');
    expect(typeof response.body.csrfToken).toBe('string');
    expect(response.body.csrfToken.length).toBeGreaterThan(0);
  });

  test('GET requests should not require CSRF token', async () => {
    await request(app)
      .get('/health')
      .expect(200);
  });

  test('POST requests without CSRF token should be rejected', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(403);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('CSRF');
  });

  test('POST requests with valid CSRF token should be accepted', async () => {
    // This test expects a 400, 401, 500, or other error (not 403) since we're not providing valid login credentials
    // But it should NOT return 403 CSRF error if token is valid
    const response = await request(app)
      .post('/api/auth/login')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    // Should not be 403 (CSRF error) - any other error is fine
    // This proves CSRF protection is not blocking the request
    expect([400, 401, 404, 500]).toContain(response.status);
  });

  test('POST requests with mismatched CSRF token should be rejected', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', 'invalid-token-12345')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(403);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('CSRF');
  });
});
