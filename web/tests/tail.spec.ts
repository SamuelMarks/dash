import { test, expect } from '@playwright/test';

test('tail command', async ({ page }) => {
  await page.goto('http://localhost:5173?test=1');
  
  await expect(page.locator('.xterm')).toBeVisible();
  await expect(page.locator('.xterm-rows')).toContainText('Shell loaded');

  // Focus terminal
  await page.locator('.xterm').click();

  // Create a file with 15 lines
  await page.keyboard.type('printf "1\\n2\\n3\\n4\\n5\\n6\\n7\\n8\\n9\\n10\\n11\\n12\\n13\\n14\\n15\\n" > /tmp/tail1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  // Test default tail (10 lines)
  await page.keyboard.type('tail /tmp/tail1.txt > /tmp/tail_out1.txt && cat /tmp/tail_out1.txt\r', { delay: 10 });
  await page.waitForTimeout(500);
  
  let terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/cat \/tmp\/tail_out1\.txt\s+6\s+7\s+8\s+9\s+10\s+11\s+12\s+13\s+14\s+15\s+wasm-shell\$/);

  // Test tail -n 3
  await page.keyboard.type('tail -n 3 /tmp/tail1.txt > /tmp/tail_out2.txt && cat /tmp/tail_out2.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/cat \/tmp\/tail_out2\.txt\s+13\s+14\s+15\s+wasm-shell\$/);
  
  // Test tail -n +12 (start at line 12 => prints lines 12, 13, 14, 15)
  await page.keyboard.type('tail -n +12 /tmp/tail1.txt > /tmp/tail_out3.txt && cat /tmp/tail_out3.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/cat \/tmp\/tail_out3\.txt\s+12\s+13\s+14\s+15\s+wasm-shell\$/);

  // Test tail -c 4 (last 4 bytes of file: "\n15\n")
  await page.keyboard.type('tail -c 4 /tmp/tail1.txt > /tmp/tail_out4.txt && cat /tmp/tail_out4.txt\r', { delay: 10 });
  await page.waitForTimeout(500);

  terminalText = await page.locator('.xterm-rows').innerText();
  expect(terminalText).toMatch(/cat \/tmp\/tail_out4\.txt\s+15\nwasm-shell\$/); 
});
