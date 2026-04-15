import { test, expect } from "@playwright/test";

test("tee command reads from stdin and writes to files", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  await page.keyboard.type('echo "hello tee" > /tmp/input.txt\r', {
    delay: 10,
  });
  await page.waitForTimeout(500);

  // Use redirection instead of pipe since fork is not supported
  await page.keyboard.type(
    "tee /tmp/tee1.txt /tmp/tee2.txt < /tmp/input.txt\r",
    { delay: 10 },
  );
  await page.waitForTimeout(500);

  await page.keyboard.type("cat /tmp/tee1.txt\r", { delay: 10 });
  await page.waitForTimeout(500);

  await page.keyboard.type("cat /tmp/tee2.txt\r", { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  // tee outputs to stdout AND the two files
  let occurrences = (terminalText.match(/hello tee/g) || []).length;
  expect(occurrences).toBeGreaterThanOrEqual(4); // 1 for echo command echo, 1 for tee stdout, 2 for the cat outputs
});
