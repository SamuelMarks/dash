import { test, expect } from "@playwright/test";

test("su runs commands", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  await page.keyboard.type('su -c "echo hello from su"\r', { delay: 50 });
  await page.waitForTimeout(1000);
  await expect(page.locator(".xterm-rows")).toContainText("hello from su");

  // test --help
  await page.keyboard.type("su --help\r", { delay: 50 });
  await page.waitForTimeout(1000);
  await expect(page.locator(".xterm-rows")).toContainText("Usage: su");
});
