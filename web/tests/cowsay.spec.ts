import { test, expect } from '@playwright/test';

test('cowsay command', async ({ page }) => {
  await page.goto('http://localhost:5173?test=1');
  
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');

  // Focus terminal
  await page.locator('.xterm').click();

  // Test simple message
  await page.keyboard.type('clear\r', { delay: 10 });
  await page.waitForTimeout(500);
  await page.keyboard.type('cowsay Hello World\r', { delay: 10 });
  await page.waitForTimeout(500);
  
  let terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('< Hello World >');
  expect(terminalText).toContain('^__^');

  // Test with custom eyes and tongue
  await page.keyboard.type('clear\r', { delay: 10 });
  await page.waitForTimeout(500);
  await page.keyboard.type('cowsay -e xx -T U Hello World\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('(xx)');
  expect(terminalText).toContain('U  ||----w |');
  
  // Test with -b (Borg mode)
  await page.keyboard.type('clear\r', { delay: 10 });
  await page.waitForTimeout(500);
  await page.keyboard.type('cowsay -b We are Borg\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('< We are Borg >');
  expect(terminalText).toContain('(==)');

  // Test word wrap
  await page.keyboard.type('clear\r', { delay: 10 });
  await page.waitForTimeout(500);
  await page.keyboard.type('cowsay -W 10 This is a long string to be wrapped.\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('/ This is a \\');
  expect(terminalText).toContain('| long      |');
  expect(terminalText).toContain('| string to |');
  expect(terminalText).toContain('\\ wrapped.  /');
});
