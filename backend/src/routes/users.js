const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../utils/database');
const logger = require('../utils/logger');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;

    const users = await query(
      'SELECT id, name, email, role, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's extraction count
    const extractionCount = await query(
      'SELECT COUNT(*) as count FROM extracted_emails WHERE user_id = ?',
      [userId]
    );

    const userProfile = {
      ...users[0],
      extraction_count: extractionCount[0].count
    };

    res.json(userProfile);

  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// Update user profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user.id;
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existingUser.length > 0) {
        return res.status(409).json({ error: 'Email already taken' });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    logger.info(`User ${userId} profile updated`);

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const users = await query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    logger.info(`User ${userId} password changed`);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user's extraction history
router.get('/extractions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM extracted_emails WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0].total;

    // Get extractions with pagination
    const extractions = await query(
      'SELECT * FROM extracted_emails WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, parseInt(limit), offset]
    );

    // Parse JSON data
    const parsedExtractions = extractions.map(row => ({
      ...row,
      extracted_data: JSON.parse(row.extracted_data)
    }));

    res.json({
      extractions: parsedExtractions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Get user extractions error:', error);
    res.status(500).json({ error: 'Failed to retrieve extractions' });
  }
});

// Delete user account
router.delete('/account', [
  body('password').notEmpty().withMessage('Password is required to confirm account deletion')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const userId = req.user.id;
    const { password } = req.body;

    // Verify password
    const users = await query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, users[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    // Delete user's extractions first
    await query('DELETE FROM extracted_emails WHERE user_id = ?', [userId]);

    // Delete user account
    await query('DELETE FROM users WHERE id = ?', [userId]);

    logger.info(`User ${userId} account deleted`);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    logger.error('Delete user account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
