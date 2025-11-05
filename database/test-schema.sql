-- BetterCV Test Database Schema
-- This creates a lightweight test database for automated testing

-- Drop existing test database if exists
DROP DATABASE IF EXISTS bettercv_test;
CREATE DATABASE bettercv_test;

\c bettercv_test

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Design versions table
CREATE TABLE design_versions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    builder_state JSONB,
    screenshot_url TEXT,
    commit_message TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Generated websites table
CREATE TABLE generated_websites (
    id SERIAL PRIMARY KEY,
    version_id INTEGER REFERENCES design_versions(id),
    html_code TEXT,
    claude_model VARCHAR(100),
    claude_prompt TEXT,
    claude_response_id VARCHAR(255),
    generation_status VARCHAR(50),
    generation_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Design iterations table
CREATE TABLE design_iterations (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES generated_websites(id),
    iteration_number INTEGER NOT NULL,
    user_feedback TEXT,
    claude_refinement TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CV data table
CREATE TABLE cv_data (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255),
    file_type VARCHAR(10),
    parsing_status VARCHAR(50) DEFAULT 'pending',
    personal_info JSONB,
    education JSONB,
    experience JSONB,
    skills JSONB,
    projects JSONB,
    certifications JSONB,
    languages JSONB,
    interests JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File uploads table
CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    original_filename VARCHAR(255),
    file_path TEXT,
    file_size INTEGER,
    file_type VARCHAR(50),
    upload_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Websites table
CREATE TABLE websites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subdomain VARCHAR(100) UNIQUE,
    title VARCHAR(255),
    html_content TEXT,
    css_content TEXT,
    is_published BOOLEAN DEFAULT false,
    gitlab_project_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    preview_url TEXT,
    html_template TEXT,
    css_template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_design_versions_project_id ON design_versions(project_id);
CREATE INDEX idx_cv_data_user_id ON cv_data(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE INDEX idx_websites_subdomain ON websites(subdomain);

-- Helper functions
CREATE OR REPLACE FUNCTION create_version(
    p_project_id INTEGER,
    p_builder_state JSONB,
    p_screenshot_url TEXT,
    p_commit_message TEXT,
    p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_version_number INTEGER;
    v_version_id INTEGER;
BEGIN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version_number
    FROM design_versions
    WHERE project_id = p_project_id;

    -- Mark all versions as not current
    UPDATE design_versions SET is_current = false
    WHERE project_id = p_project_id;

    -- Insert new version
    INSERT INTO design_versions (
        project_id, version_number, builder_state,
        screenshot_url, commit_message, is_current, created_by
    ) VALUES (
        p_project_id, v_version_number, p_builder_state,
        p_screenshot_url, p_commit_message, true, p_user_id
    ) RETURNING id INTO v_version_id;

    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_data_updated_at
    BEFORE UPDATE ON cv_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert test data
INSERT INTO users (username, email, password_hash, name, is_verified) VALUES
('testuser', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyB0JvkF5z5m', 'Test User', true);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO CURRENT_USER;

-- Success message
SELECT 'Test database created successfully!' as status;
