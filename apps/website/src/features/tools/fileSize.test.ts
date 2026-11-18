import { describe, expect, it } from "vitest";
import { bitrateFromSample, bytesFor, formatBytes, formatKbps, maxBitrateForTarget, sizeFromBitrates, toSeconds } from "./fileSize";

describe("file size maths", () => {
  it("converts a duration to seconds", () => {
    expect(toSeconds({ hours: 1, minutes: 2, seconds: 3 })).toBe(3723);
    expect(toSeconds({ hours: 0, minutes: -5, seconds: 0 })).toBe(0);
  });

  it("computes bytes from kbps and seconds", () => {
    // 8,000 kbps for 1 s = 8,000,000 bits = 1,000,000 bytes.
    expect(bytesFor(8000, 1)).toBe(1_000_000);
    expect(bytesFor(0, 10)).toBe(0);
    expect(bytesFor(1000, Number.NaN)).toBe(0);
  });

  it("adds video and audio bitrates", () => {
    // 8 Mbps video + 0 audio for 60 s = 60 MB.
    expect(sizeFromBitrates(8, 0, 60)).toBe(60_000_000);
    // 1 Mbps + 128 kbps for 10 s = 1,410,000 bytes.
    expect(sizeFromBitrates(1, 128, 10)).toBe(1_410_000);
  });

  it("measures a bitrate from a sample file and inverts the size formula", () => {
    const kbps = bitrateFromSample(60, 60);
    expect(kbps).toBe(8000);
    expect(bytesFor(kbps, 60)).toBe(60_000_000);
  });

  it("finds the maximum bitrate for a size limit", () => {
    expect(maxBitrateForTarget(25, 100)).toBe(2000);
    expect(maxBitrateForTarget(0, 100)).toBe(0);
  });

  it("formats sizes and bitrates", () => {
    expect(formatBytes(950_000)).toBe("950 KB");
    expect(formatBytes(1_240_000)).toBe("1.2 MB");
    expect(formatBytes(12_400_000)).toBe("12 MB");
    expect(formatBytes(1_210_000_000)).toBe("1.21 GB");
    expect(formatKbps(850)).toBe("850 kbps");
    expect(formatKbps(4200)).toBe("4.2 Mbps");
  });
});
