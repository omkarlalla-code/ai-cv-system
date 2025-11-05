/**
 * Admin Routes
 * Administrative endpoints for security monitoring and management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getSecurityEvents, getAccessLogs } = require('../middleware/requestLogger');
const { getIpStatus } = require('../middleware/ipWhitelist');

/**
 * Middleware to check if user is admin
 */
const isAdmin = async (req, res, next) => {
  // TODO: Implement proper admin role check
  // For now, check if user has admin flag
  if (!req.user?.is_admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

/**
 * GET /api/admin/security-events
 * Get recent security events
 */
router.get('/security-events', authMiddleware, isAdmin, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const events = getSecurityEvents(limit);

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security events',
    });
  }
});

/**
 * GET /api/admin/access-logs
 * Get recent access logs
 */
router.get('/access-logs', authMiddleware, isAdmin, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = getAccessLogs(limit);

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access logs',
    });
  }
});

/**
 * GET /api/admin/ip-status/:ip
 * Check IP whitelist/blacklist status
 */
router.get('/ip-status/:ip', authMiddleware, isAdmin, (req, res) => {
  try {
    const { ip } = req.params;
    const status = getIpStatus(ip);

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Error checking IP status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check IP status',
    });
  }
});

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { pool } = require('../config/database');

    // Get database statistics
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    const projectCount = await pool.query('SELECT COUNT(*) FROM projects');
    const cvCount = await pool.query('SELECT COUNT(*) FROM cv_data');
    const websiteCount = await pool.query('SELECT COUNT(*) FROM websites');

    // Get recent security events
    const securityEvents = getSecurityEvents(10);
    const recentFailedLogins = securityEvents.filter(e =>
      e.event === 'AUTH_FAILED' && Date.now() - new Date(e.timestamp) < 3600000
    ).length;

    res.json({
      success: true,
      stats: {
        users: {
          total: parseInt(userCount.rows[0].count),
        },
        projects: {
          total: parseInt(projectCount.rows[0].count),
        },
        cvs: {
          total: parseInt(cvCount.rows[0].count),
        },
        websites: {
          total: parseInt(websiteCount.rows[0].count),
        },
        security: {
          recentFailedLogins,
          recentSecurityEvents: securityEvents.length,
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

module.exports = router;
