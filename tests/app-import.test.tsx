import { describe, it, expect } from "vitest";

// Ensure the app file and its dependencies compile
describe("App import", () => {
  it("imports without throwing", async () => {
    const mod = await import("@/App");
    expect(mod).toBeTruthy();
    expect(typeof mod.default).toBe("function");
  });
});
