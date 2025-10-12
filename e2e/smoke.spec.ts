import { test, expect } from "@playwright/test";

test("loads index and map root shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("root-shell")).toBeVisible();
});
