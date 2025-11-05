const express = require('express');
const { query } = require('../config/database');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the current user
 * @access  Private
 */
router.get('/notifications', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { limit = 20, offset = 0, unreadOnly = false } = req.query;

        let queryText = `
            SELECT
                id,
                type,
                title,
                message,
                link,
                is_read,
                created_at,
                read_at
            FROM notifications
            WHERE user_id = $1
        `;

        const params = [userId];

        if (unreadOnly === 'true') {
            queryText += ' AND is_read = FALSE';
        }

        queryText += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await query(queryText, params);

        // Get unread count
        const unreadResult = await query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        res.json({
            success: true,
            data: result.rows,
            unreadCount: parseInt(unreadResult.rows[0].count),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: result.rows.length === parseInt(limit)
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/notifications/unread-count', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        res.json({
            success: true,
            count: parseInt(result.rows[0].count)
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.post('/notifications/:id/read', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const result = await query(`
            UPDATE notifications
            SET is_read = TRUE, read_at = NOW()
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `, [notificationId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
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
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post('/notifications/mark-all-read', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await query(`
            UPDATE notifications
            SET is_read = TRUE, read_at = NOW()
            WHERE user_id = $1 AND is_read = FALSE
            RETURNING id
        `, [userId]);

        res.json({
            success: true,
            message: 'All notifications marked as read',
            count: result.rows.length
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/notifications/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const result = await query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
            [notificationId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/notifications', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await query(
            'DELETE FROM notifications WHERE user_id = $1 AND is_read = TRUE',
            [userId]
        );

        res.json({
            success: true,
            message: 'Read notifications deleted successfully',
            count: result.rowCount
        });

    } catch (error) {
        next(error);
    }
});

/**
 * Helper function to create a notification
 * Can be used by other services
 */
async function createNotification(userId, { type, title, message, link = null }) {
    try {
        const result = await query(`
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, type, title, message, link]);

        return result.rows[0];
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

// Export router and helper function
module.exports = router;
module.exports.createNotification = createNotification;
