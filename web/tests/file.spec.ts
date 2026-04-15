import { test, expect } from "@playwright/test";

test("file runs with arguments", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();
  await page.keyboard.type('echo "hello" > test.txt && file test.txt\r', {
    delay: 50,
  });
  await page.waitForTimeout(1000);

  await expect(page.locator(".xterm-rows")).toContainText(
    "test.txt: ASCII text",
  );
});
