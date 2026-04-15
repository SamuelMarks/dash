import { test, expect } from "@playwright/test";

test("xargs runs", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  await page.keyboard.type('echo "file1 file2" > files.txt\r', { delay: 50 });
  await page.waitForTimeout(500);

  await page.keyboard.type('xargs echo "pre" < files.txt\r', { delay: 50 });
  await page.waitForTimeout(1000);

  const text = await page.locator(".xterm-rows").innerText();
  expect(text).toContain("pre file1 file2");
});
