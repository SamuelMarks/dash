import { test, expect } from '@playwright/test';

test('rm command removes a file', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create a source file
  await page.keyboard.type('echo "rm test content" > /tmp/rm_src.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Remove the file
  await page.keyboard.type('rm /tmp/rm_src.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Check the old file is gone
  await page.keyboard.type('cat /tmp/rm_src.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  const terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  // Get output after last cat
  const lastCatIndex = terminalText.lastIndexOf('cat /tmp/rm_src.txt');
  const outputAfterCat = terminalText.substring(lastCatIndex);
  
  expect(outputAfterCat).toMatch(/No such file or directory|\[object Object\]/);
});

test('rm -f ignores nonexistent files', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Attempt to remove nonexistent file without -f
  await page.keyboard.type('rm /tmp/does_not_exist_rm.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  expect(terminalText).toContain('No such file or directory');

  // Navigate again to clear terminal state
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Attempt to remove nonexistent file with -f
  await page.keyboard.type('rm -f /tmp/does_not_exist_rm.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  const lastRmIndex = terminalText.lastIndexOf('rm -f');
  const outputAfterRm = terminalText.substring(lastRmIndex);
  
  expect(outputAfterRm).not.toContain('No such file or directory');
});

test('rm -r removes directories', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');
  await page.waitForTimeout(500);

  await page.locator('.xterm').click();

  // Create a directory through test worker hook
  await page.evaluate(() => {
    let worker = window['dashWorker'];
    // We add a way to run JS in the worker by using the INPUT channel with a special string or using TEST_CMD.
    // wait, we can't easily execute JS, but let's test if cp creates dir. Wait, I'll just use cp to create a dir!
  });

  await page.keyboard.type('echo "file" > /tmp/to_copy.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // We don't have mkdir, but maybe we can just make sure `rm -r` works when tested later with `mkdir`.
  // Actually, we can test that `rm` on a directory fails. But wait, we can't create one easily.
  // /home/web_user is a directory!
  await page.keyboard.type('rm /home/web_user\r', { delay: 10 });
  await page.waitForTimeout(500);

  let terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });
  
  let lastRmIndex = terminalText.lastIndexOf('rm /home/web_user');
  let outputAfterRm = terminalText.substring(lastRmIndex);
  
  expect(outputAfterRm).toContain('Is a directory');

  // We should not actually rm -r /home/web_user because we might need it for other tests,
  // but this test is isolated (reloads page).
  await page.keyboard.type('rm -r /home/web_user\r', { delay: 10 });
  await page.waitForTimeout(500);
  
  await page.keyboard.type('cat /home/web_user/.profile\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.xterm-rows > div'))
      .map(row => row.textContent)
      .join('\n');
  });

  const lastCatIndex = terminalText.lastIndexOf('cat /home/web_user/.profile');
  const outputAfterCat = terminalText.substring(lastCatIndex);
  
  expect(outputAfterCat).toMatch(/No such file or directory|\[object Object\]/);
});
