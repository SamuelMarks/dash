import { test, expect } from "@playwright/test";

test("date runs with arguments", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();
  await page.keyboard.type("date -u +%Y-%m-%d\r", { delay: 50 });
  await page.waitForTimeout(1000);

  const year = new Date().getUTCFullYear().toString();
  await expect(page.locator(".xterm-rows")).toContainText(year);
});
