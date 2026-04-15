import { test, expect } from "@playwright/test";

test("top and htop commands act as process viewers", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  // Focus terminal
  await page.locator(".xterm").click();

  // Run top
  await page.keyboard.type("top\r", { delay: 10 });
  await page.waitForTimeout(1000);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  expect(terminalText).toContain("total tasks: 3");
  expect(terminalText).toContain("PID USER");
  expect(terminalText).toContain("init");
  expect(terminalText).toContain("dash");
  expect(terminalText).toContain("top");

  // Quit top
  await page.keyboard.type("q");
  await page.waitForTimeout(500);

  // Run htop
  await page.keyboard.type("htop\r", { delay: 10 });
  await page.waitForTimeout(1000);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  expect(terminalText).toContain("total tasks: 3");
  expect(terminalText).toContain("htop");

  // Quit htop
  await page.keyboard.type("q");
  await page.waitForTimeout(500);

  // Verify we are back
  await page.keyboard.type("echo back\r", { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });
  expect(terminalText).toContain("back");
});
