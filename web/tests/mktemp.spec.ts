import { test, expect } from "@playwright/test";

test("mktemp creates a temporary file and directory", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  // Focus terminal
  await page.locator(".xterm").click();

  // mktemp without args
  await page.keyboard.type("mktemp\r", { delay: 10 });
  await page.waitForTimeout(500);

  // mktemp with -d
  await page.keyboard.type("mktemp -d\r", { delay: 10 });
  await page.waitForTimeout(500);

  // mktemp with custom template
  await page.keyboard.type("mktemp mytemp.XXXXXX\r", { delay: 10 });
  await page.waitForTimeout(500);

  // Check results
  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  expect(terminalText).toMatch(/\/tmp\/tmp\.[a-zA-Z0-9]{6}/); // First mktemp
  expect(terminalText).toMatch(/mytemp\.[a-zA-Z0-9]{6}/); // Custom template
});
