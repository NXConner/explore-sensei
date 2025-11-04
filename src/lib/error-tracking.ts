import { logger } from '@/lib/monitoring';

/**
 * Error tracking and reporting utilities
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  errorInfo?: any;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private maxErrors = 50;

  track(error: Error, errorInfo?: any, userId?: string): void {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId,
    };

    this.errors.push(report);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (import.meta.env?.DEV) {
      logger.error('Error tracked', report as any);
    }

    // In production, you might want to send to an error tracking service
    // this.sendToService(report);
  }

  getErrors(): ErrorReport[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorRate(timeWindowMs: number = 60000): number {
    const now = Date.now();
    const recentErrors = this.errors.filter(
      (e) => now - e.timestamp < timeWindowMs
    );
    return recentErrors.length / (timeWindowMs / 1000); // errors per second
  }
}

export const errorTracker = new ErrorTracker();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracker.track(event.error || new Error(event.message));
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.track(
      new Error(`Unhandled Promise Rejection: ${event.reason}`)
    );
  });
}
