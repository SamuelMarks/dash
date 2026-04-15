import { test, expect } from "@playwright/test";

test("tar runs with arguments", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();
  await page.keyboard.type(
    'echo "hello tar" > test.txt && tar -cf test.tar test.txt\r',
    { delay: 50 },
  );
  await page.waitForTimeout(1000);

  await page.keyboard.type(
    "rm test.txt && tar -xf test.tar && cat test.txt\r",
    { delay: 50 },
  );
  await page.waitForTimeout(1000);

  await expect(page.locator(".xterm-rows")).toContainText("hello tar");
});
