import { expect, test } from "@playwright/test";
import { annotationCount, dragOnCanvas, editor, tool, waitForEditor } from "./helpers";

test("hero pill wraps on a sentence, not mid-word", async ({ page }) => {
  await page.goto("/");
  const pill = page.getByRole("link", { name: /Free for macOS/ });
  await expect(pill).toContainText("Install it in one line");
  const overflow = await pill.evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

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

test("background presets are on screen and change the frame", async ({ page }) => {
  await page.goto("/");
  await waitForEditor(page);
  const dusk = editor(page).getByRole("radio", { name: "Dusk background" });
  await dusk.scrollIntoViewIfNeeded();
  await expect(dusk).toBeVisible();
  await dusk.click();
  await expect(dusk).toBeChecked();
  await expect(editor(page).getByRole("radio", { name: "Iris background" })).not.toBeChecked();
});

test("phone visitors can send the install link to their Mac", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#install");
  // Headless Chromium has no share sheet, so the button falls back to copying the link.
  await page.evaluate(() => Object.defineProperty(navigator, "share", { value: undefined, configurable: true }));
  const card = page.getByTestId("send-to-mac");
  await expect(card).toBeVisible();
  await card.getByRole("button", { name: "Send the link to my Mac" }).click();
  await expect(card.getByRole("button", { name: "Link copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("https://screenmac.vercel.app/#install");
});
