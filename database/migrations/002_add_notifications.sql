-- Migration: Add notifications table for in-app notifications
-- Purpose: Store and manage user notifications within the application

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- website_published, template_used, cv_parsed, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500), -- Optional link to related resource
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Function to mark old notifications as deleted after 30 days
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND is_read = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to cleanup old notifications (requires pg_cron extension)
-- This is optional and would need pg_cron installed
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications()');

-- Add comment to table
COMMENT ON TABLE notifications IS 'Stores in-app notifications for users';
COMMENT ON COLUMN notifications.type IS 'Type of notification to categorize and filter';
COMMENT ON COLUMN notifications.link IS 'Optional URL to navigate to when notification is clicked';
