import { test, expect } from "@playwright/test";

test("head command", async ({ page }) => {
  await page.goto("http://localhost:5173?test=1");

  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");

  // Focus terminal
  await page.locator(".xterm").click();

  // Create a file with 15 lines
  await page.keyboard.type(
    'printf "1\\n2\\n3\\n4\\n5\\n6\\n7\\n8\\n9\\n10\\n11\\n12\\n13\\n14\\n15\\n" > /tmp/head1.txt\r',
    { delay: 10 },
  );
  await page.waitForTimeout(500);

  // Test default head (10 lines)
  await page.keyboard.type(
    "head /tmp/head1.txt > /tmp/head_out1.txt && cat /tmp/head_out1.txt\r",
    { delay: 10 },
  );
  await page.waitForTimeout(500);

  let terminalText = await page.locator(".xterm-rows").innerText();
  expect(terminalText).toMatch(
    /cat \/tmp\/head_out1\.txt\s+1\s+2\s+3\s+4\s+5\s+6\s+7\s+8\s+9\s+10\s+wasm-shell\$/,
  );
  expect(terminalText).not.toMatch(/cat \/tmp\/head_out1\.txt[\s\S]*\b11\b/);

  // Test head -n 3
  await page.keyboard.type(
    "head -n 3 /tmp/head1.txt > /tmp/head_out2.txt && cat /tmp/head_out2.txt\r",
    { delay: 10 },
  );
  await page.waitForTimeout(500);

  terminalText = await page.locator(".xterm-rows").innerText();
  expect(terminalText).toMatch(
    /cat \/tmp\/head_out2\.txt\s+1\s+2\s+3\s+wasm-shell\$/,
  );

  // Test head -n -12 (print all but last 12 lines => prints 3 lines)
  await page.keyboard.type(
    "head -n -12 /tmp/head1.txt > /tmp/head_out3.txt && cat /tmp/head_out3.txt\r",
    { delay: 10 },
  );
  await page.waitForTimeout(500);

  terminalText = await page.locator(".xterm-rows").innerText();
  expect(terminalText).toMatch(
    /cat \/tmp\/head_out3\.txt\s+1\s+2\s+3\s+wasm-shell\$/,
  );

  // Test head -c 4
  await page.keyboard.type(
    "head -c 4 /tmp/head1.txt > /tmp/head_out4.txt && cat /tmp/head_out4.txt\r",
    { delay: 10 },
  );
  await page.waitForTimeout(500);

  terminalText = await page.locator(".xterm-rows").innerText();
  expect(terminalText).toMatch(
    /cat \/tmp\/head_out4\.txt\s+1\n2\nwasm-shell\$/,
  );
});
