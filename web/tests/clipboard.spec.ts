import { test, expect } from "@playwright/test";

test.describe("Clipboard commands", () => {
  // We need to grant clipboard permissions for Playwright
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("pbcopy and pbpaste commands work", async ({ page, context }) => {
    // Grant clipboard permissions to the context
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto("/");

    await expect(page.locator(".xterm")).toBeVisible();
    await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
    await page.waitForTimeout(500);

    // Focus the terminal
    await page.locator(".xterm").click();

    // Type a command to echo into pbcopy
    await page.keyboard.type('echo "hello clipboard" | pbcopy\r', {
      delay: 50,
    });

    // Wait for the prompt to return by waiting for a second prompt
    await page.waitForTimeout(1000);

    // Now type pbpaste to see if it outputs
    await page.keyboard.type("pbpaste\r", { delay: 50 });

    // Wait a moment for output
    await page.waitForTimeout(1000);

    // Check if the terminal contains the output
    await expect(page.locator(".xterm-rows")).toContainText("hello clipboard");
  });
});
