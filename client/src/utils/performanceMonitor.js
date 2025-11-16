/**
 * Client-side performance monitoring utility
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
  }

  /**
   * Measure component render time
   */
  measureRender(componentName, callback) {
    const start = performance.now();
    const result = callback();
    const duration = performance.now() - start;

    if (duration > 16) { // Slower than 60fps
      console.warn(`[Performance] Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }

    this.logMetric('render', componentName, duration);
    return result;
  }

  /**
   * Measure API call duration
   */
  async measureApiCall(endpoint, apiCall) {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      
      this.logMetric('api', endpoint, duration);
      
      if (duration > 1000) {
        console.warn(`[Performance] Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.logMetric('api_error', endpoint, duration);
      throw error;
    }
  }

  /**
   * Log performance metric
   */
  logMetric(type, name, duration) {
    const metric = {
      type,
      name,
      duration: duration.toFixed(2),
      timestamp: new Date().toISOString()
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${type}: ${name} - ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get page load metrics
   */
  getPageLoadMetrics() {
    if (!window.performance || !window.performance.timing) {
      return null;
    }

    const timing = window.performance.timing;
    const metrics = {
      pageLoadTime: timing.loadEventEnd - timing.navigationStart,
      domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
      dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
      tcpTime: timing.connectEnd - timing.connectStart,
      requestTime: timing.responseEnd - timing.requestStart,
      renderTime: timing.domComplete - timing.domLoading
    };

    console.log('[Performance] Page Load Metrics:', metrics);
    return metrics;
  }

  /**
   * Monitor memory usage (if available)
   */
  getMemoryUsage() {
    if (performance.memory) {
      const memory = {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
      };

      console.log('[Performance] Memory Usage:', memory);
      return memory;
    }
    return null;
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    // Log page load metrics when available
    if (document.readyState === 'complete') {
      this.getPageLoadMetrics();
    } else {
      window.addEventListener('load', () => {
        this.getPageLoadMetrics();
      });
    }

    // Monitor memory every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        this.getMemoryUsage();
      }, 30000);
    }
  }
}

export default new PerformanceMonitor();
