import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  default: 'text-muted-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  variant = 'default'
}) => {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizeClasses[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <span className={cn('text-sm', variantClasses[variant])}>
          {text}
        </span>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = 'Loading...',
  children,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 1,
  width = '100%',
  height = '1rem'
}) => {
  if (lines === 1) {
    return (
      <div
        className={cn(
          'animate-pulse bg-muted rounded',
          className
        )}
        style={{ width, height }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse bg-muted rounded',
            className
          )}
          style={{ 
            width: i === lines - 1 ? '75%' : width, 
            height 
          }}
        />
      ))}
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  className,
  showAvatar = false,
  showActions = false
}) => {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center gap-3">
          <LoadingSkeleton className="rounded-full" width="2.5rem" height="2.5rem" />
          <div className="space-y-2 flex-1">
            <LoadingSkeleton width="60%" height="1rem" />
            <LoadingSkeleton width="40%" height="0.75rem" />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <LoadingSkeleton width="80%" height="1.25rem" />
        <LoadingSkeleton width="100%" height="1rem" />
        <LoadingSkeleton width="90%" height="1rem" />
      </div>
      
      {showActions && (
        <div className="flex gap-2">
          <LoadingSkeleton width="4rem" height="2rem" />
          <LoadingSkeleton width="4rem" height="2rem" />
        </div>
      )}
    </div>
  );
};
