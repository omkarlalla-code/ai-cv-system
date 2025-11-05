const express = require('express');
const { query } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get dashboard statistics for the current user
 * @access  Private
 */
router.get('/stats/dashboard', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get total websites count
        const websitesResult = await query(
            'SELECT COUNT(*) as total FROM user_sites WHERE user_id = $1',
            [userId]
        );
        const totalWebsites = parseInt(websitesResult.rows[0].total);

        // Get published websites count
        const publishedResult = await query(
            'SELECT COUNT(*) as total FROM user_sites WHERE user_id = $1 AND is_published = true',
            [userId]
        );
        const publishedWebsites = parseInt(publishedResult.rows[0].total);

        // Get total views across all websites
        const viewsResult = await query(
            'SELECT COALESCE(SUM(view_count), 0) as total FROM user_sites WHERE user_id = $1',
            [userId]
        );
        const totalViews = parseInt(viewsResult.rows[0].total);

        // Get templates published by user
        const templatesResult = await query(
            'SELECT COUNT(*) as total FROM templates WHERE created_by = $1',
            [userId]
        );
        const publishedTemplates = parseInt(templatesResult.rows[0].total);

        // Get most recent websites
        const recentWebsites = await query(`
            SELECT
                id,
                site_title,
                subdomain,
                is_published,
                view_count,
                created_at,
                updated_at
            FROM user_sites
            WHERE user_id = $1
            ORDER BY updated_at DESC
            LIMIT 5
        `, [userId]);

        // Get popular websites
        const popularWebsites = await query(`
            SELECT
                id,
                site_title,
                subdomain,
                is_published,
                view_count,
                created_at
            FROM user_sites
            WHERE user_id = $1
            ORDER BY view_count DESC
            LIMIT 5
        `, [userId]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalWebsites,
                    publishedWebsites,
                    totalViews,
                    publishedTemplates
                },
                recentWebsites: recentWebsites.rows,
                popularWebsites: popularWebsites.rows
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/stats/activity
 * @desc    Get recent activity for the current user
 * @access  Private
 */
router.get('/stats/activity', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        // Get recent activity logs
        const result = await query(`
            SELECT
                id,
                action,
                details,
                created_at,
                ip_address
            FROM activity_logs
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `, [userId, limit]);

        // Format activities with human-readable descriptions
        const activities = result.rows.map(activity => {
            const descriptions = {
                'create_website': 'Created a new website',
                'update_website': 'Updated website',
                'publish_website': 'Published website',
                'unpublish_website': 'Unpublished website',
                'delete_website': 'Deleted website',
                'upload_cv': 'Uploaded CV',
                'parse_cv': 'Parsed CV data',
                'create_version': 'Created version snapshot',
                'restore_version': 'Restored previous version',
                'ai_brainstorm': 'Used AI brainstorming',
                'ai_suggestions': 'Generated AI suggestions',
                'publish_template': 'Published template',
                'use_template': 'Used a template'
            };

            return {
                id: activity.id,
                action: activity.action,
                description: descriptions[activity.action] || activity.action,
                details: activity.details,
                createdAt: activity.created_at
            };
        });

        res.json({
            success: true,
            data: activities
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/stats/usage
 * @desc    Get usage statistics (API calls, storage, etc.)
 * @access  Private
 */
router.get('/stats/usage', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get CV upload count
        const cvUploadsResult = await query(
            'SELECT COUNT(*) as total FROM cv_data WHERE user_id = $1',
            [userId]
        );
        const cvUploads = parseInt(cvUploadsResult.rows[0].total);

        // Get AI interactions count (last 30 days)
        const aiInteractionsResult = await query(`
            SELECT COUNT(*) as total
            FROM activity_logs
            WHERE user_id = $1
            AND action LIKE 'ai_%'
            AND created_at >= NOW() - INTERVAL '30 days'
        `, [userId]);
        const aiInteractions = parseInt(aiInteractionsResult.rows[0].total);

        // Get total version snapshots
        const versionsResult = await query(`
            SELECT COUNT(*) as total
            FROM website_versions wv
            JOIN user_sites us ON wv.website_id = us.id
            WHERE us.user_id = $1
        `, [userId]);
        const versionSnapshots = parseInt(versionsResult.rows[0].total);

        // Get account age
        const userResult = await query(
            'SELECT created_at FROM users WHERE id = $1',
            [userId]
        );
        const accountCreatedAt = userResult.rows[0].created_at;
        const accountAge = Math.floor((Date.now() - new Date(accountCreatedAt)) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            data: {
                cvUploads,
                aiInteractions,
                versionSnapshots,
                accountAge,
                accountCreatedAt
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/stats/analytics/:websiteId
 * @desc    Get detailed analytics for a specific website
 * @access  Private
 */
router.get('/stats/analytics/:websiteId', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { websiteId } = req.params;

        // Verify website belongs to user
        const websiteResult = await query(`
            SELECT
                id,
                subdomain,
                site_title,
                view_count,
                is_published,
                created_at,
                last_deployed_at
            FROM user_sites
            WHERE id = $1 AND user_id = $2
        `, [websiteId, userId]);

        if (websiteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        const website = websiteResult.rows[0];

        // Get version count
        const versionCountResult = await query(
            'SELECT COUNT(*) as total FROM website_versions WHERE website_id = $1',
            [websiteId]
        );
        const versionCount = parseInt(versionCountResult.rows[0].total);

        // Generate mock daily views for last 30 days
        const dailyViews = generateDailyViews(website.view_count);

        // Get deployment history (from version snapshots)
        const deploymentHistory = await query(`
            SELECT
                version_number,
                message,
                created_at
            FROM website_versions
            WHERE website_id = $1
            ORDER BY created_at DESC
            LIMIT 10
        `, [websiteId]);

        res.json({
            success: true,
            data: {
                website: {
                    id: website.id,
                    subdomain: website.subdomain,
                    siteTitle: website.site_title,
                    isPublished: website.is_published,
                    createdAt: website.created_at,
                    lastDeployedAt: website.last_deployed_at
                },
                metrics: {
                    totalViews: website.view_count,
                    versionCount,
                    dailyViews: dailyViews.slice(-30), // Last 30 days
                    weeklyViews: dailyViews.slice(-7).reduce((sum, day) => sum + day.views, 0),
                    monthlyViews: dailyViews.reduce((sum, day) => sum + day.views, 0)
                },
                deploymentHistory: deploymentHistory.rows
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Helper function to generate daily views data
 */
function generateDailyViews(totalViews) {
    const days = 30;
    const views = [];
    const today = new Date();

    // Distribute total views across 30 days with some randomness
    const avgViewsPerDay = Math.ceil(totalViews / days);

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Generate views with some variance
        const variance = Math.random() * 0.5 + 0.75; // 0.75 to 1.25
        const viewCount = Math.max(0, Math.floor(avgViewsPerDay * variance));

        views.push({
            date: date.toISOString().split('T')[0],
            views: viewCount
        });
    }

    return views;
}

module.exports = router;
