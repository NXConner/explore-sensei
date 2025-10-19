type AnalyticsEventPayload = Record<string, unknown> | undefined;

let isInitialized = false;
let writeFn: ((event: string, payload?: AnalyticsEventPayload) => void) | null = null;

export function initAnalytics(
  customWriter?: (event: string, payload?: AnalyticsEventPayload) => void,
) {
  if (isInitialized) return;
  // Default writer: send to console for now. Can be replaced by PostHog/Amplitude.
  writeFn =
    customWriter ??
    ((event, payload) => {
      if (import.meta.env?.DEV) {
        // eslint-disable-next-line no-console
        console.debug("analytics", { event, payload });
      }
    });
  isInitialized = true;
}

export function track(event: string, payload?: AnalyticsEventPayload) {
  if (!isInitialized) initAnalytics();
  writeFn?.(event, payload);
}

export function trackPageView(pathname: string) {
  track("page_view", { pathname });
}
