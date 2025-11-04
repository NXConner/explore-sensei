/**
 * Feature flags configuration
 */

interface FeatureFlags {
  gamification: boolean;
  realTimeTracking: boolean;
  advancedAnalytics: boolean;
  aiAssistant: boolean;
  weatherRadar: boolean;
  darkZones: boolean;
  offlineMode: boolean;
  experimentalFeatures: boolean;
}

const defaultFlags: FeatureFlags = {
  gamification: true,
  realTimeTracking: true,
  advancedAnalytics: true,
  aiAssistant: true,
  weatherRadar: true,
  darkZones: true,
  offlineMode: false,
  experimentalFeatures: false,
};

class FeatureFlagManager {
  private flags: FeatureFlags;

  constructor() {
    this.flags = this.loadFlags();
  }

  private loadFlags(): FeatureFlags {
    try {
      const stored = localStorage.getItem('feature_flags');
      return stored ? { ...defaultFlags, ...JSON.parse(stored) } : defaultFlags;
    } catch {
      return defaultFlags;
    }
  }

  private saveFlags(): void {
    try {
      localStorage.setItem('feature_flags', JSON.stringify(this.flags));
    } catch (error) {
      console.error('Failed to save feature flags:', error);
    }
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] ?? false;
  }

  enable(flag: keyof FeatureFlags): void {
    this.flags[flag] = true;
    this.saveFlags();
  }

  disable(flag: keyof FeatureFlags): void {
    this.flags[flag] = false;
    this.saveFlags();
  }

  toggle(flag: keyof FeatureFlags): void {
    this.flags[flag] = !this.flags[flag];
    this.saveFlags();
  }

  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  reset(): void {
    this.flags = { ...defaultFlags };
    this.saveFlags();
  }
}

export const featureFlags = new FeatureFlagManager();
