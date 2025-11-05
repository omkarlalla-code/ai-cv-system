const express = require('express');
const { query, getClient } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @route   GET /api/websites/:websiteId/versions
 * @desc    Get all versions for a website
 * @access  Private
 */
router.get('/websites/:websiteId/versions', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { websiteId } = req.params;

        // Verify website belongs to user
        const websiteCheck = await query(
            'SELECT id FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        if (websiteCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        // Get all versions
        const result = await query(`
            SELECT
                id,
                website_id,
                version_number,
                message,
                html_content,
                css_content,
                js_content,
                created_at,
                created_by
            FROM website_versions
            WHERE website_id = $1
            ORDER BY version_number DESC
        `, [websiteId]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/websites/:websiteId/versions/:versionId
 * @desc    Get a specific version
 * @access  Private
 */
router.get('/websites/:websiteId/versions/:versionId', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { websiteId, versionId } = req.params;

        // Verify website belongs to user
        const websiteCheck = await query(
            'SELECT id FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        if (websiteCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        // Get specific version
        const result = await query(`
            SELECT
                id,
                website_id,
                version_number,
                message,
                html_content,
                css_content,
                js_content,
                created_at,
                created_by
            FROM website_versions
            WHERE id = $1 AND website_id = $2
        `, [versionId, websiteId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Version not found'
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

/**
 * @route   POST /api/websites/:websiteId/versions
 * @desc    Create a new version snapshot
 * @access  Private
 */
router.post('/websites/:websiteId/versions', authMiddleware, [
    body('message').notEmpty().withMessage('Version message is required'),
    body('html_content').optional(),
    body('css_content').optional(),
    body('js_content').optional()
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
        const { websiteId } = req.params;
        const { message, html_content, css_content, js_content } = req.body;

        await client.query('BEGIN');

        // Verify website belongs to user
        const websiteCheck = await client.query(
            'SELECT id FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        if (websiteCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        // Get the next version number
        const versionCountResult = await client.query(
            'SELECT COALESCE(MAX(version_number), 0) as max_version FROM website_versions WHERE website_id = $1',
            [websiteId]
        );

        const nextVersion = versionCountResult.rows[0].max_version + 1;

        // Create new version
        const result = await client.query(`
            INSERT INTO website_versions (
                website_id,
                version_number,
                message,
                html_content,
                css_content,
                js_content,
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            websiteId,
            nextVersion,
            message,
            html_content || '',
            css_content || '',
            js_content || '',
            userId
        ]);

        await client.query('COMMIT');

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'create_version',
            JSON.stringify({
                websiteId,
                versionId: result.rows[0].id,
                versionNumber: nextVersion,
                message
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: 'Version created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

/**
 * @route   POST /api/websites/:websiteId/versions/:versionId/restore
 * @desc    Restore a specific version
 * @access  Private
 */
router.post('/websites/:websiteId/versions/:versionId/restore', authMiddleware, async (req, res, next) => {
    const client = await getClient();

    try {
        const userId = req.user.id;
        const { websiteId, versionId } = req.params;

        await client.query('BEGIN');

        // Verify website belongs to user
        const websiteCheck = await client.query(
            'SELECT id FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        if (websiteCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        // Get version to restore
        const versionResult = await client.query(
            'SELECT * FROM website_versions WHERE id = $1 AND website_id = $2',
            [versionId, websiteId]
        );

        if (versionResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Version not found'
            });
        }

        const version = versionResult.rows[0];

        // Create a new version with the restored content
        const versionCountResult = await client.query(
            'SELECT COALESCE(MAX(version_number), 0) as max_version FROM website_versions WHERE website_id = $1',
            [websiteId]
        );

        const nextVersion = versionCountResult.rows[0].max_version + 1;

        await client.query(`
            INSERT INTO website_versions (
                website_id,
                version_number,
                message,
                html_content,
                css_content,
                js_content,
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            websiteId,
            nextVersion,
            `Restored from version ${version.version_number}`,
            version.html_content,
            version.css_content,
            version.js_content,
            userId
        ]);

        // Update the website's current content (if you have such columns)
        await client.query(`
            UPDATE user_sites
            SET updated_at = NOW()
            WHERE id = $1
        `, [websiteId]);

        await client.query('COMMIT');

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [
            userId,
            'restore_version',
            JSON.stringify({
                websiteId,
                restoredVersionId: versionId,
                restoredVersionNumber: version.version_number
            }),
            req.ip,
            req.get('User-Agent')
        ]);

        res.json({
            success: true,
            message: 'Version restored successfully',
            data: {
                restoredVersion: version.version_number,
                newVersion: nextVersion
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

/**
 * @route   GET /api/websites/:websiteId/versions/compare
 * @desc    Compare two versions
 * @access  Private
 */
router.get('/websites/:websiteId/versions/compare', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { websiteId } = req.params;
        const { v1, v2 } = req.query;

        if (!v1 || !v2) {
            return res.status(400).json({
                success: false,
                message: 'Both v1 and v2 query parameters are required'
            });
        }

        // Verify website belongs to user
        const websiteCheck = await query(
            'SELECT id FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        if (websiteCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        // Get both versions
        const versionsResult = await query(`
            SELECT
                id,
                version_number,
                message,
                html_content,
                css_content,
                js_content,
                created_at
            FROM website_versions
            WHERE id IN ($1, $2) AND website_id = $3
            ORDER BY version_number ASC
        `, [v1, v2, websiteId]);

        if (versionsResult.rows.length !== 2) {
            return res.status(404).json({
                success: false,
                message: 'One or both versions not found'
            });
        }

        const [version1, version2] = versionsResult.rows;

        // Calculate differences (simple character count for now)
        const diff = {
            html: {
                added: version2.html_content.length - version1.html_content.length,
                changed: version1.html_content !== version2.html_content
            },
            css: {
                added: version2.css_content.length - version1.css_content.length,
                changed: version1.css_content !== version2.css_content
            },
            js: {
                added: version2.js_content.length - version1.js_content.length,
                changed: version1.js_content !== version2.js_content
            }
        };

        res.json({
            success: true,
            data: {
                version1,
                version2,
                diff
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;
