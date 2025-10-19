const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get user statistics for dashboard
router.get('/stats', async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get website count
        const websiteResult = await query(
            'SELECT COUNT(*) as count FROM user_sites WHERE user_id = $1',
            [userId]
        );

        // Get total views across all websites
        const viewsResult = await query(
            'SELECT COALESCE(SUM(view_count), 0) as total_views FROM user_sites WHERE user_id = $1',
            [userId]
        );

        // Get CV count
        const cvResult = await query(
            'SELECT COUNT(*) as count FROM cv_data WHERE user_id = $1',
            [userId]
        );

        // Get unique templates used
        const templatesResult = await query(
            'SELECT COUNT(DISTINCT template_id) as count FROM user_sites WHERE user_id = $1 AND template_id IS NOT NULL',
            [userId]
        );

        res.json({
            success: true,
            websiteCount: parseInt(websiteResult.rows[0].count),
            totalViews: parseInt(viewsResult.rows[0].total_views),
            cvCount: parseInt(cvResult.rows[0].count),
            templateCount: parseInt(templatesResult.rows[0].count)
        });

    } catch (error) {
        next(error);
    }
});

// Get user's CV data
router.get('/cv-data', async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await query(`
            SELECT
                id,
                personal_info,
                education,
                experience,
                skills,
                projects,
                certifications,
                languages,
                interests,
                original_filename,
                file_type,
                parsing_status,
                created_at,
                updated_at
            FROM cv_data
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// Get specific CV data by ID
router.get('/cv-data/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cvId = req.params.id;

        const result = await query(`
            SELECT * FROM cv_data
            WHERE id = $1 AND user_id = $2
        `, [cvId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'CV data not found'
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

// Get user's websites
router.get('/websites', async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await query(`
            SELECT
                us.*,
                t.name as template_name,
                cv.personal_info->>'name' as cv_name
            FROM user_sites us
            LEFT JOIN templates t ON us.template_id = t.id
            LEFT JOIN cv_data cv ON us.cv_data_id = cv.id
            WHERE us.user_id = $1
            ORDER BY us.updated_at DESC
        `, [userId]);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
});

// Get specific website by ID
router.get('/websites/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        const result = await query(`
            SELECT
                us.*,
                t.name as template_name,
                t.html_content as template_html,
                t.css_content as template_css,
                cv.*
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

// Get user activity logs
router.get('/activity', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const result = await query(`
            SELECT
                action,
                details,
                ip_address,
                created_at
            FROM activity_logs
            WHERE user_id = $1
            ORDER BY created_at DESC
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

// Update user profile
router.put('/profile', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { email } = req.body;

        // Basic validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Valid email required'
            });
        }

        // Check if email is already taken by another user
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, userId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already taken'
            });
        }

        // Update user
        const result = await query(`
            UPDATE users
            SET email = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, username, email, updated_at
        `, [email, userId]);

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, 'update_profile', $2, $3, $4)
        `, [userId, JSON.stringify({ email }), req.ip, req.get('User-Agent')]);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
});

// Change password
router.put('/password', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters'
            });
        }

        // Get current password hash
        const userResult = await query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

        // Verify current password
        const bcrypt = require('bcryptjs');
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // Update password
        await query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [newPasswordHash, userId]
        );

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, ip_address, user_agent)
            VALUES ($1, 'change_password', $2, $3)
        `, [userId, req.ip, req.get('User-Agent')]);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Delete CV data
router.delete('/cv-data/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cvId = req.params.id;

        // Check if CV is being used by any websites
        const websiteCheck = await query(
            'SELECT COUNT(*) as count FROM user_sites WHERE cv_data_id = $1',
            [cvId]
        );

        if (parseInt(websiteCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete CV data that is being used by websites'
            });
        }

        // Delete CV data
        const result = await query(
            'DELETE FROM cv_data WHERE id = $1 AND user_id = $2 RETURNING id',
            [cvId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'CV data not found'
            });
        }

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, 'delete_cv', $2, $3, $4)
        `, [userId, JSON.stringify({ cvId }), req.ip, req.get('User-Agent')]);

        res.json({
            success: true,
            message: 'CV data deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

// Delete website
router.delete('/websites/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const websiteId = req.params.id;

        // Get website details for logging
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

        const website = websiteResult.rows[0];

        // Delete website
        await query(
            'DELETE FROM user_sites WHERE id = $1 AND user_id = $2',
            [websiteId, userId]
        );

        // TODO: Delete GitLab repository and remove DNS records

        // Log activity
        await query(`
            INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
            VALUES ($1, 'delete_website', $2, $3, $4)
        `, [userId, JSON.stringify({ websiteId, subdomain: website.subdomain }), req.ip, req.get('User-Agent')]);

        res.json({
            success: true,
            message: 'Website deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;