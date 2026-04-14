import { test, expect } from '@playwright/test';

test('sort command', async ({ page }) => {
  await page.goto('http://localhost:5173?test=1');
  
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');

  // Focus terminal
  await page.locator('.xterm').click();

  // Test simple sort
  await page.keyboard.type('printf "c\\na\\nb\\n" > /tmp/sort1.txt && sort /tmp/sort1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  
  let terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/a\s+b\s+c/);

  // Test numeric sort
  await page.keyboard.type('printf "10\\n2\\n1\\n" > /tmp/sort2.txt && sort -n /tmp/sort2.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/1\s+2\s+10/);

  // Test reverse sort
  await page.keyboard.type('printf "1\\n2\\n3\\n" > /tmp/sort3.txt && sort -r /tmp/sort3.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/3\s+2\s+1/);
  
  // Test numeric reverse sort
  await page.keyboard.type('sort -nr /tmp/sort2.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/10\s+2\s+1/);

  // Test unique sort
  await page.keyboard.type('printf "a\\nb\\na\\n" > /tmp/sort4.txt && sort -u /tmp/sort4.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/a\s+b/);
  
  // Test stdin redirection
  await page.keyboard.type('printf "z\\nx\\n" > /tmp/sort5.txt && sort < /tmp/sort5.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/x\s+z/);

  // Test human sort
  await page.keyboard.type('printf "2\\n1K\\na\\nb\\n" > /tmp/sort6.txt && sort -h /tmp/sort6.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/a\s+b\s+2\s+1K/);
});