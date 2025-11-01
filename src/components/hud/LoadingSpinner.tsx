import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading module...", 
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-16 h-16 border-4",
    lg: "w-24 h-24 border-4"
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-background/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="tactical-panel p-8 flex flex-col items-center gap-4 animate-bounce-in">
        <div 
          className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
          role="status"
          aria-label="Loading"
        />
        <p className="mt-4 text-primary animate-pulse text-sm font-semibold tracking-wide">
          {message}
        </p>
      </div>
    </div>
  );
};
