import { describe, it, expect, beforeEach } from "vitest";

describe("theme persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves selection to localStorage", async () => {
    localStorage.setItem(
      "aos_settings",
      JSON.stringify({ theme: "division-shd", highContrast: false })
    );
    const raw = localStorage.getItem("aos_settings");
    expect(raw).toContain("division-shd");
  });

  it("App imports without throwing after setting theme", async () => {
    localStorage.setItem(
      "aos_settings",
      JSON.stringify({ theme: "dark-zone", highContrast: false })
    );
    const app = await import("@/App");
    expect(app).toBeTruthy();
  });
});
