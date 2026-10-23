import { describe, expect, it } from "vitest";
import { exportFilename } from "./export";
import { computeLayout, imageToOutput, outputToImage } from "./render";
import { DEFAULT_BACKDROP } from "./model";

describe("export helpers", () => {
  it("names files like a Mac screenshot", () => {
    expect(exportFilename("metrics", new Date(2026, 9, 23, 9, 5, 7))).toBe("Screenmac metrics 2026-10-23 at 09.05.07.png");
    expect(exportFilename("../../etc", new Date(2026, 0, 1, 0, 0, 0))).toMatch(/^Screenmac etc /);
  });
});

describe("layout", () => {
  const size = { width: 1600, height: 1000 };

  it("uses the full image with no crop or backdrop", () => {
    const layout = computeLayout({ crop: null, backdrop: DEFAULT_BACKDROP }, size);
    expect(layout).toMatchObject({ outputWidth: 1600, outputHeight: 1000, offset: { x: 0, y: 0 }, radius: 0 });
  });

  it("adds proportional padding for backdrops", () => {
    const layout = computeLayout({ crop: null, backdrop: { ...DEFAULT_BACKDROP, id: "violet", padding: 5 } }, size);
    expect(layout.offset).toEqual({ x: 80, y: 80 });
    expect(layout.outputWidth).toBe(1760);
  });

  it("round-trips points through crop and padding", () => {
    const layout = computeLayout({ crop: { x: 200, y: 100, width: 400, height: 300 }, backdrop: { ...DEFAULT_BACKDROP, id: "mint", padding: 10 } }, size);
    const p = { x: 250, y: 180 };
    expect(outputToImage(layout, imageToOutput(layout, p))).toEqual(p);
    expect(imageToOutput(layout, { x: 200, y: 100 })).toEqual(layout.offset);
  });
});
