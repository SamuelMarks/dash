import { test, expect } from '@playwright/test';

test('du command processing', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(1000);

  await page.locator('.xterm').click();

  await page.keyboard.type('mkdir /tmp/du_test\r');
  await page.waitForTimeout(500);
  await page.keyboard.type('printf "%02048d" 0 > /tmp/du_test/f1.txt\r');
  await page.waitForTimeout(500);
  
  await page.keyboard.type('clear\r');
  await page.waitForTimeout(500);

  // Test du -s
  await page.keyboard.type('du -s /tmp/du_test\r');
  await page.waitForTimeout(500);
  let text1 = await page.evaluate(() => Array.from(document.querySelectorAll('.xterm-rows > div')).map(r => r.textContent).join('\n'));
  expect(text1).toMatch(/6\s+\/tmp\/du_test/);

  // Test du -sh
  await page.keyboard.type('du -sh /tmp/du_test\r');
  await page.waitForTimeout(500);
  let text2 = await page.evaluate(() => Array.from(document.querySelectorAll('.xterm-rows > div')).map(r => r.textContent).join('\n'));
  expect(text2).toMatch(/6\.0K\s+\/tmp\/du_test/);
});
