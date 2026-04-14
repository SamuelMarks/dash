import { test, expect } from '@playwright/test';

test('version and custom help commands', async ({ page }) => {
  await page.goto('http://localhost:5173?test=1');
  
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');

  // Focus terminal
  await page.locator('.xterm').click();

  const tools = ['grep', 'tar', 'env', 'sed', 'sudo', 'date', 'df', 'stat', 'file', 'uname'];

  for (const tool of tools) {
    await page.keyboard.type(`${tool} --version\r`, { delay: 10 });
    await page.waitForTimeout(300);
    let terminalText = await page.locator('.xterm-rows').innerText();
    expect(terminalText).toContain(`${tool} (dash-wasm) 0.0.1`);
    
    await page.keyboard.type(`${tool} --help\r`, { delay: 10 });
    await page.waitForTimeout(300);
    terminalText = await page.locator('.xterm-rows').innerText();
    expect(terminalText).toContain(`Usage:`); // they all have Usage:
  }
});
