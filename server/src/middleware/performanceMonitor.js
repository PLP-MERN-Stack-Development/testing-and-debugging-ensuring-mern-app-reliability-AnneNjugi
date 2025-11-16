const logger = require('../utils/logger');

/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture timing
  res.end = function(...args) {
    const duration = Date.now() - start;

    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      });
    }

    // Log all requests in debug mode
    logger.debug('Request completed', {
      method: req.method,
      path: req.path,
      duration: `${duration}ms`,
      statusCode: res.statusCode
    });

    // Call original end function
    originalEnd.apply(res, args);
  };

  next();
};

/**
 * Memory usage monitor
 */
const logMemoryUsage = () => {
  const used = process.memoryUsage();
  logger.info('Memory usage', {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`
  });
};

/**
 * Start periodic memory monitoring
 */
const startMemoryMonitoring = (intervalMs = 60000) => {
  setInterval(logMemoryUsage, intervalMs);
};

module.exports = {
  performanceMonitor,
  logMemoryUsage,
  startMemoryMonitoring
};
