import { describe, expect, it } from "vitest";
import { outputName, percentChange, scaledSize } from "./convert";

describe("converter helpers", () => {
  it("swaps the extension", () => {
    expect(outputName("Screenshot 2026-11-17 at 09.05.07.png", "jpeg")).toBe("Screenshot 2026-11-17 at 09.05.07.jpg");
    expect(outputName("photo.HEIC", "webp")).toBe("photo.webp");
    expect(outputName("", "png")).toBe("image.png");
  });

  it("scales within bounds", () => {
    expect(scaledSize(2880, 1800, 50)).toEqual({ width: 1440, height: 900 });
    expect(scaledSize(10, 10, 500)).toEqual({ width: 10, height: 10 });
    expect(scaledSize(3, 3, 1)).toEqual({ width: 1, height: 1 });
  });

  it("reports the size change", () => {
    expect(percentChange(1000, 280)).toBe(-72);
    expect(percentChange(0, 10)).toBe(0);
  });
});
