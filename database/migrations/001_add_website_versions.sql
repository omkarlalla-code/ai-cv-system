-- Migration: Add website_versions table for version control
-- Purpose: Track version history for user websites

-- Website Versions table - version control for user sites
CREATE TABLE IF NOT EXISTS website_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID REFERENCES user_sites(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    message TEXT NOT NULL,
    html_content TEXT,
    css_content TEXT,
    js_content TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),

    -- Ensure version numbers are unique per website
    UNIQUE(website_id, version_number)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_website_versions_website_id ON website_versions(website_id);
CREATE INDEX IF NOT EXISTS idx_website_versions_created_at ON website_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_website_versions_version_number ON website_versions(version_number DESC);

-- Create a function to auto-create initial version when website is published
CREATE OR REPLACE FUNCTION create_initial_website_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create version if this is an update and website is being published
    IF (TG_OP = 'UPDATE' AND NEW.is_published = TRUE AND OLD.is_published = FALSE) THEN
        INSERT INTO website_versions (
            website_id,
            version_number,
            message,
            html_content,
            css_content,
            js_content,
            created_by
        ) VALUES (
            NEW.id,
            1,
            'Initial version',
            NEW.custom_html,
            NEW.custom_css,
            '',
            NEW.user_id
        )
        ON CONFLICT (website_id, version_number) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create initial version on publish
DROP TRIGGER IF EXISTS auto_create_initial_version ON user_sites;
CREATE TRIGGER auto_create_initial_version
    AFTER UPDATE ON user_sites
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_website_version();

-- Add comment to table
COMMENT ON TABLE website_versions IS 'Stores version history for user websites, enabling restore and comparison features';
COMMENT ON COLUMN website_versions.version_number IS 'Sequential version number for the website, starting from 1';
COMMENT ON COLUMN website_versions.message IS 'Description of changes in this version';
