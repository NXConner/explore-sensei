import { useEffect, useCallback } from 'react';

/**
 * Hook for keyboard navigation
 */

type KeyMap = {
  [key: string]: (event: KeyboardEvent) => void;
};

export const useKeyboardNavigation = (keyMap: KeyMap, enabled: boolean = true) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      const handler = keyMap[event.key] || keyMap[`${event.ctrlKey ? 'Ctrl+' : ''}${event.key}`];
      
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    },
    [keyMap, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export const useFocusTrap = (ref: React.RefObject<HTMLElement>, active: boolean = true) => {
  useEffect(() => {
    if (!active || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, active]);
};
