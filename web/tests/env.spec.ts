import { test, expect } from '@playwright/test';

test('env runs with arguments', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();
  await page.keyboard.type('env TEST_ENV_VAR=123 echo $TEST_ENV_VAR\r', { delay: 50 });
  await page.waitForTimeout(1000);
  
  await page.keyboard.type('env TEST_ENV_VAR2=456\r', { delay: 50 });
  await page.waitForTimeout(1000);

  await expect(page.locator('.xterm-rows')).toContainText('TEST_ENV_VAR2=456');
});
