-- Rollback: Remove notifications table

-- Drop function
DROP FUNCTION IF EXISTS cleanup_old_notifications();

-- Drop indexes
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_user_unread;

-- Drop table
DROP TABLE IF EXISTS notifications;
