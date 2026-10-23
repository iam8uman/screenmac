import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { annotationCount, canvas, clickOnCanvas, dragOnCanvas, editor, surface, tool, waitForEditor } from "./helpers";

async function openCleanEditor(page: Page) {
  await page.goto("/editor");
  await waitForEditor(page);
  await expect.poll(() => annotationCount(page)).toBe(0);
}

/** Decode a PNG in the browser and sample pixels from it. */
async function decodePng(page: Page, bytes: Buffer, points: [number, number][]) {
  return page.evaluate(
    async ({ b64, pts }) => {
      const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
      const bitmap = await createImageBitmap(blob);
      const c = document.createElement("canvas");
      c.width = bitmap.width;
      c.height = bitmap.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      return {
        width: bitmap.width,
        height: bitmap.height,
        pixels: pts.map(([x, y]) => Array.from(ctx.getImageData(Math.round(x * bitmap.width), Math.round(y * bitmap.height), 1, 1).data)),
      };
    },
    { b64: bytes.toString("base64"), pts: points },
  );
}

test("showcase opens with a finished example that Reset clears and Undo restores", async ({ page }) => {
  await page.goto("/");
  await waitForEditor(page);
  await expect.poll(() => annotationCount(page)).toBe(6);
  await editor(page).getByRole("button", { name: "Reset" }).click();
  await expect.poll(() => annotationCount(page)).toBe(0);
  await expect(editor(page).getByText("Reset to the original image.")).toBeVisible();
  await editor(page).getByRole("button", { name: "Undo", exact: true }).first().click();
  await expect.poll(() => annotationCount(page)).toBe(6);
});

test("draws an arrow, then undo and redo it", async ({ page }) => {
  await openCleanEditor(page);
  const undo = editor(page).getByRole("button", { name: "Undo", exact: true });
  const redo = editor(page).getByRole("button", { name: "Redo", exact: true });
  await expect(undo).toBeDisabled();

  await tool(page, "Arrow").click();
  await dragOnCanvas(page, [0.2, 0.2], [0.5, 0.45]);
  await expect.poll(() => annotationCount(page)).toBe(1);
  await expect(undo).toBeEnabled();

  await undo.click();
  await expect.poll(() => annotationCount(page)).toBe(0);
  await expect(redo).toBeEnabled();
  await redo.click();
  await expect.poll(() => annotationCount(page)).toBe(1);

  // Keyboard history too.
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(() => annotationCount(page)).toBe(0);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect.poll(() => annotationCount(page)).toBe(1);
});

test("a click without a drag does not create an empty shape", async ({ page }) => {
  await openCleanEditor(page);
  await tool(page, "Rectangle").click();
  await clickOnCanvas(page, [0.4, 0.4]);
  await expect.poll(() => annotationCount(page)).toBe(0);
});

test("every drawing tool produces an annotation", async ({ page }) => {
  await openCleanEditor(page);
  const drag = ["Arrow", "Line", "Rectangle", "Filled rectangle", "Ellipse", "Highlighter", "Pencil", "Blur", "Pixelate", "Redact"];
  let expected = 0;
  for (const [index, name] of drag.entries()) {
    await tool(page, name).click();
    const y = 0.08 + index * 0.085;
    await dragOnCanvas(page, [0.15, y], [0.45, y + 0.06]);
    expected += 1;
    await expect.poll(() => annotationCount(page), { message: name }).toBe(expected);
  }
  await tool(page, "Counter").click();
  await clickOnCanvas(page, [0.7, 0.2]);
  await clickOnCanvas(page, [0.7, 0.4]);
  expected += 2;
  await expect.poll(() => annotationCount(page)).toBe(expected);
});

test("text: click, type, Return commits; double-click edits", async ({ page }) => {
  await openCleanEditor(page);
  await tool(page, "Text").click();
  await clickOnCanvas(page, [0.3, 0.3]);
  const input = editor(page).getByLabel("Annotation text");
  await expect(input).toBeFocused();
  await input.fill("Checkout breaks here");
  await input.press("Enter");
  await expect(input).toHaveCount(0);
  await expect.poll(() => annotationCount(page)).toBe(1);
  // Committing text returns to Select so the label can be moved straight away.
  await expect(tool(page, "Select")).toHaveAttribute("aria-pressed", "true");

  const box = (await surface(page).boundingBox())!;
  await page.mouse.dblclick(box.x + box.width * 0.33, box.y + box.height * 0.3);
  await expect(input).toBeVisible();
  await input.fill("");
  await input.press("Enter");
  await expect.poll(() => annotationCount(page)).toBe(0);
});

