import { test, expect } from "@playwright/test";

// Basic E2E to ensure toggle hides leaderboard/achievements

test("gamification toggle hides panels", async ({ page }) => {
  await page.goto("/");
  // Open profile to see panels
  await page.goto("/profile");

  // Initially panels may be visible (local state varies). Ensure enable then disable via TopBar
  // Click GAMIFY button to ensure ON
  const gamifyBtn = page.getByRole('button', { name: /GAMIFY/i });
  await gamifyBtn.click(); // toggle
  // Click again to turn OFF
  await gamifyBtn.click();

  // Panels should be hidden
  await expect(page.getByText(/Achievements/i)).toHaveCount(0);
  await expect(page.getByText(/Leaderboard/i)).toHaveCount(0);
});
