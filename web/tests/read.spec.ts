import { test, expect } from "@playwright/test";

test("read runs interactively", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  // start read
  await page.keyboard.type("read myvar\r", { delay: 50 });
  await page.waitForTimeout(500);

  // provide input
  await page.keyboard.type("hello_read_value\r", { delay: 50 });
  await page.waitForTimeout(500);

  // echo it
  await page.keyboard.type('echo "val=$myvar"\r', { delay: 50 });
  await page.waitForTimeout(1000);

  await expect(page.locator(".xterm-rows")).toContainText(
    "val=hello_read_value",
  );
});
