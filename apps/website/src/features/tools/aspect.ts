/** Aspect ratio and crop maths for the aspect ratio calculator. Pure functions. */

export interface Size {
  width: number;
  height: number;
}

export interface Ratio {
  w: number;
  h: number;
}

export const RATIO_PRESETS: readonly Ratio[] = [
  { w: 1, h: 1 },
  { w: 4, h: 3 },
  { w: 3, h: 2 },
  { w: 16, h: 10 },
  { w: 16, h: 9 },
  { w: 2, h: 1 },
  { w: 4, h: 5 },
  { w: 9, h: 16 },
];

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

/** 1920×1080 → 16:9. Returns null for empty or invalid sizes. */
export function simplify(size: Size): Ratio | null {
  if (!(size.width > 0) || !(size.height > 0)) return null;
  const d = gcd(size.width, size.height) || 1;
  return { w: Math.round(size.width) / d, h: Math.round(size.height) / d };
}

/** The nearest preset to a size, and how far off it is (0 = exact). */
export function nearestPreset(size: Size): { ratio: Ratio; off: number } | null {
  if (!(size.width > 0) || !(size.height > 0)) return null;
  const actual = size.width / size.height;
  let best: { ratio: Ratio; off: number } | null = null;
  for (const ratio of RATIO_PRESETS) {
    const off = Math.abs(actual - ratio.w / ratio.h) / (ratio.w / ratio.h);
    if (!best || off < best.off) best = { ratio, off };
  }
  return best;
}

/** Height for a new width (or width for a new height) at the same ratio, rounded to whole pixels. */
export function heightForWidth(size: Size, width: number): number {
  if (!(size.width > 0) || !(size.height > 0) || !(width > 0)) return 0;
  return Math.round((width * size.height) / size.width);
}

export function widthForHeight(size: Size, height: number): number {
  if (!(size.width > 0) || !(size.height > 0) || !(height > 0)) return 0;
  return Math.round((height * size.width) / size.height);
}

/** The largest centred crop of `size` that has `ratio`, in whole pixels. */
export function largestCrop(size: Size, ratio: Ratio): (Size & { x: number; y: number }) | null {
  if (!(size.width > 0) || !(size.height > 0) || !(ratio.w > 0) || !(ratio.h > 0)) return null;
  const target = ratio.w / ratio.h;
  let width = size.width;
  let height = Math.round(width / target);
  if (height > size.height) {
    height = size.height;
    width = Math.round(height * target);
  }
  width = Math.min(width, size.width);
  height = Math.min(height, size.height);
  return { width, height, x: Math.floor((size.width - width) / 2), y: Math.floor((size.height - height) / 2) };
}

/** Padding needed to fit `size` into `ratio` without cropping (letterbox), split evenly. */
export function padToRatio(size: Size, ratio: Ratio): (Size & { padX: number; padY: number }) | null {
  if (!(size.width > 0) || !(size.height > 0) || !(ratio.w > 0) || !(ratio.h > 0)) return null;
  const target = ratio.w / ratio.h;
  let width = size.width;
  let height = size.height;
  if (size.width / size.height > target) height = Math.round(size.width / target);
  else width = Math.round(size.height * target);
  return { width, height, padX: Math.floor((width - size.width) / 2), padY: Math.floor((height - size.height) / 2) };
}

export const ratioLabel = (r: Ratio) => `${r.w}:${r.h}`;
