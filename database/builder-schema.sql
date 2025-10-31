-- ============================================
-- BetterCV Builder Database Schema
-- Version Control System for Design Projects
-- ============================================

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,
    CONSTRAINT unique_project_name_per_user UNIQUE(user_id, name)
);

-- Design Versions (Git-like version control)
CREATE TABLE IF NOT EXISTS design_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    parent_version_id UUID REFERENCES design_versions(id),

    -- Builder state (full canvas JSON - GrapesJS format)
    builder_state JSONB NOT NULL,

    -- Screenshots and previews
    screenshot_url TEXT,
    thumbnail_url TEXT,

    -- Version metadata
    commit_message TEXT,
    is_current BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    CONSTRAINT unique_version_number_per_project UNIQUE(project_id, version_number)
);

-- Generated Websites (Claude outputs)
CREATE TABLE IF NOT EXISTS generated_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID REFERENCES design_versions(id) ON DELETE CASCADE,

    -- Generated code
    html_code TEXT NOT NULL,
    css_code TEXT,

    -- Metadata
    metadata JSONB,  -- responsive breakpoints, fonts, colors, etc.

    -- Claude API details
    claude_model VARCHAR(100),
    claude_prompt TEXT,
    claude_response_id TEXT,

    -- Generation status
    generation_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,

    -- Performance metrics
    generation_time_ms INTEGER,
    tokens_used INTEGER,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Design Iterations (Rapid iteration/refinement)
CREATE TABLE IF NOT EXISTS design_iterations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES generated_websites(id) ON DELETE CASCADE,
    iteration_number INTEGER NOT NULL,

    -- User feedback and Claude refinement
    user_feedback TEXT NOT NULL,
    claude_refinement TEXT,  -- refined HTML/CSS

    -- Metadata
    changes_applied JSONB,  -- structured log of what changed

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_iteration_per_website UNIQUE(website_id, iteration_number)
);

-- Component Library (Reusable designs)
CREATE TABLE IF NOT EXISTS saved_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Component details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),  -- hero, about, footer, card, etc.
    tags TEXT[],  -- searchable tags

    -- Design data
    builder_state JSONB NOT NULL,
    thumbnail_url TEXT,

    -- Sharing
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,

    -- Usage stats
    usage_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets Table (Images, fonts, etc.)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- File details
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),  -- image/png, image/jpeg, font/woff2, etc.
    file_size INTEGER,  -- bytes

    -- Image-specific metadata
    width INTEGER,
    height INTEGER,
    alt_text TEXT,

    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Deployment History
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES generated_websites(id),
    user_id UUID REFERENCES users(id),

    -- Deployment details
    subdomain VARCHAR(255),  -- username.bettercv.com
    deployment_url TEXT,
    deployment_status VARCHAR(50) DEFAULT 'pending',

    -- Git details (if using GitLab)
    git_commit_hash VARCHAR(255),
    git_branch VARCHAR(255),

    -- Timestamps
    deployed_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW(),

    CHECK (deployment_status IN ('pending', 'in_progress', 'success', 'failed'))
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Design versions indexes
CREATE INDEX idx_design_versions_project_id ON design_versions(project_id);
CREATE INDEX idx_design_versions_parent ON design_versions(parent_version_id);
CREATE INDEX idx_design_versions_current ON design_versions(is_current) WHERE is_current = true;
CREATE INDEX idx_design_versions_created_at ON design_versions(created_at DESC);

-- Generated websites indexes
CREATE INDEX idx_generated_websites_version_id ON generated_websites(version_id);
CREATE INDEX idx_generated_websites_status ON generated_websites(generation_status);

-- Iterations indexes
CREATE INDEX idx_design_iterations_website_id ON design_iterations(website_id);

-- Components indexes
CREATE INDEX idx_saved_components_user_id ON saved_components(user_id);
CREATE INDEX idx_saved_components_type ON saved_components(type);
CREATE INDEX idx_saved_components_public ON saved_components(is_public) WHERE is_public = true;
CREATE INDEX idx_saved_components_tags ON saved_components USING GIN(tags);

-- Assets indexes
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_project_id ON assets(project_id);

-- Deployments indexes
CREATE INDEX idx_deployments_user_id ON deployments(user_id);
CREATE INDEX idx_deployments_subdomain ON deployments(subdomain);

-- ============================================
-- Triggers for auto-updating timestamps
-- ============================================

-- Update updated_at on projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_components_updated_at
    BEFORE UPDATE ON saved_components
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Helper Functions
-- ============================================

-- Function to get latest version of a project
CREATE OR REPLACE FUNCTION get_latest_version(p_project_id UUID)
RETURNS TABLE (
    version_id UUID,
    version_number INTEGER,
    builder_state JSONB,
    screenshot_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT id, version_number, builder_state, screenshot_url
    FROM design_versions
    WHERE project_id = p_project_id AND is_current = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to create new version
CREATE OR REPLACE FUNCTION create_version(
    p_project_id UUID,
    p_builder_state JSONB,
    p_screenshot_url TEXT,
    p_commit_message TEXT,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_version_number INTEGER;
    v_version_id UUID;
BEGIN
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO v_version_number
    FROM design_versions
    WHERE project_id = p_project_id;

    -- Mark all other versions as not current
    UPDATE design_versions
    SET is_current = false
    WHERE project_id = p_project_id;

    -- Insert new version
    INSERT INTO design_versions (
        project_id,
        version_number,
        builder_state,
        screenshot_url,
        commit_message,
        is_current,
        created_by
    ) VALUES (
        p_project_id,
        v_version_number,
        p_builder_state,
        p_screenshot_url,
        p_commit_message,
        true,
        p_user_id
    ) RETURNING id INTO v_version_id;

    RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE projects IS 'User design projects';
COMMENT ON TABLE design_versions IS 'Git-like version control for designs';
COMMENT ON TABLE generated_websites IS 'Claude-generated HTML/CSS outputs';
COMMENT ON TABLE design_iterations IS 'Rapid iteration feedback and refinements';
COMMENT ON TABLE saved_components IS 'Reusable component library';
COMMENT ON TABLE assets IS 'Uploaded images and files';
COMMENT ON TABLE deployments IS 'Deployment history to subdomains';
