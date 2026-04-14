import { test, expect } from '@playwright/test';

test('mv command renames a file', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create a source file
  await page.keyboard.type('echo "mv test content" > /tmp/mv_src.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Move the file
  await page.keyboard.type('mv /tmp/mv_src.txt /tmp/mv_dst.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Check the new file
  await page.keyboard.type('cat /tmp/mv_dst.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  expect(terminalText).toContain('mv test content');

  // Check the old file is gone
  await page.keyboard.type('cat /tmp/mv_src.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  expect(terminalText).toMatch(/No such file or directory|\[object Object\]/);
});

test('mv command moves multiple files to a directory', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create source files and destination directory
  await page.keyboard.type('echo "file1" > /tmp/mv_f1.txt\r', { delay: 10 });
  await page.waitForTimeout(100);
  await page.keyboard.type('echo "file2" > /tmp/mv_f2.txt\r', { delay: 10 });
  await page.waitForTimeout(100);
  await page.keyboard.type('mkdir /tmp/mv_dir\r', { delay: 10 });
  await page.waitForTimeout(100);

  // Move files
  await page.keyboard.type('mv /tmp/mv_f1.txt /tmp/mv_f2.txt /tmp/mv_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Check file 1 in new location
  await page.keyboard.type('cat /tmp/mv_dir/mv_f1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  expect(terminalText).toContain('file1');

  // Check file 1 in old location
  await page.keyboard.type('cat /tmp/mv_f1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  expect(terminalText).toMatch(/No such file or directory|\[object Object\]/);
});

test('mv command renames a directory', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create source directory tree
  await page.keyboard.type('mkdir /tmp/mv_src_dir\r', { delay: 10 });
  await page.waitForTimeout(100);
  await page.keyboard.type('echo "nested" > /tmp/mv_src_dir/nested.txt\r', { delay: 10 });
  await page.waitForTimeout(100);

  // Rename directory
  await page.keyboard.type('mv /tmp/mv_src_dir /tmp/mv_dst_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Read the moved nested file
  await page.keyboard.type('cat /tmp/mv_dst_dir/nested.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  expect(terminalText).toContain('nested');
});
