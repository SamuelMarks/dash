import { test, expect } from "@playwright/test";

test("df runs with arguments", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();
  await page.keyboard.type("df -h\r", { delay: 50 });
  await page.waitForTimeout(1000);

  await expect(page.locator(".xterm-rows")).toContainText("Filesystem");
  await expect(page.locator(".xterm-rows")).toContainText("Mounted on");
  await expect(page.locator(".xterm-rows")).toContainText("/");

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  // Verify human readable sizes are shown
  expect(terminalText).toMatch(/2\.0G/);
  expect(terminalText).toMatch(/10\.0M/);
});
