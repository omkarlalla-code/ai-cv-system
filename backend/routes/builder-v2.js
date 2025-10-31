const express = require('express');
const router = express.Router();
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const { pool } = require('../config/database');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * POST /api/builder-v2/projects
 * Create a new project
 */
router.post('/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id; // Assumes auth middleware

    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_at`,
      [userId, name, description]
    );

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * GET /api/builder-v2/projects
 * Get all projects for user
 */
router.get('/projects', async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT p.*,
              (SELECT screenshot_url FROM design_versions
               WHERE project_id = p.id AND is_current = true
               LIMIT 1) as current_screenshot
       FROM projects p
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY updated_at DESC`,
      [userId]
    );

    res.json({ success: true, projects: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * POST /api/builder-v2/save-version
 * Save a new design version
 */
router.post('/save-version', upload.single('screenshot'), async (req, res) => {
  try {
    const { projectId, builderState, commitMessage } = req.body;
    const userId = req.user?.id;

    // TODO: Upload screenshot to cloud storage (S3/CloudFlare)
    // For now, store as base64 in DB (not recommended for production)
    let screenshotUrl = null;
    if (req.file) {
      screenshotUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    // Use the helper function to create version
    const result = await pool.query(
      'SELECT create_version($1, $2, $3, $4, $5) as version_id',
      [projectId, JSON.parse(builderState), screenshotUrl, commitMessage, userId]
    );

    const versionId = result.rows[0].version_id;

    // Update project updated_at
    await pool.query(
      'UPDATE projects SET updated_at = NOW() WHERE id = $1',
      [projectId]
    );

    res.json({
      success: true,
      versionId,
      message: 'Version saved successfully',
    });
  } catch (error) {
    console.error('Error saving version:', error);
    res.status(500).json({ error: 'Failed to save version', details: error.message });
  }
});

/**
 * GET /api/builder-v2/versions/:projectId
 * Get version history for a project
 */
router.get('/versions/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      `SELECT id, version_number, screenshot_url, commit_message,
              is_current, created_at, created_by
       FROM design_versions
       WHERE project_id = $1
       ORDER BY version_number DESC
       LIMIT 50`,
      [projectId]
    );

    res.json({ success: true, versions: result.rows });
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

/**
 * GET /api/builder-v2/version/:versionId
 * Get specific version details
 */
router.get('/version/:versionId', async (req, res) => {
  try {
    const { versionId } = req.params;

    const result = await pool.query(
      `SELECT id, project_id, version_number, builder_state,
              screenshot_url, commit_message, created_at
       FROM design_versions
       WHERE id = $1`,
      [versionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ success: true, version: result.rows[0] });
  } catch (error) {
    console.error('Error fetching version:', error);
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

/**
 * POST /api/builder-v2/restore-version
 * Restore a previous version as current
 */
router.post('/restore-version', async (req, res) => {
  try {
    const { versionId } = req.body;

    // Get the version
    const versionResult = await pool.query(
      'SELECT project_id, builder_state FROM design_versions WHERE id = $1',
      [versionId]
    );

    if (versionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const { project_id, builder_state } = versionResult.rows[0];

    // Mark all versions as not current
    await pool.query(
      'UPDATE design_versions SET is_current = false WHERE project_id = $1',
      [project_id]
    );

    // Mark this version as current
    await pool.query(
      'UPDATE design_versions SET is_current = true WHERE id = $1',
      [versionId]
    );

    res.json({
      success: true,
      message: 'Version restored successfully',
      builderState: builder_state,
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({ error: 'Failed to restore version' });
  }
});

/**
 * POST /api/builder-v2/generate-website
 * Generate HTML/CSS from design
 */
router.post('/generate-website', upload.single('screenshot'), async (req, res) => {
  try {
    const { versionId, builderState } = req.body;
    const startTime = Date.now();

    if (!req.file) {
      return res.status(400).json({ error: 'Screenshot is required' });
    }

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    // Enhanced prompt for responsive HTML generation
    const prompt = `You are an expert web developer converting a portfolio design to production-ready code.

Analyze this portfolio website screenshot and generate responsive HTML with embedded CSS.

CRITICAL REQUIREMENTS:

1. RESPONSIVE DESIGN (Mobile-First):
   - Base styles for 320px (mobile)
   - Breakpoints: 768px (tablet), 1024px (desktop), 1440px+ (large desktop)
   - Use CSS clamp() for fluid typography
   - All images: max-width: 100%, height: auto

2. SEMANTIC HTML5:
   - Proper structure: <header>, <main>, <section>, <footer>
   - Meaningful class names
   - Accessibility: alt text, ARIA labels, heading hierarchy

3. MODERN CSS:
   - CSS Grid and Flexbox for layouts
   - CSS Custom Properties for theming
   - Smooth transitions and hover effects
   - rem/em units for spacing

4. TYPOGRAPHY:
   - Import 2-3 Google Fonts
   - Use font-display: swap
   - Proper line-height and letter-spacing

5. PERFORMANCE:
   - Minified inline CSS
   - Optimized selectors
   - No external dependencies

6. CONVERT ABSOLUTE POSITIONING:
   - Original design is 1440px wide
   - Convert absolute positions to responsive Grid/Flexbox
   - Maintain visual hierarchy and spacing ratios

OUTPUT FORMAT:
- Single complete HTML file
- All CSS embedded in <style> tag
- No JavaScript unless absolutely necessary
- No explanations, just clean code

Start with <!DOCTYPE html>`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const generatedHtml = message.content[0].text;
    const generationTime = Date.now() - startTime;

    // Save to database
    const result = await pool.query(
      `INSERT INTO generated_websites (
        version_id, html_code, claude_model, claude_prompt,
        claude_response_id, generation_status, generation_time_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id`,
      [
        versionId,
        generatedHtml,
        'claude-3-5-sonnet-20241022',
        prompt,
        message.id,
        'completed',
        generationTime,
      ]
    );

    const websiteId = result.rows[0].id;

    res.json({
      success: true,
      websiteId,
      html: generatedHtml,
      generationTime,
      message: 'Website generated successfully',
    });
  } catch (error) {
    console.error('Error generating website:', error);

    // Save error to database if we have versionId
    if (req.body.versionId) {
      await pool.query(
        `INSERT INTO generated_websites (
          version_id, generation_status, error_message
        ) VALUES ($1, $2, $3)`,
        [req.body.versionId, 'failed', error.message]
      );
    }

    res.status(500).json({
      error: 'Failed to generate website',
      details: error.message,
    });
  }
});

/**
 * POST /api/builder-v2/iterate
 * Refine generated website based on feedback
 */
router.post('/iterate', async (req, res) => {
  try {
    const { websiteId, feedback } = req.body;

    if (!websiteId || !feedback) {
      return res.status(400).json({ error: 'Website ID and feedback are required' });
    }

    // Get current HTML
    const websiteResult = await pool.query(
      'SELECT html_code FROM generated_websites WHERE id = $1',
      [websiteId]
    );

    if (websiteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const currentHtml = websiteResult.rows[0].html_code;

    // Get iteration number
    const iterationResult = await pool.query(
      'SELECT COALESCE(MAX(iteration_number), 0) + 1 as next_iteration FROM design_iterations WHERE website_id = $1',
      [websiteId]
    );
    const iterationNumber = iterationResult.rows[0].next_iteration;

    // Call Claude for refinement
    const prompt = `You are refining an existing HTML/CSS portfolio website based on user feedback.

CURRENT CODE:
${currentHtml}

USER FEEDBACK:
${feedback}

TASK: Modify the HTML/CSS to address the feedback while:
1. Maintaining responsive design
2. Preserving overall structure
3. Keeping semantic HTML
4. Only changing what's requested

OUTPUT: Complete updated HTML file with embedded CSS. No explanations.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const refinedHtml = message.content[0].text;

    // Save iteration
    await pool.query(
      `INSERT INTO design_iterations (
        website_id, iteration_number, user_feedback, claude_refinement
      ) VALUES ($1, $2, $3, $4)`,
      [websiteId, iterationNumber, feedback, refinedHtml]
    );

    res.json({
      success: true,
      iterationNumber,
      html: refinedHtml,
      message: 'Website refined successfully',
    });
  } catch (error) {
    console.error('Error iterating website:', error);
    res.status(500).json({
      error: 'Failed to refine website',
      details: error.message,
    });
  }
});

module.exports = router;
