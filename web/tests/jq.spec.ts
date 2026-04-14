import { test, expect } from '@playwright/test';

test('jq command parsing', async ({ page }) => {
  await page.goto('http://localhost:5173?test=1');
  
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');

  // Focus terminal
  await page.locator('.xterm').click();

  // Test simple parsing
  await page.keyboard.type('echo \'{"foo": "bar"}\' > /tmp/jq1.json && jq .foo /tmp/jq1.json\r', { delay: 10 });
  await page.waitForTimeout(500);
  
  let terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('"bar"');

  // Test array and raw output
  await page.keyboard.type('echo \'[{"name": "hello"}]\' > /tmp/jq2.json && jq -r .[0].name /tmp/jq2.json\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('hello');
  
  // Test without pipe to avoid "Cannot fork"
  await page.keyboard.type('echo \'{"a": {"b": [1, 2, 999]}}\' > /tmp/jq3.json && jq .a.b[2] /tmp/jq3.json\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toContain('999');
});
