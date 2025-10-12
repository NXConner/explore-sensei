import { describe, it, expect } from "vitest";
import { getLevelForXp, LEVELS } from "@/config/gamificationRules";

describe("gamification rules", () => {
  it("LEVELS are ascending by minXp", () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].minXp).toBeGreaterThanOrEqual(LEVELS[i-1].minXp);
    }
  });

  it("level mapping works at boundaries", () => {
    expect(getLevelForXp(0)).toBeGreaterThanOrEqual(1);
    expect(getLevelForXp(99)).toBe(1);
    expect(getLevelForXp(100)).toBe(2);
    expect(getLevelForXp(249)).toBe(2);
    expect(getLevelForXp(250)).toBe(3);
  });
});
