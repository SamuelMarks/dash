import { test, expect } from '@playwright/test';

test('cat command reads and prints files', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  // Focus the terminal
  await page.locator('.xterm').click();
  
  // Set up test files
  await page.keyboard.type('echo "hello world" > /tmp/test1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  
  await page.keyboard.type('echo "line2" > /tmp/test2.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Clear screen to make assertion easier
  await page.keyboard.type('clear\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Run cat on a single file
  await page.keyboard.type('cat /tmp/test1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  
  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  expect(terminalText).toContain('hello world');

  await page.keyboard.type('clear\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Run cat on multiple files
  await page.keyboard.type('cat /tmp/test1.txt /tmp/test2.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  expect(terminalText).toContain('hello world');
  expect(terminalText).toContain('line2');
});
