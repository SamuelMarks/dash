import { test, expect } from '@playwright/test';

test('cut command', async ({ page }) => {
  await page.goto('http://localhost:5173?test=1');
  
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');

  // Focus terminal
  await page.locator('.xterm').click();

  // Test cut by bytes/chars
  await page.keyboard.type('echo "abcdefg" > /tmp/cut1.txt && cut -c2-4 /tmp/cut1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  
  let terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('bcd');

  // Test cut by fields with default delimiter (tab)
  await page.keyboard.type('printf "a\\tb\\tc\\n" > /tmp/cut2.txt && cut -f1,3 /tmp/cut2.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  // xterm.js might render tab as spaces
  expect(terminalText).toMatch(/a\s+c/);

  // Test cut by fields with custom delimiter
  await page.keyboard.type('echo "root:x:0:0:root" > /tmp/cut3.txt && cut -d: -f1,5 /tmp/cut3.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('root:root');
});
