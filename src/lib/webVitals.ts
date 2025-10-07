import { onCLS, onINP, onLCP, onTTFB, Metric } from "web-vitals";
import { track } from "@/lib/analytics";

function report(metric: Metric) {
  track("web_vital", {
    name: metric.name,
    id: metric.id,
    value: Math.round(metric.value),
    rating: (metric as any).rating,
  });
}

export function initWebVitals() {
  onCLS(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
}

