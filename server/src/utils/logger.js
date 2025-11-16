/**
 * Custom logger utility for debugging and monitoring
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] ${message} ${metaString}`;
  }

  error(message, error = null, meta = {}) {
    const errorDetails = error ? {
      message: error.message,
      stack: error.stack,
      ...meta
    } : meta;

    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, errorDetails));
  }

  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage(LOG_LEVELS.WARN, message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage(LOG_LEVELS.INFO, message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }

  shouldLog(level) {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  // Log HTTP request details
  logRequest(req) {
    this.info('Incoming request', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }

  // Log HTTP response details
  logResponse(req, res, duration) {
    this.info('Outgoing response', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  }

  // Log database operations
  logDatabase(operation, collection, details = {}) {
    this.debug('Database operation', {
      operation,
      collection,
      ...details
    });
  }

  // Log authentication events
  logAuth(event, userId = null, details = {}) {
    this.info('Authentication event', {
      event,
      userId,
      ...details
    });
  }
}

module.exports = new Logger();
