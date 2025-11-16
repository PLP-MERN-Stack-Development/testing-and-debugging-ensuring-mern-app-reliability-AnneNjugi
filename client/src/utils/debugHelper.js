/**
 * Debug helper utilities for development
 */

class DebugHelper {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Log component lifecycle
   */
  logLifecycle(componentName, phase, props = {}) {
    if (!this.enabled) return;

    console.log(`[Lifecycle] ${componentName} - ${phase}`, {
      timestamp: new Date().toISOString(),
      props
    });
  }

  /**
   * Log state changes
   */
  logStateChange(componentName, oldState, newState) {
    if (!this.enabled) return;

    console.log(`[State Change] ${componentName}`, {
      old: oldState,
      new: newState,
      diff: this.getStateDiff(oldState, newState)
    });
  }

  /**
   * Get difference between two states
   */
  getStateDiff(oldState, newState) {
    const diff = {};
    
    Object.keys(newState).forEach(key => {
      if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
        diff[key] = {
          old: oldState[key],
          new: newState[key]
        };
      }
    });

    return diff;
  }

  /**
   * Log API calls
   */
  logApiCall(method, endpoint, data = null) {
    if (!this.enabled) return;

    console.log(`[API Call] ${method} ${endpoint}`, {
      timestamp: new Date().toISOString(),
      data
    });
  }

  /**
   * Log API response
   */
  logApiResponse(endpoint, response, duration) {
    if (!this.enabled) return;

    console.log(`[API Response] ${endpoint}`, {
      status: response.status,
      duration: `${duration}ms`,
      data: response.data
    });
  }

  /**
   * Log user interactions
   */
  logInteraction(action, target, details = {}) {
    if (!this.enabled) return;

    console.log(`[User Interaction] ${action}`, {
      target,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Create a performance marker
   */
  mark(label) {
    if (!this.enabled || !window.performance) return;

    performance.mark(label);
  }

  /**
   * Measure time between two markers
   */
  measure(name, startMark, endMark) {
    if (!this.enabled || !window.performance) return;

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }
  }

  /**
   * Log render count
   */
  logRenderCount(componentName) {
    if (!this.enabled) return;

    if (!window.__renderCounts) {
      window.__renderCounts = {};
    }

    window.__renderCounts[componentName] = (window.__renderCounts[componentName] || 0) + 1;
    
    console.log(`[Render Count] ${componentName}: ${window.__renderCounts[componentName]}`);
  }

  /**
   * Get all render counts
   */
  getRenderCounts() {
    return window.__renderCounts || {};
  }

  /**
   * Enable debug mode
   */
  enable() {
    this.enabled = true;
    console.log('[Debug] Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disable() {
    this.enabled = false;
    console.log('[Debug] Debug mode disabled');
  }
}

export default new DebugHelper();
