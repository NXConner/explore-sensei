import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logger } from '@/lib/monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught error', { 
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (resetKey, index) => resetKey !== prevProps.resetKeys?.[index]
        );
        
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isPageLevel = this.props.level === 'page';
      const containerClass = isPageLevel
        ? "flex items-center justify-center min-h-screen p-4 bg-background"
        : "flex items-center justify-center p-4 bg-background rounded-lg border border-destructive/50";

      return (
        <div 
          className={containerClass}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="mb-4 p-2 bg-destructive/10 rounded text-xs font-mono overflow-auto max-h-40">
                  <summary className="cursor-pointer mb-2 font-sans">Error Details</summary>
                  <pre className="whitespace-pre-wrap break-words">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={this.resetErrorBoundary} 
                  variant="outline" 
                  size="sm"
                  aria-label="Try again"
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Try again
                </Button>
                {isPageLevel && (
                  <>
                    <Button 
                      onClick={this.handleGoHome} 
                      variant="outline" 
                      size="sm"
                      aria-label="Go to home page"
                    >
                      <Home className="h-4 w-4 mr-2" aria-hidden="true" />
                      Go Home
                    </Button>
                    <Button 
                      onClick={this.handleReload} 
                      variant="outline" 
                      size="sm"
                      aria-label="Reload page"
                    >
                      Reload Page
                    </Button>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
