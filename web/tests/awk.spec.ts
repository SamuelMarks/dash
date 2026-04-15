import { test, expect } from "@playwright/test";

test("awk command processing", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(1000);

  // Focus the terminal
  await page.locator(".xterm").click();

  // Basic print $1
  await page.keyboard.type('echo "a b c" > /tmp/awktest1.txt\r');
  await page.waitForTimeout(500);

  await page.keyboard.type("awk '{print $1}' /tmp/awktest1.txt\r");
  await page.waitForTimeout(500);
  let text1 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text1).toContain("\na\n");

  // Basic print $2
  await page.keyboard.type("awk '{print $2}' /tmp/awktest1.txt\r");
  await page.waitForTimeout(500);
  let text2 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text2).toContain("\nb\n");

  // Custom separator
  await page.keyboard.type('echo "1:2:3" > /tmp/awktest2.txt\r');
  await page.waitForTimeout(500);
  await page.keyboard.type("awk -F: '{print $3}' /tmp/awktest2.txt\r");
  await page.waitForTimeout(500);
  let text3 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text3).toContain("\n3\n");

  // Pipeline -> Use redirection instead of pipe since fork is not supported
  await page.keyboard.type('echo "x y z" > /tmp/awktest_in.txt\r');
  await page.waitForTimeout(500);
  await page.keyboard.type("awk '{print $3}' < /tmp/awktest_in.txt\r");
  await page.waitForTimeout(500);
  let text4 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text4).toContain("\nz\n");

  // Match pattern
  await page.keyboard.type('echo "foo 1" > /tmp/awktest3.txt\r');
  await page.waitForTimeout(200);
  await page.keyboard.type('echo "bar 2" >> /tmp/awktest3.txt\r');
  await page.waitForTimeout(500);

  await page.keyboard.type("awk '/foo/ {print $2}' /tmp/awktest3.txt\r");
  await page.waitForTimeout(500);
  let text5 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text5).toContain("\n1\n");
});
