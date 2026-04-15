import { test, expect } from "@playwright/test";

test("alias command", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(1000);

  await page.locator(".xterm").click();

  await page.keyboard.type("alias --version\r");
  await page.waitForTimeout(500);

  let terminalText = await page.locator(".xterm-rows").innerText();
  expect(terminalText).toContain("alias (dash-wasm) 0.0.1");

  await page.keyboard.type("alias --help\r");
  await page.waitForTimeout(500);

  terminalText = await page.locator(".xterm-rows").innerText();
  expect(terminalText).toContain("Usage: alias");
});
