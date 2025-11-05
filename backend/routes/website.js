const express = require('express');
const { query, getClient } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const WebsiteGenerator = require('../services/websiteGenerator');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Preview website endpoint
router.post('/preview-website', authMiddleware, [
    body('templateId').notEmpty().withMessage('Template ID required'),
    body('cvDataId').notEmpty().withMessage('CV data ID required'),
    body('primaryColor').optional().isHexColor().withMessage('Invalid color format')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const { templateId, cvDataId, primaryColor } = req.body;

        // Get template
        const templateResult = await query(
            'SELECT * FROM templates WHERE id = $1',
            [templateId]
        );

        if (templateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Get CV data
        const cvResult = await query(
            'SELECT * FROM cv_data WHERE id = $1 AND user_id = $2',
            [cvDataId, userId]
        );

        if (cvResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'CV data not found'
            });
        }

        const template = templateResult.rows[0];
        const cvData = cvResult.rows[0];

        // Generate preview
        const generator = new WebsiteGenerator();
        const previewHtml = await generator.generatePreview(template, cvData, {
            primaryColor: primaryColor || '#2563eb'
        });

        res.json({
            success: true,
            html: previewHtml
        });

    } catch (error) {
        next(error);
    }
});

// Create/Update website endpoint
router.post('/publish-website', authMiddleware, [
    body('templateId').notEmpty().withMessage('Template ID required'),
    body('cvDataId').notEmpty().withMessage('CV data ID required'),
    body('siteTitle').isLength({ min: 1, max: 100 }).withMessage('Site title required (1-100 characters)'),
    body('subdomain').matches(/^[a-zA-Z0-9_-]+$/).isLength({ min: 3, max: 50 }).withMessage('Invalid subdomain format'),
    body('primaryColor').optional().isHexColor().withMessage('Invalid color format')
], async (req, res, next) => {
    const client = await getClient();

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const {
            templateId,
            cvDataId,
            siteTitle,
            subdomain,
            primaryColor,
            websiteId // For updates
        } = req.body;

        await client.query('BEGIN');

        // Check if subdomain is available (exclude current website if updating)
        const subdomainCheck = await client.query(
            websiteId
                ? 'SELECT id FROM user_sites WHERE subdomain = $1 AND id != $2'
                : 'SELECT id FROM user_sites WHERE subdomain = $1',
            websiteId ? [subdomain, websiteId] : [subdomain]
        );

        if (subdomainCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                success: false,
                message: 'Subdomain already taken'
            });
        }

        // Validate template exists
        const templateResult = await client.query(
            'SELECT * FROM templates WHERE id = $1',
            [templateId]
        );

        if (templateResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Validate CV data belongs to user
        const cvResult = await client.query(
            'SELECT * FROM cv_data WHERE id = $1 AND user_id = $2',
            [cvDataId, userId]
        );

        if (cvResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'CV data not found'
            });
        }

        const template = templateResult.rows[0];
        const cvData = cvResult.rows[0];

        // Generate website
        const generator = new WebsiteGenerator();
        const websiteFiles = await generator.generateWebsite(template, cvData, {
            primaryColor: primaryColor || '#2563eb',
            siteTitle
        });

        let websiteResult;

        if (websiteId) {
            // Update existing website
            websiteResult = await client.query(`
                UPDATE user_sites SET
                    template_id = $1,
                    cv_data_id = $2,
                    site_title = $3,
                    subdomain = $4,
                    theme_colors = $5,
                    is_published = true,
                    last_deployed_at = NOW(),
                    updated_at = NOW()
                WHERE id = $6 AND user_id = $7
                RETURNING *
            `, [
                templateId,
                cvDataId,
                siteTitle,
                subdomain,
                JSON.stringify({ primary: primaryColor || '#2563eb' }),
                websiteId,
                userId
            ]);
        } else {
            // Create new website
            websiteResult = await client.query(`
                INSERT INTO user_sites (
                    user_id, template_id, cv_data_id, site_title,
                    subdomain, theme_colors, is_published, last_deployed_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
                RETURNING *
            `, [
                userId,
                templateId,
                cvDataId,
                siteTitle,
                subdomain,
                JSON.stringify({ primary: primaryColor || '#2563eb' })
            ]);
        }

        const website = websiteResult.rows[0];

        // TODO: Deploy to GitLab and setup DNS
        await deployWebsite(website, websiteFiles);

        // Update template usage count
        await client.query(
            'UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1',
            [templateId]
        );

        await client.query('COMMIT');

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            websiteId ? 'update_website' : 'create_website',
            JSON.stringify({
                websiteId: website.id,
                subdomain,
                templateId,
                cvDataId
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: websiteId ? 'Website updated successfully' : 'Website created successfully',
            data: {
                id: website.id,
                subdomain: website.subdomain,
                url: `https://${website.subdomain}.bettercv.com`,
                isPublished: website.is_published
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

// Update website settings
router.put('/websites/:id', authMiddleware, [
    body('siteTitle').optional().isLength({ min: 1, max: 100 }),
    body('primaryColor').optional().isHexColor(),
    body('isPublic').optional().isBoolean()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const websiteId = req.params.id;
        const { siteTitle, primaryColor, isPublic } = req.body;

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (siteTitle !== undefined) {
            updates.push(`site_title = $${paramCount}`);
            values.push(siteTitle);
            paramCount++;
        }

        if (primaryColor !== undefined) {
            updates.push(`theme_colors = $${paramCount}`);
            values.push(JSON.stringify({ primary: primaryColor }));
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
        values.push(websiteId, userId);

        const updateQuery = `
            UPDATE user_sites SET ${updates.join(', ')}
            WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
            RETURNING *
        `;

        const result = await query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        res.json({
            success: true,
            message: 'Website updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Toggle website publication status
router.patch('/websites/:id/toggle-publish', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        const result = await query(`
            UPDATE user_sites SET
                is_published = NOT is_published,
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING id, subdomain, is_published
        `, [websiteId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        const website = result.rows[0];

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            website.is_published ? 'publish_website' : 'unpublish_website',
            JSON.stringify({
                websiteId,
                subdomain: website.subdomain
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: `Website ${website.is_published ? 'published' : 'unpublished'} successfully`,
            data: {
                id: website.id,
                isPublished: website.is_published
            }
        });

    } catch (error) {
        next(error);
    }
});

// Publish website
router.post('/websites/:id/publish', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        const result = await query(`
            UPDATE user_sites SET
                is_published = true,
                last_deployed_at = NOW(),
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING id, subdomain, is_published
        `, [websiteId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        const website = result.rows[0];

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'publish_website',
            JSON.stringify({
                websiteId,
                subdomain: website.subdomain
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: 'Website published successfully',
            data: {
                id: website.id,
                subdomain: website.subdomain,
                isPublished: website.is_published,
                url: `https://${website.subdomain}.bettercv.com`
            }
        });

    } catch (error) {
        next(error);
    }
});

// Unpublish website
router.post('/websites/:id/unpublish', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        const result = await query(`
            UPDATE user_sites SET
                is_published = false,
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING id, subdomain, is_published
        `, [websiteId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        const website = result.rows[0];

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'unpublish_website',
            JSON.stringify({
                websiteId,
                subdomain: website.subdomain
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: 'Website unpublished successfully',
            data: {
                id: website.id,
                isPublished: website.is_published
            }
        });

    } catch (error) {
        next(error);
    }
});

// Duplicate website
router.post('/websites/:id/duplicate', authMiddleware, async (req, res, next) => {
    const client = await getClient();

    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        await client.query('BEGIN');

        // Get original website
        const originalResult = await client.query(
            'SELECT * FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        if (originalResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        const original = originalResult.rows[0];

        // Generate unique subdomain
        let newSubdomain = `${original.subdomain}-copy`;
        let counter = 1;

        while (true) {
            const check = await client.query(
                'SELECT id FROM user_sites WHERE subdomain = $1',
                [newSubdomain]
            );

            if (check.rows.length === 0) break;

            newSubdomain = `${original.subdomain}-copy-${counter}`;
            counter++;
        }

        // Create duplicate
        const duplicateResult = await client.query(`
            INSERT INTO user_sites (
                user_id,
                template_id,
                cv_data_id,
                site_title,
                subdomain,
                theme_colors,
                is_published
            ) VALUES ($1, $2, $3, $4, $5, $6, false)
            RETURNING *
        `, [
            userId,
            original.template_id,
            original.cv_data_id,
            `${original.site_title} (Copy)`,
            newSubdomain,
            original.theme_colors
        ]);

        const duplicate = duplicateResult.rows[0];

        await client.query('COMMIT');

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'duplicate_website',
            JSON.stringify({
                originalId: websiteId,
                duplicateId: duplicate.id,
                originalSubdomain: original.subdomain,
                newSubdomain: newSubdomain
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: 'Website duplicated successfully',
            data: {
                id: duplicate.id,
                siteTitle: duplicate.site_title,
                subdomain: duplicate.subdomain,
                isPublished: duplicate.is_published
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

// Get all websites for user
router.get('/websites', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { sort = 'updated_at', order = 'DESC', filter } = req.query;

        // Build query
        let queryText = `
            SELECT
                us.*,
                t.name as template_name,
                cv.file_name as cv_file_name
            FROM user_sites us
            LEFT JOIN templates t ON us.template_id = t.id
            LEFT JOIN cv_data cv ON us.cv_data_id = cv.id
            WHERE us.user_id = $1
        `;

        const params = [userId];

        // Add filter if specified
        if (filter === 'published') {
            queryText += ' AND us.is_published = true';
        } else if (filter === 'unpublished') {
            queryText += ' AND us.is_published = false';
        }

        // Add sorting
        const validSortFields = ['created_at', 'updated_at', 'site_title', 'view_count'];
        const sortField = validSortFields.includes(sort) ? sort : 'updated_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        queryText += ` ORDER BY us.${sortField} ${sortOrder}`;

        const result = await query(queryText, params);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// Get single website
router.get('/websites/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        const result = await query(`
            SELECT
                us.*,
                t.name as template_name,
                cv.file_name as cv_file_name
            FROM user_sites us
            LEFT JOIN templates t ON us.template_id = t.id
            LEFT JOIN cv_data cv ON us.cv_data_id = cv.id
            WHERE us.id = $1 AND us.user_id = $2
        `, [websiteId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
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

// Delete website
router.delete('/websites/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        // Get website info before deleting
        const websiteResult = await query(
            'SELECT subdomain FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        if (websiteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        const subdomain = websiteResult.rows[0].subdomain;

        // Delete website (cascade will handle versions)
        await query(
            'DELETE FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'delete_website',
            JSON.stringify({
                websiteId,
                subdomain
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: 'Website deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Get website analytics
router.get('/websites/:id/analytics', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        // Check if website belongs to user
        const websiteResult = await query(
            'SELECT id, subdomain, view_count, created_at FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        if (websiteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        const website = websiteResult.rows[0];

        // For now, return basic analytics
        // TODO: Implement detailed analytics with external service
        res.json({
            success: true,
            data: {
                websiteId: website.id,
                subdomain: website.subdomain,
                totalViews: website.view_count,
                createdAt: website.created_at,
                // Mock data for now
                dailyViews: generateMockDailyViews(),
                topPages: [
                    { page: '/', views: Math.floor(website.view_count * 0.6) },
                    { page: '/#about', views: Math.floor(website.view_count * 0.2) },
                    { page: '/#projects', views: Math.floor(website.view_count * 0.2) }
                ]
            }
        });

    } catch (error) {
        next(error);
    }
});

// Helper function to deploy website (placeholder)
async function deployWebsite(website, websiteFiles) {
    // TODO: Implement GitLab deployment
    console.log(`Deploying website: ${website.subdomain}.cvsite.com`);

    // This would typically:
    // 1. Create/update GitLab repository
    // 2. Push website files to repository
    // 3. Configure GitLab Pages
    // 4. Setup DNS records for subdomain
    // 5. Configure SSL certificate

    return {
        success: true,
        gitlabUrl: `https://gitlab.com/cvsite/${website.subdomain}`,
        deploymentId: `deploy-${Date.now()}`
    };
}

// Helper function to generate mock daily views
function generateMockDailyViews() {
    const days = 30;
    const views = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        views.push({
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 50) + 1
        });
    }

    return views;
}

module.exports = router;
