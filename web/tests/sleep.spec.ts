import { test, expect } from "@playwright/test";

test("sleep runs", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  let startTime = Date.now();
  await page.keyboard.type('sleep 1 && echo D""ONE_SLEEP\r', { delay: 50 });
  await page.waitForTimeout(500);

  await expect(page.locator(".xterm-rows")).not.toContainText("DONE_SLEEP");

  await page.waitForTimeout(1000);
  await expect(page.locator(".xterm-rows")).toContainText("DONE_SLEEP");

  let elapsed = Date.now() - startTime;
  expect(elapsed).toBeGreaterThanOrEqual(1000);
});
