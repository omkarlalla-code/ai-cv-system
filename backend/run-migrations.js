const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use DATABASE_URL from environment or hardcode for this script
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_bJ1eL4wAoNtH@ep-broad-base-ahg8ckw3-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  console.log('🗄️  Running Database Migrations');
  console.log('================================\n');

  try {
    // Test connection
    console.log('Testing connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database\n');

    // Read and run main schema
    console.log('1/2 Running main schema...');
    const mainSchema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    await pool.query(mainSchema);
    console.log('    ✅ Main schema applied\n');

    // Read and run builder schema
    console.log('2/2 Running builder schema...');
    const builderSchema = fs.readFileSync(path.join(__dirname, '../database/builder-schema.sql'), 'utf8');
    await pool.query(builderSchema);
    console.log('    ✅ Builder schema applied\n');

    // Show tables
    console.log('📊 Database tables created:');
    const tables = await pool.query(`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY tablename
    `);

    tables.rows.forEach(row => {
      console.log(`    - ${row.tablename}`);
    });

    console.log('\n🎉 Migrations completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
