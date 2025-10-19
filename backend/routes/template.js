const express = require('express');
const { query } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all public templates
router.get('/', async (req, res, next) => {
    try {
        const category = req.query.category;
        const featured = req.query.featured === 'true';
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        let whereClause = 'WHERE is_public = true';
        const queryParams = [limit, offset];
        let paramCount = 3;

        if (category) {
            whereClause += ` AND category = $${paramCount}`;
            queryParams.push(category);
            paramCount++;
        }

        if (featured) {
            whereClause += ` AND is_featured = true`;
        }

        const result = await query(`
            SELECT
                id,
                name,
                description,
                preview_image_url,
                category,
                is_featured,
                usage_count,
                created_at
            FROM templates
            ${whereClause}
            ORDER BY
                CASE WHEN is_featured THEN 0 ELSE 1 END,
                usage_count DESC,
                created_at DESC
            LIMIT $1 OFFSET $2
        `, queryParams);

        // Get total count for pagination
        const countResult = await query(`
            SELECT COUNT(*) as total
            FROM templates
            ${whereClause}
        `, queryParams.slice(2));

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total),
                limit,
                offset,
                hasMore: result.rows.length === limit
            }
        });

    } catch (error) {
        next(error);
    }
});

// Get template by ID with full content
router.get('/:id', async (req, res, next) => {
    try {
        const templateId = req.params.id;

        const result = await query(`
            SELECT
                id,
                name,
                description,
                html_content,
                css_content,
                preview_image_url,
                category,
                is_public,
                is_featured,
                usage_count,
                created_at
            FROM templates
            WHERE id = $1 AND is_public = true
        `, [templateId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Get template categories
router.get('/meta/categories', async (req, res, next) => {
    try {
        const result = await query(`
            SELECT
                category,
                COUNT(*) as template_count
            FROM templates
            WHERE is_public = true
            GROUP BY category
            ORDER BY template_count DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// Get featured templates
router.get('/meta/featured', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 6;

        const result = await query(`
            SELECT
                id,
                name,
                description,
                preview_image_url,
                category,
                usage_count
            FROM templates
            WHERE is_public = true AND is_featured = true
            ORDER BY usage_count DESC
            LIMIT $1
        `, [limit]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// Search templates
router.get('/search', async (req, res, next) => {
    try {
        const query_text = req.query.q;
        const category = req.query.category;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        if (!query_text || query_text.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        let whereClause = `WHERE is_public = true AND (
            name ILIKE $3 OR
            description ILIKE $3 OR
            category ILIKE $3
        )`;
        const queryParams = [limit, offset, `%${query_text.trim()}%`];
        let paramCount = 4;

        if (category) {
            whereClause += ` AND category = $${paramCount}`;
            queryParams.push(category);
            paramCount++;
        }

        const result = await query(`
            SELECT
                id,
                name,
                description,
                preview_image_url,
                category,
                is_featured,
                usage_count,
                created_at
            FROM templates
            ${whereClause}
            ORDER BY
                CASE WHEN is_featured THEN 0 ELSE 1 END,
                usage_count DESC
            LIMIT $1 OFFSET $2
        `, queryParams);

        res.json({
            success: true,
            data: result.rows,
            query: query_text,
            pagination: {
                limit,
                offset,
                hasMore: result.rows.length === limit
            }
        });

    } catch (error) {
        next(error);
    }
});

// Create custom template (authenticated users only)
router.post('/', authMiddleware, async (req, res, next) => {
    try {
        const {
            name,
            description,
            htmlContent,
            cssContent,
            category,
            isPublic = false
        } = req.body;

        if (!name || !htmlContent || !cssContent) {
            return res.status(400).json({
                success: false,
                message: 'Name, HTML content, and CSS content are required'
            });
        }

        const userId = req.user.id;

        const result = await query(`
            INSERT INTO templates (
                name,
                description,
                html_content,
                css_content,
                category,
                is_public,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, description, category, is_public, created_at
        `, [
            name,
            description || '',
            htmlContent,
            cssContent,
            category || 'custom',
            isPublic,
            userId
        ]);

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, 'create_template', $2, $3, $4)
        `, [
            userId,
            JSON.stringify({
                templateId: result.rows[0].id,
                name,
                category: category || 'custom'
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.status(201).json({
            success: true,
            message: 'Template created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Update custom template (only creator can update)
router.put('/:id', authMiddleware, async (req, res, next) => {
    try {
        const templateId = req.params.id;
        const userId = req.user.id;
        const {
            name,
            description,
            htmlContent,
            cssContent,
            category,
            isPublic
        } = req.body;

        // Check if template exists and user is the creator
        const templateCheck = await query(
            'SELECT created_by FROM templates WHERE id = $1',
            [templateId]
        );

        if (templateCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        if (templateCheck.rows[0].created_by !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit templates you created'
            });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name !== undefined) {
            updates.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (description !== undefined) {
            updates.push(`description = $${paramCount}`);
            values.push(description);
            paramCount++;
        }

        if (htmlContent !== undefined) {
            updates.push(`html_content = $${paramCount}`);
            values.push(htmlContent);
            paramCount++;
        }

        if (cssContent !== undefined) {
            updates.push(`css_content = $${paramCount}`);
            values.push(cssContent);
            paramCount++;
        }

        if (category !== undefined) {
            updates.push(`category = $${paramCount}`);
            values.push(category);
            paramCount++;
        }

        if (isPublic !== undefined) {
            updates.push(`is_public = $${paramCount}`);
            values.push(isPublic);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid updates provided'
            });
        }

        updates.push('updated_at = NOW()');
        values.push(templateId);

        const updateQuery = `
            UPDATE templates SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, name, description, category, is_public, updated_at
        `;

        const result = await query(updateQuery, values);

        res.json({
            success: true,
            message: 'Template updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Get user's custom templates
router.get('/user/my-templates', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const result = await query(`
            SELECT
                id,
                name,
                description,
                category,
                is_public,
                usage_count,
                created_at,
                updated_at
            FROM templates
            WHERE created_by = $1
            ORDER BY updated_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                limit,
                offset,
                hasMore: result.rows.length === limit
            }
        });

    } catch (error) {
        next(error);
    }
});

// Delete custom template (only creator can delete)
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const templateId = req.params.id;
        const userId = req.user.id;

        // Check if template exists and user is the creator
        const templateCheck = await query(
            'SELECT created_by, name FROM templates WHERE id = $1',
            [templateId]
        );

        if (templateCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        if (templateCheck.rows[0].created_by !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete templates you created'
            });
        }

        // Check if template is being used by any websites
        const usageCheck = await query(
            'SELECT COUNT(*) as count FROM user_sites WHERE template_id = $1',
            [templateId]
        );

        if (parseInt(usageCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete template that is being used by websites'
            });
        }

        // Delete template
        await query('DELETE FROM templates WHERE id = $1', [templateId]);

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, 'delete_template', $2, $3, $4)
        `, [
            userId,
            JSON.stringify({
                templateId,
                name: templateCheck.rows[0].name
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: 'Template deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;