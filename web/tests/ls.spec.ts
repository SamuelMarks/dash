import { test, expect } from "@playwright/test";

test("ls command lists files", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  await page.keyboard.type("mkdir /tmp/ls_test\r", { delay: 10 });
  await page.waitForTimeout(500);
  await page.keyboard.type('echo "file1" > /tmp/ls_test/f1.txt\r', {
    delay: 10,
  });
  await page.waitForTimeout(500);
  await page.keyboard.type('echo "file2" > /tmp/ls_test/f2.txt\r', {
    delay: 10,
  });
  await page.waitForTimeout(500);

  // Clear to make it easier to read
  await page.keyboard.type("clear\r", { delay: 10 });
  await page.waitForTimeout(500);

  await page.keyboard.type("ls /tmp/ls_test\r", { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  expect(terminalText).toContain("f1.txt");
  expect(terminalText).toContain("f2.txt");

  // Test -l
  await page.keyboard.type("ls -l /tmp/ls_test\r", { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  expect(terminalText).toMatch(/-rw-.*f1\.txt/);
  expect(terminalText).toMatch(/-rw-.*f2\.txt/);

  // Test -h
  await page.keyboard.type('printf "%02048d" 0 > /tmp/ls_test/big.txt\r', {
    delay: 10,
  });
  await page.waitForTimeout(500);
  await page.keyboard.type("ls -lh /tmp/ls_test\r", { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  expect(terminalText).toMatch(/-rw-.*2\.0K.*big\.txt/);
});

test("ls -a shows hidden files", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  await page.keyboard.type("mkdir /tmp/ls_hidden_test\r", { delay: 10 });
  await page.waitForTimeout(500);
  await page.keyboard.type('echo "hidden" > /tmp/ls_hidden_test/.hidden\r', {
    delay: 10,
  });
  await page.waitForTimeout(500);
  await page.keyboard.type('echo "visible" > /tmp/ls_hidden_test/visible\r', {
    delay: 10,
  });
  await page.waitForTimeout(500);

  await page.keyboard.type("clear\r", { delay: 10 });
  await page.waitForTimeout(500);

  await page.keyboard.type("ls /tmp/ls_hidden_test\r", { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  // Extract output specifically from the ls command
  let lsOutput = terminalText.split("ls /tmp/ls_hidden_test").pop() || "";
  let justOutput = lsOutput.split("wasm-shell$")[0];

  expect(justOutput).not.toContain(".hidden");
  expect(justOutput).toContain("visible");

  await page.keyboard.type("ls -a /tmp/ls_hidden_test\r", { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  lsOutput = terminalText.split("ls -a /tmp/ls_hidden_test").pop() || "";
  justOutput = lsOutput.split("wasm-shell$")[0];

  expect(justOutput).toContain(".hidden");
  expect(justOutput).toContain("visible");
  expect(justOutput).toContain(".."); // Should show . and ..
});
