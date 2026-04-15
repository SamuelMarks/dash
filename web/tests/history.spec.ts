import { test, expect } from "@playwright/test";

test("up and down arrows for history", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  await page.keyboard.type("echo first\r", { delay: 50 });
  await page.keyboard.type("echo second\r", { delay: 50 });

  await page.keyboard.press("ArrowUp"); // "echo second"
  await page.keyboard.press("ArrowUp"); // "echo first"
  await page.keyboard.press("ArrowDown"); // "echo second"

  await page.keyboard.press("Enter");

  // We should see "second" printed again (twice total)
  await page.waitForTimeout(100);
  const text = await page.locator(".xterm-rows").innerText();
  const matches = text.match(/second/g);
  expect(matches?.length).toBeGreaterThanOrEqual(2);
});
