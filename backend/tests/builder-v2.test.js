const request = require('supertest');
const app = require('../server');

describe('Builder V2 Routes Authentication', () => {
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

  test('POST /api/builder-v2/projects should require authentication', async () => {
    const response = await request(app)
      .post('/api/builder-v2/projects')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: 'Test Project',
        description: 'Test Description'
      });

    // Should return 401 (unauthorized) when no auth token is provided
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toContain('token');
  });

  test('GET /api/builder-v2/projects should require authentication', async () => {
    const response = await request(app)
      .get('/api/builder-v2/projects')
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  test('Builder V2 routes should accept valid JWT token', async () => {
    const token = global.testUtils.generateTestToken(1, 'testuser', 'test@example.com');

    const response = await request(app)
      .get('/api/builder-v2/projects')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', cookies)
      .set('X-CSRF-Token', csrfToken);

    // Should not be 401 (auth error)
    // Will be 500 or other error because test database isn't set up
    expect(response.status).not.toBe(401);
  });
});
