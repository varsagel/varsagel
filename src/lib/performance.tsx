import { createModuleLogger } from '@/lib/logger';
import React from 'react';

const logger = createModuleLogger('performance');

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  measure(name: string, fn: () => Promise<any>, metadata?: Record<string, any>): Promise<any>;
  measure(name: string, fn: () => any, metadata?: Record<string, any>): any;
  measure(name: string, fn: any, metadata?: Record<string, any>): any {
    const start = performance.now();
    const timestamp = Date.now();

    const measureAndLog = async () => {
      try {
        const result = await fn();
        const duration = performance.now() - start;
        
        this.recordMetric({
          name,
          duration,
          timestamp,
          metadata,
        });

        // Log slow operations
        if (duration > 1000) {
          logger.warn(`Slow operation detected: ${name}`, {
            duration: Math.round(duration),
            metadata,
          });
        }

        return result;
      } catch (error) {
        const duration = performance.now() - start;
        
        this.recordMetric({
          name,
          duration,
          timestamp,
          metadata: { ...metadata, error: true },
        });

        logger.error(`Operation failed: ${name}`, {
          duration: Math.round(duration),
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata,
        });

        throw error;
      }
    };

    // Check if function is async
    if (fn.constructor.name === 'AsyncFunction' || fn instanceof Promise) {
      return measureAndLog();
    } else {
      try {
        const result = fn();
        if (result instanceof Promise) {
          return measureAndLog();
        } else {
          const duration = performance.now() - start;
          
          this.recordMetric({
            name,
            duration,
            timestamp,
            metadata,
          });

          return result;
        }
      } catch (error) {
        const duration = performance.now() - start;
        
        this.recordMetric({
          name,
          duration,
          timestamp,
          metadata: { ...metadata, error: true },
        });

        logger.error(`Operation failed: ${name}`, {
          duration: Math.round(duration),
          error: error instanceof Error ? error.message : 'Unknown error',
          metadata,
        });

        throw error;
      }
    }
  }

  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(name?: string): PerformanceMetrics[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getSlowestOperations(limit: number = 10): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Helper functions for common performance monitoring scenarios
export function measureDatabaseQuery<T>(
  queryName: string,
  query: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measure(`db:${queryName}`, query, {
    type: 'database',
    ...metadata,
  });
}

export function measureApiCall<T>(
  apiName: string,
  call: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.measure(`api:${apiName}`, call, {
    type: 'api',
    ...metadata,
  });
}

export function measureComponentRender<T>(
  componentName: string,
  renderFn: () => T,
  metadata?: Record<string, any>
): T {
  return performanceMonitor.measure(`render:${componentName}`, renderFn, {
    type: 'component',
    ...metadata,
  });
}

// Performance monitoring for React components
export function withPerformanceMonitoring<P extends object>(
  BaseComponent: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    return measureComponentRender(
      componentName,
      () => React.createElement(BaseComponent as React.FC<any>, { ...props, ref }),
      { props: Object.keys(props) }
    );
  });
  WrappedComponent.displayName = `WithPerformanceMonitoring(${componentName})`;
  return WrappedComponent;
}

export default performanceMonitor;