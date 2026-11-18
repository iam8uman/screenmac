import { describe, expect, it } from "vitest";
import { gcd, heightForWidth, largestCrop, nearestPreset, padToRatio, simplify, widthForHeight } from "./aspect";

describe("aspect ratio maths", () => {
  it("simplifies sizes to ratios", () => {
    expect(gcd(1920, 1080)).toBe(120);
    expect(simplify({ width: 1920, height: 1080 })).toEqual({ w: 16, h: 9 });
    expect(simplify({ width: 2880, height: 1800 })).toEqual({ w: 8, h: 5 });
    expect(simplify({ width: 0, height: 10 })).toBeNull();
  });

  it("finds the nearest preset", () => {
    expect(nearestPreset({ width: 2880, height: 1800 })?.ratio).toEqual({ w: 16, h: 10 });
    expect(nearestPreset({ width: 1366, height: 768 })?.ratio).toEqual({ w: 16, h: 9 });
  });

  it("scales while keeping the ratio", () => {
    expect(heightForWidth({ width: 1920, height: 1080 }, 1280)).toBe(720);
    expect(widthForHeight({ width: 1920, height: 1080 }, 1080 / 2)).toBe(960);
  });

  it("finds the largest centred crop", () => {
    expect(largestCrop({ width: 1920, height: 1080 }, { w: 1, h: 1 })).toEqual({ width: 1080, height: 1080, x: 420, y: 0 });
    expect(largestCrop({ width: 1000, height: 2000 }, { w: 4, h: 5 })).toEqual({ width: 1000, height: 1250, x: 0, y: 375 });
  });

  it("pads to a ratio without cropping", () => {
    expect(padToRatio({ width: 1600, height: 1000 }, { w: 1, h: 1 })).toEqual({ width: 1600, height: 1600, padX: 0, padY: 300 });
    expect(padToRatio({ width: 1000, height: 1000 }, { w: 16, h: 9 })).toEqual({ width: 1778, height: 1000, padX: 389, padY: 0 });
  });
});
