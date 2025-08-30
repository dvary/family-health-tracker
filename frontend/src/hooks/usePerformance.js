import { useEffect, useRef } from 'react';

// Custom hook for performance monitoring
export const usePerformance = (componentName) => {
  const renderStartTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current
      });
    }

    // Warn about slow renders
    if (renderTime > 16) { // 16ms = 60fps threshold
      console.warn(`[Performance Warning] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }

    renderStartTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current
  };
};

// Hook for measuring API call performance
export const useApiPerformance = () => {
  const measureApiCall = async (apiCall, endpoint) => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Performance] ${endpoint}:`, {
          duration: `${duration.toFixed(2)}ms`,
          status: 'success'
        });
      }

      // Warn about slow API calls
      if (duration > 1000) { // 1 second threshold
        console.warn(`[API Performance Warning] ${endpoint} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Performance] ${endpoint}:`, {
          duration: `${duration.toFixed(2)}ms`,
          status: 'error'
        });
      }

      throw error;
    }
  };

  return { measureApiCall };
};
