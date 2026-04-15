import { test, expect } from "@playwright/test";

test("sh runs with arguments", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();
  await page.keyboard.type(
    'echo "echo hello from sh" > test.sh && sh test.sh\r',
    { delay: 50 },
  );
  await page.waitForTimeout(1000);

  await expect(page.locator(".xterm-rows")).toContainText("hello from sh");
});
