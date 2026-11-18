import { describe, expect, it } from "vitest";
import { computeFrameLayout, DEFAULT_FRAME, unitFor } from "./frame";

describe("frame layout", () => {
  it("scales the unit with image width within bounds", () => {
    expect(unitFor(1000)).toBe(1);
    expect(unitFor(2880)).toBe(2.88);
    expect(unitFor(100)).toBe(0.5);
    expect(unitFor(10000)).toBe(4);
  });

  it("adds padding and a title bar", () => {
    const l = computeFrameLayout({ width: 1000, height: 600 }, { ...DEFAULT_FRAME, style: "window", paddingPercent: 10 });
    expect(l.barHeight).toBe(34);
    expect(l.width).toBe(1200);
    expect(l.height).toBe(600 + 34 + 200);
    expect(l.image).toEqual({ x: 100, y: 134, width: 1000, height: 600 });
  });

  it("keeps the image size with no frame and no padding", () => {
    const l = computeFrameLayout({ width: 800, height: 500 }, { ...DEFAULT_FRAME, style: "none", paddingPercent: 0 });
    expect(l).toMatchObject({ width: 800, height: 500, barHeight: 0, image: { x: 0, y: 0, width: 800, height: 500 } });
  });

  it("clamps padding to 20 percent", () => {
    const l = computeFrameLayout({ width: 1000, height: 600 }, { ...DEFAULT_FRAME, style: "none", paddingPercent: 90 });
    expect(l.width).toBe(1400);
  });
});
