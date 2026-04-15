import { test, expect } from "@playwright/test";

test("ctrl+w and ctrl+u", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();
  // Type a wrong command, hit Ctrl+U, then type uname
  await page.keyboard.type("wrong command", { delay: 50 });
  await page.keyboard.press("Control+U");
  await page.keyboard.type("uname\r", { delay: 50 });

  await expect(page.locator(".xterm-rows")).toContainText("Emscripten");

  // Type unxzz zz, hit Ctrl+W (erases zz), hit Ctrl+W (erases unxzz), type ls /
  await page.keyboard.type("unxzz zz", { delay: 50 });
  await page.keyboard.press("Control+W");
  await page.keyboard.press("Control+W");
  await page.keyboard.type("ls /\r", { delay: 50 });

  await expect(page.locator(".xterm-rows")).toContainText("bin");
});

test("cursor navigation and shortcuts", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  // Type something: eho hello
  await page.keyboard.type("eho hello", { delay: 10 });

  // Left arrow 8 times to get before 'h'
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("ArrowLeft");
  }

  // Type 'c' to make it 'echo hello'
  await page.keyboard.type("c");

  // Enter should execute correctly even if cursor is not at the end
  await page.keyboard.press("Enter");
  await expect(page.locator(".xterm-rows")).toContainText("hello");

  // Type echo part1 part2
  await page.keyboard.type("echo part1 part2", { delay: 10 });

  // Ctrl+A to go to start, right arrow 5 times to go after 'echo '
  await page.keyboard.press("Control+A");
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("ArrowRight");
  }

  // Ctrl+K to kill to end
  await page.keyboard.press("Control+K");
  await page.keyboard.type("new_end");
  await page.keyboard.press("Enter");
  await expect(page.locator(".xterm-rows")).toContainText("new_end");
  await expect(page.locator(".xterm-rows")).not.toContainText("part1 part2");

  // Type something, Ctrl+A, Ctrl+E, add suffix
  await page.keyboard.type("echo start", { delay: 10 });
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Control+E");
  await page.keyboard.type(" end");
  await page.keyboard.press("Enter");
  await expect(page.locator(".xterm-rows")).toContainText("start end");
});
