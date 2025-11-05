# Database Migrations

This directory contains SQL migration files for the BetterCV database schema.

## Migration System

The migration system uses a simple file-based approach with automatic tracking:

- Migrations are numbered sequentially (001, 002, 003, etc.)
- Each migration can have an optional rollback file
- Executed migrations are tracked in the `schema_migrations` table
- Migrations run in alphabetical order

## File Naming Convention

```
[number]_[description].sql              # Forward migration
[number]_[description].rollback.sql     # Rollback migration (optional)
```

**Examples:**
- `001_add_website_versions.sql`
- `001_add_website_versions.rollback.sql`
- `002_add_notifications.sql`
- `002_add_notifications.rollback.sql`

## Using the Migration Runner

The migration runner is located at `database/migrate.js`.

### Prerequisites

Ensure your database is running and `.env` file is configured:

```bash
# backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/bettercv
# OR
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=bettercv
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

### Commands

**Run all pending migrations:**
```bash
cd database
node migrate.js up
# or
node migrate.js migrate
```

**Rollback the last migration:**
```bash
node migrate.js down
# or
node migrate.js rollback
```

**List migration status:**
```bash
node migrate.js list
# or
node migrate.js status
```

## Migration Examples

### Forward Migration Example

```sql
-- 003_add_user_preferences.sql

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
    ON user_preferences(user_id);

COMMENT ON TABLE user_preferences IS 'User application preferences';
```

### Rollback Migration Example

```sql
-- 003_add_user_preferences.rollback.sql

DROP INDEX IF EXISTS idx_user_preferences_user_id;
DROP TABLE IF EXISTS user_preferences;
```

## Current Migrations

### 001_add_website_versions.sql
Creates the `website_versions` table for tracking version history of user websites.

**Features:**
- Stores version snapshots (HTML, CSS, JS)
- Sequential version numbering per website
- Automatic initial version on first publish
- Rollback support

**Tables:**
- `website_versions`

**Functions:**
- `create_initial_website_version()` - Auto-creates v1 on publish

### 002_add_notifications.sql
Creates the `notifications` table for in-app notifications.

**Features:**
- Notification types and categorization
- Read/unread status tracking
- Optional links to resources
- Auto-cleanup for old read notifications

**Tables:**
- `notifications`

**Functions:**
- `cleanup_old_notifications()` - Removes old read notifications

## Best Practices

### Writing Migrations

1. **Always use IF EXISTS/IF NOT EXISTS:**
   ```sql
   CREATE TABLE IF NOT EXISTS my_table ...
   DROP TABLE IF EXISTS my_table;
   ```

2. **Make migrations idempotent:**
   - Migrations should be safe to run multiple times
   - Use conditional checks where needed

3. **Include rollback migrations:**
   - Always create a rollback file for destructive changes
   - Test rollbacks before committing

4. **Add comments:**
   ```sql
   COMMENT ON TABLE my_table IS 'Description of table purpose';
   COMMENT ON COLUMN my_table.field IS 'Description of field';
   ```

5. **Create proper indexes:**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_table_column ON table(column);
   ```

6. **Use transactions:**
   - The migration runner wraps each migration in a transaction
   - Don't use explicit BEGIN/COMMIT unless needed

### Migration Workflow

1. **Create migration files:**
   ```bash
   cd database/migrations
   touch 003_my_feature.sql
   touch 003_my_feature.rollback.sql
   ```

2. **Write the migration:**
   - Add forward migration SQL to `003_my_feature.sql`
   - Add rollback SQL to `003_my_feature.rollback.sql`

3. **Test locally:**
   ```bash
   node migrate.js up
   # Verify changes
   node migrate.js down
   # Verify rollback works
   node migrate.js up
   ```

4. **Commit both files:**
   ```bash
   git add database/migrations/003_*
   git commit -m "Add migration for my_feature"
   ```

## Troubleshooting

### Migration fails with "relation already exists"

The migration may have partially run. Options:

1. **Check schema_migrations table:**
   ```sql
   SELECT * FROM schema_migrations ORDER BY executed_at DESC;
   ```

2. **Manually remove failed migration:**
   ```sql
   DELETE FROM schema_migrations WHERE migration_name = '003_my_feature.sql';
   ```

3. **Fix the migration and run again:**
   ```bash
   node migrate.js up
   ```

### Rollback file not found

Create the rollback file or manually remove from tracking:

```sql
DELETE FROM schema_migrations WHERE migration_name = 'xxx_migration.sql';
```

Then manually undo the changes using psql.

### Database connection error

1. Check DATABASE_URL or individual DB variables in `.env`
2. Verify PostgreSQL is running: `pg_isready`
3. Test connection: `psql $DATABASE_URL`

## Manual Migration Execution

If you need to run migrations manually:

```bash
# Apply migration
psql $DATABASE_URL -f migrations/001_add_website_versions.sql

# Rollback migration
psql $DATABASE_URL -f migrations/001_add_website_versions.rollback.sql
```

## Production Deployment

1. **Backup database before migrations:**
   ```bash
   pg_dump -U postgres bettercv > backup_$(date +%Y%m%d).sql
   ```

2. **Run migrations:**
   ```bash
   node migrate.js up
   ```

3. **Verify success:**
   ```bash
   node migrate.js list
   ```

4. **If issues occur, rollback:**
   ```bash
   node migrate.js down
   # Restore from backup if needed
   psql -U postgres bettercv < backup_YYYYMMDD.sql
   ```

## CI/CD Integration

Add to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Run database migrations
  run: |
    cd database
    node migrate.js up
```

## Notes

- Migrations are executed in a single transaction
- Failed migrations automatically rollback
- The `schema_migrations` table tracks execution history
- Migration files should never be modified after being run in production
- Always test migrations on a staging database first
