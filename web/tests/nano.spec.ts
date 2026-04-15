import { test, expect } from "@playwright/test";

test("nano command acts as an editor", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  // Focus terminal
  await page.locator(".xterm").click();

  // Open nano
  await page.keyboard.type("nano /tmp/hello.txt\r", { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  // It should show the header
  expect(terminalText).toContain("GNU nano-ish");
  expect(terminalText).toContain("/tmp/hello.txt");

  // Type some text
  await page.keyboard.type("Hello from Playwright!");
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });
  expect(terminalText).toContain("Hello from Playwright!");

  // Save (Ctrl+S)
  await page.keyboard.press("Control+s");
  await page.waitForTimeout(200);

  // Exit (Ctrl+X)
  await page.keyboard.press("Control+x");
  await page.waitForTimeout(500);

  // Verify file was written
  await page.keyboard.type("cat /tmp/hello.txt\r", { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });
  expect(terminalText).toContain("Hello from Playwright!");
});