test("select, move with arrow keys, duplicate, and delete", async ({ page }) => {
  await openCleanEditor(page);
  await tool(page, "Rectangle").click();
  await dragOnCanvas(page, [0.3, 0.3], [0.6, 0.6]);
  await expect.poll(() => annotationCount(page)).toBe(1);
  // A new shape is selected, so the inspector shows selection actions.
  const selection = editor(page).getByRole("complementary", { name: "Inspector" });
  await expect(selection.getByRole("button", { name: "Delete" })).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ControlOrMeta+d");
  await expect.poll(() => annotationCount(page)).toBe(2);
  await page.keyboard.press("Backspace");
  await expect.poll(() => annotationCount(page)).toBe(1);

  // Drag-move with the select tool, then Escape deselects.
  await tool(page, "Select").click();
  await dragOnCanvas(page, [0.302, 0.45], [0.2, 0.35]);
  await page.keyboard.press("Escape");
  await expect(selection.getByRole("button", { name: "Delete" })).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+z"); // undo the move
  await expect.poll(() => annotationCount(page)).toBe(1);
});

test("Escape cancels a drag in progress without adding history", async ({ page }) => {
  await openCleanEditor(page);
  await tool(page, "Ellipse").click();
  const box = (await surface(page).boundingBox())!;
  await page.mouse.move(box.x + 100, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 260, box.y + 220, { steps: 5 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect.poll(() => annotationCount(page)).toBe(0);
  await expect(editor(page).getByRole("button", { name: "Undo", exact: true })).toBeDisabled();
});

test("single-key shortcuts switch tools", async ({ page }) => {
  await openCleanEditor(page);
  await clickOnCanvas(page, [0.5, 0.5]); // focus the editor (arrow click draws nothing)
  for (const [key, name] of [["r", "Rectangle"], ["t", "Text"], ["b", "Blur"], ["v", "Select"], ["a", "Arrow"]] as const) {
    await page.keyboard.press(key);
    await expect(tool(page, name)).toHaveAttribute("aria-pressed", "true");
  }
});

test("switching samples clears marks and Undo brings them back", async ({ page }) => {
  await openCleanEditor(page);
  await tool(page, "Arrow").click();
  await dragOnCanvas(page, [0.2, 0.2], [0.5, 0.5]);
  await editor(page).getByTestId("sample-metrics").click();
  await expect(editor(page).getByTestId("sample-metrics")).toHaveAttribute("aria-selected", "true");
  await expect(canvas(page)).toHaveAttribute("aria-label", /Analytics dashboard/);
  await expect.poll(() => annotationCount(page)).toBe(0);
  await editor(page).getByRole("button", { name: "Undo", exact: true }).first().click();
  await expect(editor(page).getByTestId("sample-code-review")).toHaveAttribute("aria-selected", "true");
  await expect.poll(() => annotationCount(page)).toBe(1);
});

test("crop changes the exported size; Escape cancels a crop", async ({ page }) => {
  await openCleanEditor(page);
  await tool(page, "Crop").click();
  await dragOnCanvas(page, [0.25, 0.25], [0.75, 0.75]);
  await editor(page).getByRole("button", { name: "Apply crop" }).click();
  const dims = editor(page).getByText(/^\d+ × \d+$/);
  const [w, h] = ((await dims.textContent()) ?? "").split(" × ").map(Number);
  expect(Math.abs(w - 800)).toBeLessThanOrEqual(3);
  expect(Math.abs(h - 500)).toBeLessThanOrEqual(3);

  const download = page.waitForEvent("download");
  await editor(page).getByRole("button", { name: "Export PNG" }).click();
  const file = await (await download).path();
  const { width, height } = await decodePng(page, await readFile(file!), []);
  expect([width, height]).toEqual([w, h]);

  await tool(page, "Crop").click();
  await dragOnCanvas(page, [0.1, 0.1], [0.3, 0.3]);
  await page.keyboard.press("Escape");
  await expect(dims).toHaveText(`${w} × ${h}`);
});

test("exports a real PNG with redaction flattened into the pixels", async ({ page }) => {
  await openCleanEditor(page);
  await tool(page, "Redact").click();
  await dragOnCanvas(page, [0.1, 0.1], [0.4, 0.4]);
  await expect.poll(() => annotationCount(page)).toBe(1);

  const downloadPromise = page.waitForEvent("download");
  await editor(page).getByRole("button", { name: "Export PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^Screenmac code-review \d{4}-\d{2}-\d{2} at \d{2}\.\d{2}\.\d{2}\.png$/);
  const bytes = await readFile((await download.path())!);
  expect(bytes.subarray(1, 4).toString()).toBe("PNG");

  const { width, height, pixels } = await decodePng(page, bytes, [
    [0.2, 0.2],
    [0.3, 0.3],
    [0.15, 0.35],
  ]);
  expect([width, height]).toEqual([1600, 1000]);
  for (const [r, g, b, a] of pixels) {
    expect([r, g, b, a]).toEqual([0x0e, 0x0e, 0x12, 255]);
  }
  await expect(editor(page).getByText(/^Exported Screenmac/)).toBeVisible();
});

test("background adds padding to the export", async ({ page }) => {
  await openCleanEditor(page);
  await editor(page).getByRole("radio", { name: "Iris background" }).click();
  const download = page.waitForEvent("download");
  await editor(page).getByRole("button", { name: "Export PNG" }).click();
  const { width, height } = await decodePng(page, await readFile((await (await download).path())!), []);
  expect(width).toBeGreaterThan(1600);
  expect(height).toBeGreaterThan(1000);
});

test("copy succeeds when the clipboard allows it", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openCleanEditor(page);
  await editor(page).getByRole("button", { name: "Copy", exact: true }).click();
  await expect(editor(page).getByText("Copied to the clipboard as PNG.")).toBeVisible();
  const types = await page.evaluate(async () => (await navigator.clipboard.read())[0]?.types ?? []);
  expect(types).toContain("image/png");
});

test("copy reports failure honestly and offers export when images can't be copied", async ({ page }) => {
  await page.addInitScript(() => {
    // Simulate a browser without image clipboard support.
    // @ts-expect-error deleting a global on purpose
    delete window.ClipboardItem;
  });
  await openCleanEditor(page);
  await editor(page).getByRole("button", { name: "Copy", exact: true }).click();
  await expect(editor(page).getByText(/can't put images on the clipboard/)).toBeVisible();
  const download = page.waitForEvent("download");
  // The error toast's own action exports.
  await editor(page).getByRole("button", { name: "Export PNG" }).first().click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
});

test("opens a visitor's own image locally", async ({ page }) => {
  await openCleanEditor(page);
  // A 3×2 red PNG, generated in the page so the test needs no fixture file.
  const png = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 300;
    c.height = 200;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#c00";
    ctx.fillRect(0, 0, 300, 200);
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/png"));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  const requests: string[] = [];
  page.on("request", (r) => r.method() !== "GET" && requests.push(r.url()));
  await editor(page).getByTestId("editor-file-input").setInputFiles({ name: "my-bug.png", mimeType: "image/png", buffer: Buffer.from(png) });
  await expect(editor(page).getByRole("tab", { name: "my-bug" })).toHaveAttribute("aria-selected", "true");
  await expect(editor(page).getByText("300 × 200")).toBeVisible();
  expect(requests).toEqual([]);

  await editor(page).getByTestId("editor-file-input").setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hi") });
  await expect(editor(page).getByText(/isn't an image/)).toBeVisible();
});

test("zoom controls change scale and Fit restores it", async ({ page }) => {
  await openCleanEditor(page);
  const zoomLabel = editor(page).getByRole("button", { name: /^Zoom \d+%/ });
  const before = await zoomLabel.textContent();
  await editor(page).getByRole("button", { name: "Zoom in" }).click();
  await expect(zoomLabel).not.toHaveText(before!);
  await editor(page).getByRole("button", { name: "Fit to window", exact: true }).click();
  await expect(zoomLabel).toHaveText(before!);
});
