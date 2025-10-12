import React from 'react';
import { cn } from '@/lib/utils';

// Animation variants
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideInVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 }
};

export const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};

export const bounceVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 }
};

// Animation components
interface AnimatedDivProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  once?: boolean;
}

export const AnimatedDiv: React.FC<AnimatedDivProps> = ({
  children,
  className,
  animation = 'fade',
  delay = 0,
  duration = 300,
  direction = 'up',
  once = true
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [once]);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all ease-out';
    const durationClass = `duration-${duration}`;
    
    if (!isVisible) {
      switch (animation) {
        case 'fade':
          return `${baseClasses} ${durationClass} opacity-0`;
        case 'slide':
          return `${baseClasses} ${durationClass} opacity-0 ${
            direction === 'up' ? 'translate-y-4' :
            direction === 'down' ? '-translate-y-4' :
            direction === 'left' ? 'translate-x-4' : '-translate-x-4'
          }`;
        case 'scale':
          return `${baseClasses} ${durationClass} opacity-0 scale-95`;
        case 'bounce':
          return `${baseClasses} ${durationClass} opacity-0 -translate-y-2`;
        default:
          return `${baseClasses} ${durationClass} opacity-0`;
      }
    }

    return `${baseClasses} ${durationClass} opacity-100 ${
      animation === 'slide' ? (
        direction === 'up' ? 'translate-y-0' :
        direction === 'down' ? 'translate-y-0' :
        direction === 'left' ? 'translate-x-0' : 'translate-x-0'
      ) : animation === 'scale' ? 'scale-100' :
      animation === 'bounce' ? 'translate-y-0' : ''
    }`;
  };

  return (
    <div
      ref={ref}
      className={cn(
        getAnimationClasses(),
        className
      )}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// Stagger animation for lists
interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 100,
  animation = 'fade',
  direction = 'up'
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedDiv
          key={index}
          animation={animation}
          direction={direction}
          delay={index * staggerDelay}
        >
          {child}
        </AnimatedDiv>
      ))}
    </div>
  );
};

// Hover animations
interface HoverAnimationProps {
  children: React.ReactNode;
  className?: string;
  hoverClass?: string;
  scale?: boolean;
  lift?: boolean;
  glow?: boolean;
}

export const HoverAnimation: React.FC<HoverAnimationProps> = ({
  children,
  className,
  hoverClass,
  scale = true,
  lift = false,
  glow = false
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        isHovered && hoverClass,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 
          `${scale ? 'scale(1.05)' : ''} ${lift ? 'translateY(-2px)' : ''}` : 
          'scale(1) translateY(0)',
        boxShadow: isHovered && glow ? '0 0 20px rgba(59, 130, 246, 0.3)' : undefined
      }}
    >
      {children}
    </div>
  );
};

// Loading animations
interface PulseAnimationProps {
  children: React.ReactNode;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

export const PulseAnimation: React.FC<PulseAnimationProps> = ({
  children,
  className,
  speed = 'normal'
}) => {
  const speedClasses = {
    slow: 'animate-pulse',
    normal: 'animate-pulse',
    fast: 'animate-pulse'
  };

  return (
    <div className={cn(speedClasses[speed], className)}>
      {children}
    </div>
  );
};

// Shake animation for errors
interface ShakeAnimationProps {
  children: React.ReactNode;
  className?: string;
  trigger?: boolean;
}

export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  children,
  className,
  trigger = false
}) => {
  const [isShaking, setIsShaking] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div
      className={cn(
        'transition-transform duration-150',
        isShaking && 'animate-bounce',
        className
      )}
    >
      {children}
    </div>
  );
};

// Progress animation
interface ProgressAnimationProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export const ProgressAnimation: React.FC<ProgressAnimationProps> = ({
  progress,
  className,
  showPercentage = true,
  color = 'primary'
}) => {
  const [displayProgress, setDisplayProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            colorClasses[color]
          )}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-muted-foreground mt-1 text-center">
          {Math.round(displayProgress)}%
        </div>
      )}
    </div>
  );
};

// Floating animation
interface FloatingAnimationProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const FloatingAnimation: React.FC<FloatingAnimationProps> = ({
  children,
  className,
  intensity = 'medium'
}) => {
  const intensityClasses = {
    low: 'animate-pulse',
    medium: 'animate-bounce',
    high: 'animate-pulse'
  };

  return (
    <div className={cn(intensityClasses[intensity], className)}>
      {children}
    </div>
  );
};

// Typewriter animation
interface TypewriterAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterAnimation: React.FC<TypewriterAnimationProps> = ({
  text,
  speed = 50,
  className,
  onComplete
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};
