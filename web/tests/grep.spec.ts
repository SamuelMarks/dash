import { test, expect } from "@playwright/test";

test("grep command processing", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(1000);

  await page.locator(".xterm").click();

  await page.keyboard.type('echo "apple" > /tmp/fruit.txt\r');
  await page.keyboard.type('echo "banana" >> /tmp/fruit.txt\r');
  await page.keyboard.type('echo "cherry" >> /tmp/fruit.txt\r');
  await page.waitForTimeout(500);

  // Test 1: grep banana
  await page.keyboard.type("grep banana /tmp/fruit.txt > /tmp/out1.txt\r");
  await page.waitForTimeout(500);
  await page.keyboard.type("cat /tmp/out1.txt\r");
  await page.waitForTimeout(500);
  let text1 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text1).toContain("banana");
  // It shouldn't contain multiple bananas from output (only the one from the cat)

  // Test 2: grep -v banana
  await page.keyboard.type("grep -v banana /tmp/fruit.txt > /tmp/out2.txt\r");
  await page.waitForTimeout(500);
  await page.keyboard.type("cat /tmp/out2.txt\r");
  await page.waitForTimeout(500);
  let text2 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text2).toContain("apple");
  expect(text2).toContain("cherry");

  // Test 3: grep -i BANANA
  await page.keyboard.type("grep -i BANANA /tmp/fruit.txt > /tmp/out3.txt\r");
  await page.waitForTimeout(500);
  await page.keyboard.type("cat /tmp/out3.txt\r");
  await page.waitForTimeout(500);
  let text3 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text3).toContain("banana");

  // Test 4: grep -n a
  await page.keyboard.type("grep -n a /tmp/fruit.txt > /tmp/out4.txt\r");
  await page.waitForTimeout(500);
  await page.keyboard.type("cat /tmp/out4.txt\r");
  await page.waitForTimeout(500);
  let text4 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text4).toContain("1:apple");
  expect(text4).toContain("2:banana");

  // Test 5: grep stdin
  await page.keyboard.type("grep a < /tmp/fruit.txt > /tmp/out5.txt\r");
  await page.waitForTimeout(500);
  await page.keyboard.type("cat /tmp/out5.txt\r");
  await page.waitForTimeout(500);
  let text5 = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((r) => r.textContent)
      .join("\n"),
  );
  expect(text5).toContain("apple");
  expect(text5).toContain("banana");
});
