const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../utils/database');
const logger = require('../utils/logger');
const { extractJobInfo } = require('../utils/textProcessor');

const router = express.Router();

// Validation middleware
const validateExtraction = [
  body('text').notEmpty().withMessage('Text content is required'),
  body('userId').optional().isInt().withMessage('User ID must be a valid integer')
];

// Extract job information from text
router.post('/extract-text', validateExtraction, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { text, userId } = req.body;

    // Extract job information using the text processor
    const extractedData = await extractJobInfo(text);

    // Store extraction in database if userId is provided
    if (userId) {
      try {
        await query(
          'INSERT INTO extracted_emails (user_id, email, domain, extracted_data, created_at) VALUES (?, ?, ?, ?, NOW())',
          [
            userId, 
            extractedData.email || 'unknown@example.com',
            extractedData.domain || 'unknown',
            JSON.stringify(extractedData)
          ]
        );
        logger.info(`Extraction stored for user ${userId}`);
      } catch (dbError) {
        logger.warn(`Failed to store extraction in database: ${dbError.message}`);
        // Continue even if database storage fails
      }
    }

    logger.info('Text extraction completed successfully');

    res.json({
      message: 'Extraction completed successfully',
      data: extractedData
    });

  } catch (error) {
    logger.error('Text extraction error:', error);
    res.status(500).json({ error: 'Extraction failed', details: error.message });
  }
});

// Extract from file upload
router.post('/extract-file', async (req, res) => {
  try {
    // This would handle file uploads
    // For now, we'll return an error indicating file handling needs to be implemented
    res.status(501).json({ 
      error: 'File upload extraction not yet implemented',
      message: 'Please use text extraction endpoint for now'
    });

  } catch (error) {
    logger.error('File extraction error:', error);
    res.status(500).json({ error: 'File extraction failed' });
  }
});

// Get user's extraction history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

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
    logger.error('Get extraction history error:', error);
    res.status(500).json({ error: 'Failed to retrieve extraction history' });
  }
});

// Get extraction statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get basic stats
    const stats = await query(`
      SELECT 
        COUNT(*) as total_extractions,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        MIN(created_at) as first_extraction,
        MAX(created_at) as last_extraction
      FROM extracted_emails 
      WHERE user_id = ?
    `, [userId]);

    // Get domain distribution
    const domainStats = await query(`
      SELECT 
        domain,
        COUNT(*) as count
      FROM extracted_emails 
      WHERE user_id = ? 
      GROUP BY domain 
      ORDER BY count DESC 
      LIMIT 10
    `, [userId]);

    // Get confidence score distribution
    const confidenceStats = await query(`
      SELECT 
        CASE 
          WHEN JSON_EXTRACT(extracted_data, '$.confidence_score') >= 0.8 THEN 'High (≥80%)'
          WHEN JSON_EXTRACT(extracted_data, '$.confidence_score') >= 0.6 THEN 'Medium (60-79%)'
          ELSE 'Low (<60%)'
        END as confidence_level,
        COUNT(*) as count
      FROM extracted_emails 
      WHERE user_id = ? 
      GROUP BY confidence_level
    `, [userId]);

    res.json({
      basic_stats: stats[0],
      domain_distribution: domainStats,
      confidence_distribution: confidenceStats
    });

  } catch (error) {
    logger.error('Get extraction stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve extraction statistics' });
  }
});

// Delete extraction
router.delete('/:extractionId', async (req, res) => {
  try {
    const { extractionId } = req.params;
    const { userId } = req.body; // User ID for verification

    // Verify ownership
    const extraction = await query(
      'SELECT user_id FROM extracted_emails WHERE id = ?',
      [extractionId]
    );

    if (extraction.length === 0) {
      return res.status(404).json({ error: 'Extraction not found' });
    }

    if (extraction[0].user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete extraction
    await query('DELETE FROM extracted_emails WHERE id = ?', [extractionId]);

    logger.info(`Extraction ${extractionId} deleted by user ${userId}`);

    res.json({ message: 'Extraction deleted successfully' });

  } catch (error) {
    logger.error('Delete extraction error:', error);
    res.status(500).json({ error: 'Failed to delete extraction' });
  }
});

module.exports = router;
