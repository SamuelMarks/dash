import { test, expect } from "@playwright/test";

test("whoami runs", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();
  await page.keyboard.type("whoami\r", { delay: 50 });
  await page.waitForTimeout(500);

  await expect(page.locator(".xterm-rows")).toContainText("web_user");

  await page.keyboard.type("whoami --help\r", { delay: 50 });
  await page.waitForTimeout(500);
  await expect(page.locator(".xterm-rows")).toContainText("Usage: whoami");

  await page.keyboard.type("whoami --version\r", { delay: 50 });
  await page.waitForTimeout(500);
  await expect(page.locator(".xterm-rows")).toContainText("whoami (dash-wasm)");
});
