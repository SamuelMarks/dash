import { test, expect } from "@playwright/test";

test("uname runs with arguments", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();
  await page.keyboard.type("uname -a\r", { delay: 50 });
  await page.waitForTimeout(1000);

  await expect(page.locator(".xterm-rows")).toContainText(
    "Emscripten emscripten 1.0 #1 wasm32 wasm32 wasm32 Emscripten",
  );
});
