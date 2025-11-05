/**
 * Jest Database Setup for Testing
 * Sets up and tears down test database for each test run
 */

const { Pool } = require('pg');

// Test database configuration
const testDbConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: process.env.TEST_DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || 'bettercv_test',
  user: process.env.TEST_DB_USER || process.env.USER,
  password: process.env.TEST_DB_PASSWORD || '',
};

let testPool;

/**
 * Setup: Run before all tests
 */
beforeAll(async () => {
  console.log('Setting up test database...');

  try {
    // Create test pool
    testPool = new Pool(testDbConfig);

    // Test connection
    const result = await testPool.query('SELECT NOW()');
    console.log('✅ Test database connected:', result.rows[0].now);

    // Clean up existing data
    await cleanDatabase();

  } catch (error) {
    console.error('❌ Test database setup failed:', error.message);
    console.log('💡 Tip: Make sure PostgreSQL is running and test database exists');
    console.log('   Run: createdb bettercv_test');
    // Don't fail tests if DB not available
  }
});

/**
 * Cleanup: Run after all tests
 */
afterAll(async () => {
  if (testPool) {
    console.log('Cleaning up test database...');
    await cleanDatabase();
    await testPool.end();
    console.log('✅ Test database disconnected');
  }
});

/**
 * Clean all tables before/after tests
 */
async function cleanDatabase() {
  if (!testPool) return;

  try {
    await testPool.query('BEGIN');

    // Delete in correct order (respecting foreign keys)
    await testPool.query('DELETE FROM activity_logs');
    await testPool.query('DELETE FROM design_iterations');
    await testPool.query('DELETE FROM generated_websites');
    await testPool.query('DELETE FROM design_versions');
    await testPool.query('DELETE FROM projects');
    await testPool.query('DELETE FROM websites');
    await testPool.query('DELETE FROM file_uploads');
    await testPool.query('DELETE FROM cv_data');
    await testPool.query('DELETE FROM templates');
    await testPool.query('DELETE FROM users');

    // Reset sequences
    await testPool.query('ALTER SEQUENCE projects_id_seq RESTART WITH 1');
    await testPool.query('ALTER SEQUENCE design_versions_id_seq RESTART WITH 1');
    await testPool.query('ALTER SEQUENCE generated_websites_id_seq RESTART WITH 1');
    await testPool.query('ALTER SEQUENCE design_iterations_id_seq RESTART WITH 1');
    await testPool.query('ALTER SEQUENCE cv_data_id_seq RESTART WITH 1');
    await testPool.query('ALTER SEQUENCE file_uploads_id_seq RESTART WITH 1');
    await testPool.query('ALTER SEQUENCE activity_logs_id_seq RESTART WITH 1');
    await testPool.query('ALTER SEQUENCE websites_id_seq RESTART WITH 1');
    await testPool.query('ALTER SEQUENCE templates_id_seq RESTART WITH 1');

    await testPool.query('COMMIT');
    console.log('  Database cleaned');
  } catch (error) {
    await testPool.query('ROLLBACK');
    console.error('  Cleanup error:', error.message);
  }
}

/**
 * Helper: Create test user
 */
async function createTestUser(userData = {}) {
  if (!testPool) throw new Error('Test database not connected');

  const {
    username = 'testuser',
    email = 'test@example.com',
    password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyB0JvkF5z5m', // 'password'
    name = 'Test User',
    is_verified = true
  } = userData;

  const result = await testPool.query(
    `INSERT INTO users (username, email, password_hash, name, is_verified)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, name`,
    [username, email, password_hash, name, is_verified]
  );

  return result.rows[0];
}

/**
 * Helper: Create test project
 */
async function createTestProject(userId, projectData = {}) {
  if (!testPool) throw new Error('Test database not connected');

  const {
    name = 'Test Project',
    description = 'Test Description'
  } = projectData;

  const result = await testPool.query(
    `INSERT INTO projects (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, description`,
    [userId, name, description]
  );

  return result.rows[0];
}

// Export helpers
global.testDb = {
  pool: testPool,
  clean: cleanDatabase,
  createUser: createTestUser,
  createProject: createTestProject,
};

module.exports = {
  testPool,
  cleanDatabase,
  createTestUser,
  createTestProject,
};
