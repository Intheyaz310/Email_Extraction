const jwt = require('jsonwebtoken');
const { query } = require('../utils/database');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware to require authentication
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const users = await query('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.userId]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user info to request
    req.user = users[0];
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to require admin role
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();

  } catch (error) {
    logger.error('Admin authorization error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

// Middleware to require specific role
const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.role !== requiredRole) {
        return res.status(403).json({ error: `${requiredRole} access required` });
      }

      next();

    } catch (error) {
      logger.error('Role authorization error:', error);
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const users = await query('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.userId]);
        if (users.length > 0) {
          req.user = users[0];
        }
      } catch (error) {
        // Token is invalid, but we continue without authentication
        logger.debug('Invalid token in optional auth:', error.message);
      }
    }

    next();

  } catch (error) {
    logger.error('Optional authentication error:', error);
    next(); // Continue without authentication
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole,
  optionalAuth
};
