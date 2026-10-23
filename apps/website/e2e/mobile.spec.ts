import { expect, test } from "@playwright/test";
import { annotationCount, dragOnCanvas, tool, waitForEditor } from "./helpers";

test("mobile menu opens, navigates, and closes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Pricing" }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(menu).toBeHidden();
});

test("no horizontal scrolling on a phone", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("the editor works with touch-sized layout", async ({ page }) => {
  await page.goto("/");
  await waitForEditor(page);
  await page.locator("[data-editor-root]").scrollIntoViewIfNeeded();
  const before = await annotationCount(page);
  await tool(page, "Rectangle").click();
  await dragOnCanvas(page, [0.2, 0.2], [0.6, 0.6]);
  await expect.poll(() => annotationCount(page)).toBe(before + 1);
});
