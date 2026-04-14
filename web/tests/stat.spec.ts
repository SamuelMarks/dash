import { test, expect } from '@playwright/test';

test('stat runs with arguments', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();
  await page.keyboard.type('stat /bin/uname\r', { delay: 50 });
  await page.waitForTimeout(1000);
  
  await expect(page.locator('.xterm-rows')).toContainText('File: /bin/uname');
  await expect(page.locator('.xterm-rows')).toContainText('Size: 0');
});
