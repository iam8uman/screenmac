import { expect, test } from "@playwright/test";
import { surface, waitForEditor } from "./helpers";

// The mouse wheel over the embedded editor must scroll the page, not get swallowed by the canvas.
test("wheel over the landing page editor scrolls the page", async ({ page, isMobile }) => {
  test.skip(isMobile, "Wheel events are a desktop pointer behavior");
  await page.goto("/");
  await surface(page).scrollIntoViewIfNeeded();
  await waitForEditor(page);
  const box = await surface(page).boundingBox();
  if (!box) throw new Error("Editor surface is not laid out");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeGreaterThan(before + 200);

  // And back up.
  const mid = await page.evaluate(() => window.scrollY);
  await page.mouse.move(box.x + box.width / 2, Math.max(10, box.y - (mid - before) + box.height / 2));
  await page.mouse.wheel(0, -400);
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeLessThan(mid - 100);
});
