import { test, expect } from '@playwright/test';

test('chmod changes file permissions', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create a source file
  await page.keyboard.type('echo "chmod test content" > /tmp/chmod_test.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Change permissions to octal
  await page.keyboard.type('chmod 755 /tmp/chmod_test.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Check stat (simplified, we might just use stat and grep or node tests)
  // Let's use `stat` to check the octal mode
  await page.keyboard.type('stat -c "%a" /tmp/chmod_test.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  let lastStatIndex = terminalText.lastIndexOf('stat -c');
  let outputAfterStat = terminalText.substring(lastStatIndex);
  
  expect(outputAfterStat).toContain('755');

  // Change permissions symbolically
  await page.keyboard.type('chmod u+w,go-wx /tmp/chmod_test.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  await page.keyboard.type('stat -c "%a" /tmp/chmod_test.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });

  lastStatIndex = terminalText.lastIndexOf('stat -c');
  outputAfterStat = terminalText.substring(lastStatIndex);

  // u+w (7 -> 7), go-wx (55 -> 44) = 744
  expect(outputAfterStat).toContain('744');
});

test('chmod -R changes permissions recursively', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create directory tree
  await page.keyboard.type('mkdir -p /tmp/chmod_dir\r', { delay: 10 });
  await page.waitForTimeout(500);
  await page.keyboard.type('echo "nested" > /tmp/chmod_dir/nested.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Apply recursive chmod
  await page.keyboard.type('chmod -R 700 /tmp/chmod_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Check directory permissions
  await page.keyboard.type('stat -c "%a" /tmp/chmod_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  let lastStatIndex = terminalText.lastIndexOf('stat -c "%a" /tmp/chmod_dir');
  let outputAfterStat = terminalText.substring(lastStatIndex);
  
  expect(outputAfterStat).toContain('700');

  // Check file permissions
  await page.keyboard.type('stat -c "%a" /tmp/chmod_dir/nested.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  lastStatIndex = terminalText.lastIndexOf('stat -c "%a" /tmp/chmod_dir/nested.txt');
  outputAfterStat = terminalText.substring(lastStatIndex);
  
  expect(outputAfterStat).toContain('700');
});
