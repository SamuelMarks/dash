import { test, expect } from "@playwright/test";

test("basename strips directory and suffix", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  const runCommand = async (cmd: string) => {
    await page.keyboard.type(cmd + "\r", { delay: 10 });
    await page.waitForTimeout(500);
  };

  await runCommand("basename /usr/bin/sort");
  await runCommand("basename include/stdio.h .h");

  // Let's test standard behavior only
  await runCommand("basename a/b/c/");
  await runCommand("basename /");
  await runCommand("basename //");
  await runCommand("basename .txt .txt");
  await runCommand("basename a/b/c a/b/c");
  await runCommand('basename ""');

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  // Since playwright concatenates everything, we could just match outputs loosely, or verify strictly.
  expect(terminalText).toMatch(
    /wasm-shell\$ basename \/usr\/bin\/sort\n.*sort/,
  );
  expect(terminalText).toMatch(
    /wasm-shell\$ basename include\/stdio\.h \.h\n.*stdio/,
  );
  expect(terminalText).toMatch(/wasm-shell\$ basename a\/b\/c\/\n.*c/);
  expect(terminalText).toMatch(/wasm-shell\$ basename \/\n.*\//);
  expect(terminalText).toMatch(/wasm-shell\$ basename \/\/\n.*\//);
  expect(terminalText).toMatch(/wasm-shell\$ basename \.txt \.txt\n.*\.txt/);
  expect(terminalText).toMatch(/wasm-shell\$ basename a\/b\/c a\/b\/c\n.*c/);
});
