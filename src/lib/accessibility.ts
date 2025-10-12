import { useEffect, useRef } from 'react';

/**
 * Accessibility utilities for enhanced user experience
 */

// ARIA live region for announcements
export const createLiveRegion = (): HTMLElement => {
  let liveRegion = document.getElementById('aria-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  return liveRegion;
};

// Announce messages to screen readers
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const liveRegion = createLiveRegion();
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.textContent = message;
  
  // Clear after announcement
  setTimeout(() => {
    liveRegion.textContent = '';
  }, 1000);
};

// Focus management utilities
export const focusElement = (element: HTMLElement | null) => {
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

export const trapFocus = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

// Keyboard navigation utilities
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      onEnter?.();
      event.preventDefault();
      break;
    case 'Escape':
      onEscape?.();
      event.preventDefault();
      break;
    case 'ArrowUp':
      onArrowUp?.();
      event.preventDefault();
      break;
    case 'ArrowDown':
      onArrowDown?.();
      event.preventDefault();
      break;
    case 'ArrowLeft':
      onArrowLeft?.();
      event.preventDefault();
      break;
    case 'ArrowRight':
      onArrowRight?.();
      event.preventDefault();
      break;
  }
};

// Screen reader utilities
export const getScreenReaderText = (element: HTMLElement): string => {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const ariaDescribedBy = element.getAttribute('aria-describedby');
  
  let text = '';
  
  if (ariaLabel) {
    text += ariaLabel;
  }
  
  if (ariaLabelledBy) {
    const labelledByElement = document.getElementById(ariaLabelledBy);
    if (labelledByElement) {
      text += ' ' + labelledByElement.textContent;
    }
  }
  
  if (ariaDescribedBy) {
    const describedByElement = document.getElementById(ariaDescribedBy);
    if (describedByElement) {
      text += ' ' + describedByElement.textContent;
    }
  }
  
  return text.trim();
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// High contrast mode detection
export const isHighContrastMode = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Focus visible detection
export const supportsFocusVisible = (): boolean => {
  return CSS.supports('selector(:focus-visible)');
};

// Custom hook for focus management
export const useFocusManagement = () => {
  const focusHistory = useRef<HTMLElement[]>([]);
  
  const saveFocus = (element: HTMLElement) => {
    focusHistory.current.push(element);
  };
  
  const restoreFocus = () => {
    const lastFocused = focusHistory.current.pop();
    if (lastFocused) {
      focusElement(lastFocused);
    }
  };
  
  const clearFocusHistory = () => {
    focusHistory.current = [];
  };
  
  return { saveFocus, restoreFocus, clearFocusHistory };
};

// Custom hook for keyboard navigation
export const useKeyboardNavigation = (
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyboardNavigation(
        event,
        onEnter,
        onEscape,
        onArrowUp,
        onArrowDown,
        onArrowLeft,
        onArrowRight
      );
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]);
};

// Custom hook for screen reader announcements
export const useScreenReaderAnnouncements = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  };
  
  return { announce };
};

// Accessibility testing utilities
export const runAccessibilityAudit = async (): Promise<{
  violations: any[];
  passes: any[];
  incomplete: any[];
}> => {
  // This would integrate with axe-core in a real implementation
  return {
    violations: [],
    passes: [],
    incomplete: []
  };
};

// ARIA attributes helpers
export const getAriaAttributes = (props: {
  label?: string;
  description?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  hidden?: boolean;
}) => {
  const attributes: Record<string, string | boolean> = {};
  
  if (props.label) attributes['aria-label'] = props.label;
  if (props.description) attributes['aria-describedby'] = props.description;
  if (props.expanded !== undefined) attributes['aria-expanded'] = props.expanded;
  if (props.selected !== undefined) attributes['aria-selected'] = props.selected;
  if (props.disabled) attributes['aria-disabled'] = props.disabled;
  if (props.required) attributes['aria-required'] = props.required;
  if (props.invalid) attributes['aria-invalid'] = props.invalid;
  if (props.hidden) attributes['aria-hidden'] = props.hidden;
  
  return attributes;
};

// Skip links for keyboard navigation
export const createSkipLink = (targetId: string, text: string = 'Skip to main content'): HTMLElement => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md';
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      focusElement(target);
    }
  });
  
  return skipLink;
};

// Focus indicator styles
export const getFocusStyles = () => ({
  outline: '2px solid #0066cc',
  outlineOffset: '2px',
  borderRadius: '2px'
});

// Screen reader only text
export const srOnly = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';
