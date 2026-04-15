import { test, expect } from "@playwright/test";

test("localstorage works", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.waitForFunction(() =>
    document
      .querySelector(".xterm-rows")
      ?.textContent?.includes("Shell loaded."),
  );

  await page.evaluate(() => {
    localStorage.setItem("mykey", "myvalue");
  });

  await page.reload();
  await page.waitForFunction(() =>
    document
      .querySelector(".xterm-rows")
      ?.textContent?.includes("Shell loaded."),
  );
  await page.waitForTimeout(500);

  await page.locator(".xterm").click();

  // READ
  await page.keyboard.type("cat /sys/fs/localstorage/mykey");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() =>
    document.querySelector(".xterm-rows")?.textContent?.includes("myvalue"),
  );

  // CREATE / UPDATE
  await page.keyboard.type('echo "newval" > /sys/fs/localstorage/otherkey');
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000); // wait for postMessage to propagate

  const val = await page.evaluate(() => localStorage.getItem("otherkey"));
  expect(val).toBe("newval\n");

  // DELETE
  await page.keyboard.type("rm /sys/fs/localstorage/mykey");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000); // wait for postMessage to propagate

  const delVal = await page.evaluate(() => localStorage.getItem("mykey"));
  expect(delVal).toBeNull();
});
