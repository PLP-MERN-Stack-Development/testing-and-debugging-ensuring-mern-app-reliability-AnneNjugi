import { useEffect, useRef } from 'react';
import debugHelper from '../utils/debugHelper';

/**
 * Custom hook for debugging component lifecycle and renders
 */
export const useDebug = (componentName, props = {}) => {
  const renderCount = useRef(0);
  const prevProps = useRef(props);

  useEffect(() => {
    renderCount.current += 1;
    debugHelper.logRenderCount(componentName);
    
    // Log props changes
    if (JSON.stringify(prevProps.current) !== JSON.stringify(props)) {
      debugHelper.logStateChange(componentName, prevProps.current, props);
      prevProps.current = props;
    }
  });

  useEffect(() => {
    debugHelper.logLifecycle(componentName, 'mounted', props);
    
    return () => {
      debugHelper.logLifecycle(componentName, 'unmounted');
    };
  }, []);

  return {
    renderCount: renderCount.current,
    logInteraction: (action, details) => {
      debugHelper.logInteraction(action, componentName, details);
    }
  };
};

/**
 * Hook for performance monitoring
 */
export const usePerformance = (componentName) => {
  useEffect(() => {
    debugHelper.mark(`${componentName}-mount-start`);
    
    return () => {
      debugHelper.mark(`${componentName}-mount-end`);
      debugHelper.measure(
        `${componentName}-mount-duration`,
        `${componentName}-mount-start`,
        `${componentName}-mount-end`
      );
    };
  }, [componentName]);
};
