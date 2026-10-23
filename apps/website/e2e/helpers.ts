import { expect, type Locator, type Page } from "@playwright/test";

// Next keeps the previous route mounted but hidden, so always target the visible editor.
export const editor = (page: Page) => page.locator("[data-editor-root]").filter({ visible: true }).first();
export const surface = (page: Page) => editor(page).getByTestId("editor-surface");
export const canvas = (page: Page) => editor(page).getByTestId("editor-canvas");

/** Number of annotations, read from the canvas' accessible label. */
export async function annotationCount(page: Page): Promise<number> {
  const label = (await canvas(page).getAttribute("aria-label")) ?? "";
  const match = label.match(/(\d+) annotations?\./);
  return match ? Number(match[1]) : -1;
}

export async function waitForEditor(page: Page) {
  await expect(surface(page)).toBeVisible();
}

/** Drag across the canvas between two points given as fractions of its size. */
export async function dragOnCanvas(page: Page, from: [number, number], to: [number, number], target?: Locator) {
  const box = await (target ?? surface(page)).boundingBox();
  if (!box) throw new Error("Editor surface is not laid out");
  await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1]);
  await page.mouse.down();
  const steps = 8;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    await page.mouse.move(
      box.x + box.width * (from[0] + (to[0] - from[0]) * t),
      box.y + box.height * (from[1] + (to[1] - from[1]) * t),
    );
  }
  await page.mouse.up();
}

export async function clickOnCanvas(page: Page, at: [number, number]) {
  const box = await surface(page).boundingBox();
  if (!box) throw new Error("Editor surface is not laid out");
  await page.mouse.click(box.x + box.width * at[0], box.y + box.height * at[1]);
}

export const tool = (page: Page, name: string) =>
  editor(page).getByRole("toolbar", { name: "Annotation tools" }).getByRole("button", { name, exact: true });
