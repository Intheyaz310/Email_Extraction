const express = require('express');
const { query } = require('../utils/database');
const logger = require('../utils/logger');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get user statistics
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_users_today,
        COUNT(CASE WHEN DATE(last_login) = CURDATE() THEN 1 END) as active_users_today
      FROM users
    `);

    // Get extraction statistics
    const extractionStats = await query(`
      SELECT 
        COUNT(*) as total_extractions,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as extractions_today,
        COUNT(DISTINCT user_id) as unique_users_extracting
      FROM extracted_emails
    `);

    // Get domain statistics
    const domainStats = await query(`
      SELECT 
        domain,
        COUNT(*) as count
      FROM extracted_emails 
      GROUP BY domain 
      ORDER BY count DESC 
      LIMIT 10
    `);

    // Get recent activity
    const recentActivity = await query(`
      SELECT 
        u.name as user_name,
        u.email as user_email,
        e.created_at,
        e.domain,
        JSON_EXTRACT(e.extracted_data, '$.job_title') as job_title
      FROM extracted_emails e
      JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
      LIMIT 20
    `);

    res.json({
      user_stats: userStats[0],
      extraction_stats: extractionStats[0],
      domain_distribution: domainStats,
      recent_activity: recentActivity
    });

  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
});

// Get user management data
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Get users with pagination
    const users = await query(
      `SELECT 
        id, name, email, role, created_at, last_login,
        (SELECT COUNT(*) FROM extracted_emails WHERE user_id = users.id) as extraction_count
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    logger.info(`User ${userId} role updated to ${role} by admin ${req.user.id}`);

    res.json({ message: 'User role updated successfully' });

  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get system analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter;
    switch (period) {
      case '1d':
        dateFilter = 'DATE(created_at) = CURDATE()';
        break;
      case '7d':
        dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case '30d':
        dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case '90d':
        dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
        break;
      default:
        dateFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    }

    // User registration trends
    const userTrends = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users 
      WHERE ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Extraction trends
    const extractionTrends = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as extractions
      FROM extracted_emails 
      WHERE ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Top performing users
    const topUsers = await query(`
      SELECT 
        u.name,
        u.email,
        COUNT(e.id) as extraction_count,
        MAX(e.created_at) as last_activity
      FROM users u
      LEFT JOIN extracted_emails e ON u.id = e.user_id
      WHERE ${dateFilter.replace('created_at', 'e.created_at')}
      GROUP BY u.id
      ORDER BY extraction_count DESC
      LIMIT 10
    `);

    res.json({
      user_trends: userTrends,
      extraction_trends: extractionTrends,
      top_users: topUsers
    });

  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

// Get system health
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbHealth = await query('SELECT 1 as status');
    
    // Get system info
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    };

    res.json({
      status: 'healthy',
      database: dbHealth.length > 0 ? 'connected' : 'disconnected',
      system: systemInfo
    });

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});

module.exports = router;
