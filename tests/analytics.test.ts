import { initAnalytics, track, trackPageView } from "@/lib/analytics";

describe("analytics", () => {
  it("writes events via custom writer", () => {
    const events: Array<{ event: string; payload?: Record<string, unknown> }> = [];
    initAnalytics((event, payload) => {
      events.push({ event, payload });
    });
    track("custom_event", { a: 1 });
    trackPageView("/home");
    expect(events.map((e) => e.event)).toEqual(["custom_event", "page_view"]);
    expect(events[0].payload).toEqual({ a: 1 });
    expect(events[1].payload).toEqual({ pathname: "/home" });
  });
});
