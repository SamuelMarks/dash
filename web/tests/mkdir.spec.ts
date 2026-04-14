import { test, expect } from '@playwright/test';

test('mkdir command creates a directory', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create a directory
  await page.keyboard.type('mkdir /tmp/mkdir_test_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Check the directory exists by creating a file in it
  await page.keyboard.type('echo "in dir" > /tmp/mkdir_test_dir/file.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Read the file back
  await page.keyboard.type('cat /tmp/mkdir_test_dir/file.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  const terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  const lastCatIndex = terminalText.lastIndexOf('cat /tmp/mkdir_test_dir/file.txt');
  const outputAfterCat = terminalText.substring(lastCatIndex);
  
  expect(outputAfterCat).toContain('in dir');
});

test('mkdir fails if parent directory does not exist', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Try to create a nested directory without -p
  await page.keyboard.type('mkdir /tmp/does_not_exist/mkdir_test_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  const terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  const lastMkdirIndex = terminalText.lastIndexOf('mkdir /tmp/does_not_exist/mkdir_test_dir');
  const outputAfterMkdir = terminalText.substring(lastMkdirIndex);
  
  expect(outputAfterMkdir).toContain('cannot create directory');
});

test('mkdir -p creates parent directories', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Try to create a nested directory with -p
  await page.keyboard.type('mkdir -p /tmp/does_not_exist2/mkdir_test_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Check the directory exists by creating a file in it
  await page.keyboard.type('echo "nested" > /tmp/does_not_exist2/mkdir_test_dir/file.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Read the file back
  await page.keyboard.type('cat /tmp/does_not_exist2/mkdir_test_dir/file.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  const terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  const lastCatIndex = terminalText.lastIndexOf('cat /tmp/does_not_exist2/mkdir_test_dir/file.txt');
  const outputAfterCat = terminalText.substring(lastCatIndex);
  
  expect(outputAfterCat).toContain('nested');
});

test('mkdir fails if directory already exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create a directory
  await page.keyboard.type('mkdir /tmp/mkdir_existing_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Try to create it again
  await page.keyboard.type('mkdir /tmp/mkdir_existing_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  let lastMkdirIndex = terminalText.lastIndexOf('mkdir /tmp/mkdir_existing_dir');
  let outputAfterMkdir = terminalText.substring(lastMkdirIndex);
  
  expect(outputAfterMkdir).toContain('cannot create directory');

  // Try to create it again with -p (should not fail)
  await page.keyboard.type('mkdir -p /tmp/mkdir_existing_dir\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  lastMkdirIndex = terminalText.lastIndexOf('mkdir -p /tmp/mkdir_existing_dir');
  outputAfterMkdir = terminalText.substring(lastMkdirIndex);
  
  expect(outputAfterMkdir).not.toContain('cannot create directory');
});
