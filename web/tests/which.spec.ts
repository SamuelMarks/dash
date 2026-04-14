import { test, expect } from '@playwright/test';

test('which finds basic commands', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();
  
  await page.keyboard.type('which ls\r', { delay: 50 });
  await page.waitForTimeout(1000);
  
  const text = await page.locator('.xterm-rows').innerText();
  expect(text).toContain('/bin/ls');
});

test('which -a finds all occurrences', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();
  
  await page.keyboard.type('mkdir -p /home/web_user/bin\r', { delay: 50 });
  await page.waitForTimeout(500);
  
  await page.keyboard.type('touch /home/web_user/bin/ls\r', { delay: 50 });
  await page.waitForTimeout(500);
  
  await page.keyboard.type('chmod +x /home/web_user/bin/ls\r', { delay: 50 });
  await page.waitForTimeout(500);
  
  await page.keyboard.type('PATH=/home/web_user/bin:$PATH which -a ls\r', { delay: 50 });
  await page.waitForTimeout(1000);
  
  const text = await page.locator('.xterm-rows').innerText();
  expect(text).toContain('/home/web_user/bin/ls');
  expect(text).toContain('/bin/ls');
});
