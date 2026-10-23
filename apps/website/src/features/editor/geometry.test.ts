import { describe, expect, it } from "vitest";
import {
  clampRect,
  getBounds,
  hitTest,
  isNegligible,
  normalizeRect,
  resizeAnnotation,
  resizeRect,
  simplifyStroke,
  snapAngle,
  squareFrom,
  translateAnnotation,
} from "./geometry";
import type { Annotation, SegmentAnnotation, ShapeAnnotation } from "./model";

const arrow: SegmentAnnotation = { id: "a", kind: "arrow", start: { x: 0, y: 0 }, end: { x: 100, y: 0 }, color: "#000", strokeWidth: 6 };
const box: ShapeAnnotation = { id: "r", kind: "rectangle", rect: { x: 10, y: 10, width: 100, height: 50 }, color: "#000", strokeWidth: 4, filled: false };

describe("geometry", () => {
  it("normalizes rectangles dragged in any direction", () => {
    expect(normalizeRect({ x: 50, y: 40 }, { x: 10, y: 5 })).toEqual({ x: 10, y: 5, width: 40, height: 35 });
  });

  it("clamps rectangles to the image", () => {
    expect(clampRect({ x: -10, y: 90, width: 50, height: 50 }, { width: 100, height: 100 })).toEqual({ x: 0, y: 90, width: 40, height: 10 });
  });

  it("hits arrows near the shaft and misses far away", () => {
    expect(hitTest([arrow], { x: 50, y: 4 }, 2)?.id).toBe("a");
    expect(hitTest([arrow], { x: 50, y: 30 }, 2)).toBeNull();
  });

  it("hits outlined rectangles on the edge, not the hollow middle", () => {
    expect(hitTest([box], { x: 10, y: 30 }, 3)?.id).toBe("r");
    expect(hitTest([box], { x: 60, y: 35 }, 3)).toBeNull();
    expect(hitTest([{ ...box, filled: true }], { x: 60, y: 35 }, 3)?.id).toBe("r");
  });

  it("returns the topmost annotation", () => {
    const filled: ShapeAnnotation = { ...box, id: "top", filled: true };
    const under: ShapeAnnotation = { ...box, id: "under", filled: true };
    expect(hitTest([under, filled], { x: 50, y: 30 }, 0)?.id).toBe("top");
  });

  it("translates every kind without mutating the original", () => {
    const moved = translateAnnotation(arrow, 5, 7);
    expect(moved.start).toEqual({ x: 5, y: 7 });
    expect(arrow.start).toEqual({ x: 0, y: 0 });
    const counter: Annotation = { id: "c", kind: "counter", center: { x: 1, y: 1 }, value: 1, color: "#000", radius: 10 };
    expect(translateAnnotation(counter, 1, 1)).toMatchObject({ center: { x: 2, y: 2 } });
  });

  it("resizes from corners and flips past the opposite edge", () => {
    expect(resizeRect({ x: 0, y: 0, width: 10, height: 10 }, "se", { x: 20, y: 30 })).toEqual({ x: 0, y: 0, width: 20, height: 30 });
    expect(resizeRect({ x: 10, y: 10, width: 10, height: 10 }, "e", { x: 0, y: 99 })).toEqual({ x: 0, y: 10, width: 10, height: 10 });
  });

  it("moves arrow endpoints independently", () => {
    expect(resizeAnnotation(arrow, "end", { x: 3, y: 4 }).end).toEqual({ x: 3, y: 4 });
    expect(resizeAnnotation(arrow, "end", { x: 3, y: 4 }).start).toEqual({ x: 0, y: 0 });
  });

  it("snaps angles to 45° and squares shapes", () => {
    const snapped = snapAngle({ x: 0, y: 0 }, { x: 100, y: 8 });
    expect(snapped.y).toBeCloseTo(0);
    expect(squareFrom({ x: 0, y: 0 }, { x: -40, y: 10 })).toEqual({ x: -40, y: 40 });
  });

  it("bounds counters around their center", () => {
    expect(getBounds({ id: "c", kind: "counter", center: { x: 50, y: 50 }, value: 1, color: "#000", radius: 10 })).toEqual({ x: 40, y: 40, width: 20, height: 20 });
  });

  it("thins freehand points but keeps both ends", () => {
    const points = Array.from({ length: 20 }, (_, i) => ({ x: i * 0.5, y: 0 }));
    const thin = simplifyStroke(points, 2);
    expect(thin.length).toBeLessThan(points.length);
    expect(thin[0]).toEqual(points[0]);
    expect(thin.at(-1)).toEqual(points.at(-1));
  });

  it("treats accidental clicks as negligible", () => {
    expect(isNegligible({ ...arrow, end: { x: 2, y: 1 } })).toBe(true);
    expect(isNegligible(arrow)).toBe(false);
    expect(isNegligible({ id: "t", kind: "text", origin: { x: 0, y: 0 }, text: "   ", color: "#000", fontSize: 20, style: "plain" })).toBe(true);
  });
});
