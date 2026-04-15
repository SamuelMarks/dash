import { test, expect } from "@playwright/test";

test("sed command processing", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(1000);

  // Focus the terminal
  await page.locator(".xterm").click();

  // Basic substitution
  await page.keyboard.type('echo "hello world" > /tmp/sedtest1.txt\r');
  await page.waitForTimeout(500);

  await page.keyboard.type("sed 's/world/playwright/' /tmp/sedtest1.txt\r");
  await page.waitForTimeout(500);
  let text1 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text1).toContain("hello playwright");

  // Global substitution
  await page.keyboard.type('echo "a a a" > /tmp/sedtest2.txt\r');
  await page.waitForTimeout(500);
  await page.keyboard.type("sed 's/a/b/g' /tmp/sedtest2.txt\r");
  await page.waitForTimeout(500);
  let text2 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text2).toContain("b b b");

  // Stdin processing
  await page.keyboard.type(
    "sed 's/foo/bar/' < /tmp/sedtest1.txt > /tmp/sedtest3.txt\r",
  );
  await page.waitForTimeout(500);
  // wait actually sedtest1 contains hello world
  await page.keyboard.type('echo "foo baz" > /tmp/sedtest_in.txt\r');
  await page.waitForTimeout(500);
  await page.keyboard.type("sed 's/foo/bar/' < /tmp/sedtest_in.txt\r");
  await page.waitForTimeout(500);
  let text3 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text3).toContain("bar baz");

  // Multiple scripts
  await page.keyboard.type('echo "123" > /tmp/sedtest4.txt\r');
  await page.waitForTimeout(500);
  await page.keyboard.type("sed -e 's/1/a/' -e 's/3/c/' /tmp/sedtest4.txt\r");
  await page.waitForTimeout(500);
  let text4 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text4).toContain("a2c");
});
