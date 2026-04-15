import { test, expect } from "@playwright/test";

test("cp command copies files", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  // Create a source file
  await page.keyboard.type('echo "cp test content" > /tmp/cp_src.txt\r', {
    delay: 10,
  });
  await page.waitForTimeout(500);

  // Copy the file
  await page.keyboard.type("cp /tmp/cp_src.txt /tmp/cp_dst.txt\r", {
    delay: 10,
  });
  await page.waitForTimeout(500);

  // Read the copied file
  await page.keyboard.type("cat /tmp/cp_dst.txt\r", { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });
  expect(terminalText).toContain("cp test content");
});

test("cp command copies multiple files to a directory", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  // Create source files and destination directory
  await page.keyboard.type('echo "file1" > /tmp/f1.txt\r', { delay: 10 });
  await page.waitForTimeout(100);
  await page.keyboard.type('echo "file2" > /tmp/f2.txt\r', { delay: 10 });
  await page.waitForTimeout(100);
  await page.keyboard.type("mkdir /tmp/cp_dir\r", { delay: 10 });
  await page.waitForTimeout(100);

  // Copy files
  await page.keyboard.type("cp /tmp/f1.txt /tmp/f2.txt /tmp/cp_dir\r", {
    delay: 10,
  });
  await page.waitForTimeout(500);

  // Check file 1
  await page.keyboard.type("cat /tmp/cp_dir/f1.txt\r", { delay: 10 });
  await page.waitForTimeout(500);
  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });
  expect(terminalText).toContain("file1");

  // Check file 2
  await page.keyboard.type("cat /tmp/cp_dir/f2.txt\r", { delay: 10 });
  await page.waitForTimeout(500);
  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });
  expect(terminalText).toContain("file2");
});

test("cp -r command copies directories recursively", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  // Create source directory tree
  await page.keyboard.type("mkdir /tmp/src_dir\r", { delay: 10 });
  await page.waitForTimeout(100);
  await page.keyboard.type("mkdir /tmp/src_dir/sub_dir\r", { delay: 10 });
  await page.waitForTimeout(100);
  await page.keyboard.type(
    'echo "nested" > /tmp/src_dir/sub_dir/nested.txt\r',
    { delay: 10 },
  );
  await page.waitForTimeout(100);

  // Copy recursively
  await page.keyboard.type("cp -r /tmp/src_dir /tmp/dst_dir\r", { delay: 10 });
  await page.waitForTimeout(500);

  // Read the copied nested file
  await page.keyboard.type("cat /tmp/dst_dir/sub_dir/nested.txt\r", {
    delay: 10,
  });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });
  expect(terminalText).toContain("nested");
});
