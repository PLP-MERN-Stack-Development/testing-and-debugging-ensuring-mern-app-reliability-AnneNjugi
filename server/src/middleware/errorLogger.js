const logger = require('../utils/logger');

/**
 * Error logging middleware
 * Logs all errors before they are sent to the client
 */
const errorLogger = (err, req, res, next) => {
  // Log the error with context
  logger.error('Application error occurred', err, {
    method: req.method,
    path: req.path,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: req.userId || 'unauthenticated',
    ip: req.ip
  });

  // Pass to next error handler
  next(err);
};

/**
 * Unhandled rejection handler
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', new Error(reason), {
      promise: promise.toString()
    });
  });
};

/**
 * Uncaught exception handler
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    // Exit process after logging
    process.exit(1);
  });
};

module.exports = {
  errorLogger,
  handleUnhandledRejection,
  handleUncaughtException
};
