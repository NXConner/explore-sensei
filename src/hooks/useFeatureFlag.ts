import { useState, useEffect } from 'react';
import { featureFlags } from '@/config/feature-flags';

/**
 * Hook for checking feature flags
 */

export const useFeatureFlag = (flagName: string): boolean => {
  const [isEnabled, setIsEnabled] = useState(() =>
    featureFlags.isEnabled(flagName as any)
  );

  useEffect(() => {
    // Listen for flag changes
    const checkFlag = () => {
      setIsEnabled(featureFlags.isEnabled(flagName as any));
    };

    // Check periodically in case flags change
    const interval = setInterval(checkFlag, 5000);

    return () => clearInterval(interval);
  }, [flagName]);

  return isEnabled;
};
