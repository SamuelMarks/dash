import { test, expect } from '@playwright/test';

test('tr command', async ({ page }) => {
  await page.goto('http://localhost:5173?test=1');
  
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');

  // Focus terminal
  await page.locator('.xterm').click();

  // Test replacing characters
  await page.keyboard.type('echo "hello world" > /tmp/tr1.txt && tr "a-z" "A-Z" < /tmp/tr1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  let terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('HELLO WORLD');

  // Test deleting characters
  await page.keyboard.type('echo "hello world" > /tmp/tr2.txt && tr -d "l" < /tmp/tr2.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('heo word');

  // Test squeezing characters
  await page.keyboard.type('echo "hello   world" > /tmp/tr3.txt && tr -s " " < /tmp/tr3.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('hello world');
});
