# Debugging Guide for MERN Testing Application

## Overview
This guide covers debugging techniques and tools implemented in the application.

## Server-Side Debugging

### 1. Logging System
The application uses a custom logger (`server/src/utils/logger.js`) with multiple log levels:

```javascript
const logger = require('./utils/logger');

// Log levels: ERROR, WARN, INFO, DEBUG
logger.error('Error message', error, { context: 'data' });
logger.warn('Warning message', { details: 'info' });
logger.info('Info message', { userId: '123' });
logger.debug('Debug message', { data: 'value' });
```

**Set log level via environment variable:**
```bash
LOG_LEVEL=DEBUG npm start
```

### 2. Request Logging
All HTTP requests are logged with:
- Method and path
- Duration
- Status code
- IP address

**View logs:**
```bash
# In development
npm run dev

# Logs appear in console with timestamps
[2024-01-15T10:30:45.123Z] [INFO] GET /api/todos - 200 (45ms)
```

### 3. Performance Monitoring
Track slow requests and memory usage:

```javascript
// Automatic logging of requests > 1000ms
// Memory monitoring every 5 minutes in production
```

**Check server health:**
```bash
curl http://localhost:5000/api/health
```

### 4. Error Handling
Global error handlers catch:
- Unhandled promise rejections
- Uncaught exceptions
- Validation errors
- Database errors

**Test error handling:**
```bash
# Development only
curl http://localhost:5000/api/debug/error
```

## Client-Side Debugging

### 1. Error Boundary
Catches React component errors:

```jsx
<ErrorBoundary componentName="TodoList">
  <TodoList />
</ErrorBoundary>
```

### 2. Debug Helper
Development-only debugging utilities:

```javascript
import debugHelper from './utils/debugHelper';

// Log component lifecycle
debugHelper.logLifecycle('TodoList', 'mounted', props);

// Log state changes
debugHelper.logStateChange('TodoList', oldState, newState);

// Log API calls
debugHelper.logApiCall('GET', '/api/todos');

// Performance markers
debugHelper.mark('render-start');
debugHelper.mark('render-end');
debugHelper.measure('render-time', 'render-start', 'render-end');
```

### 3. Custom Hooks for Debugging

**useDebug Hook:**
```jsx
import { useDebug } from './hooks/useDebug';

function MyComponent(props) {
  const { renderCount, logInteraction } = useDebug('MyComponent', props);
  
  const handleClick = () => {
    logInteraction('button-click', { buttonId: 'submit' });
  };
  
  return <div>Render count: {renderCount}</div>;
}
```

**usePerformance Hook:**
```jsx
import { usePerformance } from './hooks/useDebug';

function MyComponent() {
  usePerformance('MyComponent');
  // Automatically logs mount duration
}
```

### 4. Performance Monitoring
Track client-side performance:

```javascript
import performanceMonitor from './utils/performanceMonitor';

// Start monitoring
performanceMonitor.startMonitoring();

// Get page load metrics
performanceMonitor.getPageLoadMetrics();

// Get memory usage
performanceMonitor.getMemoryUsage();

// Measure API calls
await performanceMonitor.measureApiCall('/api/todos', () => getTodos());
```

### 5. Error Logging
Centralized error logging:

```javascript
import errorLogger from './utils/errorLogger';

// Log errors
errorLogger.logError(error, { context: 'TodoList' });

// Log warnings
errorLogger.logWarning('Slow operation detected');

// Get all errors
const errors = errorLogger.getErrors();
```

## Browser DevTools

### React DevTools
1. Install React DevTools extension
2. Inspect component props and state
3. Profile component renders
4. Track component updates

### Network Tab
- Monitor API calls
- Check request/response headers
- View payload data
- Measure request timing

### Console
- View all debug logs
- Check for errors and warnings
- Use console.table() for data
- Filter by log level

### Performance Tab
- Record performance profile
- Identify slow operations
- Check memory leaks
- Analyze frame rate

## Common Debugging Scenarios

### 1. API Call Failing
```javascript
// Check network tab for status code
// View error in console
// Check server logs for details
```

### 2. Component Not Rendering
```javascript
// Use React DevTools to inspect props
// Check useDebug hook for render count
// Verify state updates
```

### 3. Slow Performance
```javascript
// Check performance monitor logs
// Use React Profiler
// Review slow request warnings
// Check memory usage
```

### 4. Authentication Issues
```javascript
// Check localStorage for token
// Verify token in Network tab headers
// Check server auth logs
```

## Production Debugging

### Error Tracking
In production, errors are logged but not displayed to users.
Consider integrating services like:
- Sentry
- LogRocket
- Datadog

### Monitoring
- Set up health check endpoints
- Monitor memory usage
- Track slow requests
- Set up alerts for errors

## Environment Variables

```bash
# Development
NODE_ENV=development
LOG_LEVEL=DEBUG

# Production
NODE_ENV=production
LOG_LEVEL=ERROR
```

## Tips

1. **Use descriptive log messages** with context
2. **Log at appropriate levels** (don't spam DEBUG in production)
3. **Include timestamps** for correlation
4. **Add request IDs** for tracing
5. **Monitor performance** regularly
6. **Test error scenarios** during development
7. **Use source maps** for production debugging
8. **Keep logs structured** for easy parsing
