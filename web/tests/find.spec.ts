import { test, expect } from "@playwright/test";

test("find runs", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  await page.keyboard.type(
    "mkdir -p test_find/dir1 && touch test_find/file1.txt && touch test_find/dir1/file2.txt\r",
    { delay: 50 },
  );
  await page.waitForTimeout(500);

  await page.keyboard.type('find test_find -name "*.txt"\r', { delay: 50 });
  await page.waitForTimeout(1000);

  const text = await page.locator(".xterm-rows").innerText();
  expect(text).toContain("test_find/file1.txt");
  expect(text).toContain("test_find/dir1/file2.txt");
});
