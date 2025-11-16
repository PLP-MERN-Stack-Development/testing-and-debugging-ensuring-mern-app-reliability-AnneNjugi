const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Debug routes (only available in development)
 */
if (process.env.NODE_ENV === 'development') {
  // Get server health
  router.get('/health', (req, res) => {
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
      },
      environment: process.env.NODE_ENV,
      nodeVersion: process.version
    });
  });

  // Trigger test error
  router.get('/error', (req, res, next) => {
    logger.warn('Test error endpoint called');
    const error = new Error('Test error for debugging');
    error.statusCode = 500;
    next(error);
  });

  // Get environment info
  router.get('/env', (req, res) => {
    res.json({
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET
    });
  });
}

module.exports = router;
