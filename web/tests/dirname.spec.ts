import { test, expect } from "@playwright/test";

test("dirname strips last component from file name", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".xterm")).toBeVisible();
  await expect(page.locator(".xterm-rows")).toContainText("Shell loaded");
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  const runCommand = async (cmd: string) => {
    await page.keyboard.type(cmd + "\r", { delay: 10 });
    await page.waitForTimeout(500);
  };

  await runCommand("dirname /usr/bin/sort");
  await runCommand("dirname stdio.h");
  await runCommand("dirname a/b/c/");
  await runCommand("dirname /");
  await runCommand("dirname //");
  await runCommand("dirname a//b//");
  await runCommand('dirname ""');

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".xterm-rows > div"))
      .map((row) => row.textContent)
      .join("\n");
  });

  expect(terminalText).toMatch(
    /wasm-shell\$ dirname \/usr\/bin\/sort\n.*\/usr\/bin/,
  );
  expect(terminalText).toMatch(/wasm-shell\$ dirname stdio\.h\n.*\./);
  expect(terminalText).toMatch(/wasm-shell\$ dirname a\/b\/c\/\n.*a\/b/);
  expect(terminalText).toMatch(/wasm-shell\$ dirname \/\n.*\//);
  expect(terminalText).toMatch(/wasm-shell\$ dirname \/\/\n.*\//);
  expect(terminalText).toMatch(/wasm-shell\$ dirname a\/\/b\/\/\n.*a/);
  // Using \. to match a literal dot output
  expect(terminalText).toMatch(/wasm-shell\$ dirname ""\n.*\./);
});
