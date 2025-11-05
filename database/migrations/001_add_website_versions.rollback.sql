-- Rollback: Remove website_versions table

-- Drop trigger first
DROP TRIGGER IF EXISTS auto_create_initial_version ON user_sites;

-- Drop function
DROP FUNCTION IF EXISTS create_initial_website_version();

-- Drop indexes
DROP INDEX IF EXISTS idx_website_versions_website_id;
DROP INDEX IF EXISTS idx_website_versions_created_at;
DROP INDEX IF EXISTS idx_website_versions_version_number;

-- Drop table
DROP TABLE IF EXISTS website_versions;
