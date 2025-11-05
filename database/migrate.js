#!/usr/bin/env node

/**
 * Database Migration Runner
 * Executes SQL migrations in order
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
});

// Create migrations tracking table
async function createMigrationsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            migration_name VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT NOW()
        );
    `;

    await pool.query(query);
    console.log('✓ Migrations tracking table ready');
}

// Get executed migrations
async function getExecutedMigrations() {
    const result = await pool.query('SELECT migration_name FROM schema_migrations ORDER BY migration_name');
    return new Set(result.rows.map(row => row.migration_name));
}

// Mark migration as executed
async function markMigrationAsExecuted(migrationName) {
    await pool.query(
        'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
        [migrationName]
    );
}

// Get migration files
function getMigrationFiles() {
    const migrationsDir = path.join(__dirname, 'migrations');

    if (!fs.existsSync(migrationsDir)) {
        console.log('No migrations directory found');
        return [];
    }

    return fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
}

// Run a single migration
async function runMigration(migrationFile) {
    const filePath = path.join(__dirname, 'migrations', migrationFile);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`\n📄 Running migration: ${migrationFile}`);

    try {
        await pool.query('BEGIN');
        await pool.query(sql);
        await markMigrationAsExecuted(migrationFile);
        await pool.query('COMMIT');

        console.log(`✓ Migration completed: ${migrationFile}`);
        return true;
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`✗ Migration failed: ${migrationFile}`);
        console.error(`Error: ${error.message}`);
        throw error;
    }
}

// Run all pending migrations
async function runMigrations() {
    console.log('🚀 Starting database migrations...\n');

    try {
        // Create migrations tracking table
        await createMigrationsTable();

        // Get executed and available migrations
        const executed = await getExecutedMigrations();
        const available = getMigrationFiles();

        // Find pending migrations
        const pending = available.filter(file => !executed.has(file));

        if (pending.length === 0) {
            console.log('✓ No pending migrations. Database is up to date.\n');
            return;
        }

        console.log(`Found ${pending.length} pending migration(s):\n`);
        pending.forEach(file => console.log(`  - ${file}`));

        // Run each pending migration
        for (const migration of pending) {
            await runMigration(migration);
        }

        console.log('\n✓ All migrations completed successfully!\n');

    } catch (error) {
        console.error('\n✗ Migration process failed');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Rollback last migration
async function rollbackMigration() {
    console.log('🔄 Rolling back last migration...\n');

    try {
        await createMigrationsTable();

        const result = await pool.query(`
            SELECT migration_name FROM schema_migrations
            ORDER BY executed_at DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log('No migrations to rollback');
            return;
        }

        const lastMigration = result.rows[0].migration_name;
        console.log(`Last migration: ${lastMigration}`);

        // Check if rollback file exists
        const rollbackFile = lastMigration.replace('.sql', '.rollback.sql');
        const rollbackPath = path.join(__dirname, 'migrations', rollbackFile);

        if (!fs.existsSync(rollbackPath)) {
            console.log(`⚠️  No rollback file found: ${rollbackFile}`);
            console.log('Manually remove migration from schema_migrations table if needed');
            return;
        }

        const sql = fs.readFileSync(rollbackPath, 'utf-8');

        await pool.query('BEGIN');
        await pool.query(sql);
        await pool.query('DELETE FROM schema_migrations WHERE migration_name = $1', [lastMigration]);
        await pool.query('COMMIT');

        console.log(`✓ Rollback completed: ${lastMigration}\n`);

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('\n✗ Rollback failed');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// List migrations
async function listMigrations() {
    console.log('📋 Migration Status\n');

    try {
        await createMigrationsTable();

        const executed = await getExecutedMigrations();
        const available = getMigrationFiles();

        console.log('Executed migrations:');
        if (executed.size === 0) {
            console.log('  (none)');
        } else {
            executed.forEach(name => console.log(`  ✓ ${name}`));
        }

        const pending = available.filter(file => !executed.has(file));
        console.log('\nPending migrations:');
        if (pending.length === 0) {
            console.log('  (none)');
        } else {
            pending.forEach(name => console.log(`  ○ ${name}`));
        }

        console.log('');

    } catch (error) {
        console.error('Error listing migrations:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
    case 'up':
    case 'migrate':
        runMigrations();
        break;
    case 'down':
    case 'rollback':
        rollbackMigration();
        break;
    case 'list':
    case 'status':
        listMigrations();
        break;
    default:
        console.log(`
Database Migration Tool

Usage:
  node migrate.js <command>

Commands:
  up, migrate    Run all pending migrations
  down, rollback Rollback the last migration
  list, status   List migration status

Examples:
  node migrate.js up
  node migrate.js rollback
  node migrate.js list
        `);
        process.exit(0);
}
