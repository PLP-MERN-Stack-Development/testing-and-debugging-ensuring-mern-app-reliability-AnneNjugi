/**
 * Client-side error logging utility
 */

class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 50; // Keep last 50 errors
  }

  /**
   * Log error to console and store
   */
  logError(error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to errors array
    this.errors.push(errorLog);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console
    console.error('[Error Logger]', errorLog);

    // In production, you would send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(errorLog);
    }
  }

  /**
   * Log warning
   */
  logWarning(message, context = {}) {
    console.warn('[Warning]', {
      timestamp: new Date().toISOString(),
      message,
      context
    });
  }

  /**
   * Log info
   */
  logInfo(message, context = {}) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Info]', {
        timestamp: new Date().toISOString(),
        message,
        context
      });
    }
  }

  /**
   * Get all logged errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Clear error log
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Send error to logging service (placeholder)
   */
  sendToLoggingService(errorLog) {
    // In a real app, send to services like Sentry, LogRocket, etc.
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog)
    // });
  }

  /**
   * Log API errors
   */
  logApiError(error, endpoint, method = 'GET') {
    this.logError(error, {
      type: 'API_ERROR',
      endpoint,
      method,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
  }

  /**
   * Log component errors
   */
  logComponentError(error, componentName, componentStack) {
    this.logError(error, {
      type: 'COMPONENT_ERROR',
      componentName,
      componentStack
    });
  }
}

export default new ErrorLogger();
