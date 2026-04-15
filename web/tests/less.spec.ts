import { test, expect } from "@playwright/test";

test("less command acts as a pager", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  // Focus the terminal
  await page.locator(".xterm").click();

  // Set up a large test file
  await page.keyboard.type(
    'i=1; while [ $i -le 50 ]; do echo "Line $i"; i=$((i+1)); done > /tmp/large.txt\r',
    { delay: 10 },
  );
  await page.waitForTimeout(2000);

  // Clear screen to make assertion easier
  await page.keyboard.type("\x0c", { delay: 10 }); // Ctrl+L for clear
  await page.waitForTimeout(500);

  // Run less
  await page.keyboard.type("less /tmp/large.txt\r", { delay: 10 });
  await page.waitForTimeout(1000);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  // Should show the first lines
  expect(terminalText).toContain("Line 1");
  expect(terminalText).toContain("Line 20");
  // Should NOT show the last lines yet
  expect(terminalText).not.toContain("Line 40");

  // The status line should be visible
  expect(terminalText).toContain("press q to quit");

  // Press space to scroll down
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("Space");
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  // Now it should show later lines
  expect(terminalText).toContain("Line 40");

  // Press 'q' to quit
  await page.keyboard.type("q");
  await page.waitForTimeout(500);

  // Run ls to confirm we are back at the prompt
  await page.keyboard.type("ls /tmp\r", { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });
  expect(terminalText).toContain("large.txt");
});
