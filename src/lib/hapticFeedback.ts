/**
 * Haptic feedback utility for mobile devices
 * Provides vibration feedback for radar/pulse interactions
 */

export type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "error";

interface HapticPattern {
  pattern: number | number[];
  intensity?: number;
}

const hapticPatterns: Record<HapticType, HapticPattern> = {
  light: { pattern: 10 },
  medium: { pattern: 20 },
  heavy: { pattern: 30 },
  success: { pattern: [10, 50, 10] },
  warning: { pattern: [20, 50, 20] },
  error: { pattern: [30, 50, 30, 50, 30] },
};

/**
 * Trigger haptic feedback if available
 * @param type - Type of haptic feedback
 * @param enabled - Whether haptic feedback is enabled (default: true)
 */
export function triggerHaptic(type: HapticType = "medium", enabled: boolean = true): void {
  if (!enabled) return;

  // Check if Vibration API is available
  if (!("vibrate" in navigator)) {
    return;
  }

  try {
    const pattern = hapticPatterns[type];
    if (Array.isArray(pattern.pattern)) {
      navigator.vibrate(pattern.pattern);
    } else {
      navigator.vibrate(pattern.pattern);
    }
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
    console.debug("Haptic feedback not available:", error);
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return "vibrate" in navigator;
}

/**
 * Trigger haptic feedback for radar sweep (light pulse)
 */
export function triggerRadarHaptic(enabled: boolean = true): void {
  triggerHaptic("light", enabled);
}

/**
 * Trigger haptic feedback for pulse scan (medium pulse)
 */
export function triggerPulseHaptic(enabled: boolean = true): void {
  triggerHaptic("medium", enabled);
}

/**
 * Trigger haptic feedback for POI highlight (success pattern)
 */
export function triggerPOIHaptic(enabled: boolean = true): void {
  triggerHaptic("success", enabled);
}

