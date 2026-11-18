/** Helpers for the in-browser image format converter. Pure functions only. */

export type OutputFormat = "png" | "jpeg" | "webp";

export const FORMATS: readonly { id: OutputFormat; label: string; mime: string; ext: string; lossy: boolean }[] = [
  { id: "png", label: "PNG", mime: "image/png", ext: "png", lossy: false },
  { id: "jpeg", label: "JPG", mime: "image/jpeg", ext: "jpg", lossy: true },
  { id: "webp", label: "WebP", mime: "image/webp", ext: "webp", lossy: true },
];

export const formatInfo = (id: OutputFormat) => FORMATS.find((f) => f.id === id)!;

/** "Screenshot 2026-11-17 at 09.05.07.png" → "Screenshot 2026-11-17 at 09.05.07.jpg". */
export function outputName(inputName: string, format: OutputFormat): string {
  const base = inputName.replace(/\.[a-z0-9]+$/i, "").trim() || "image";
  return `${base}.${formatInfo(format).ext}`;
}

/** Scaled pixel size; never below 1 px and never above the original. */
export function scaledSize(width: number, height: number, percent: number): { width: number; height: number } {
  const p = Math.min(100, Math.max(1, percent || 100)) / 100;
  return { width: Math.max(1, Math.round(width * p)), height: Math.max(1, Math.round(height * p)) };
}

/** Percentage change from one size to another, e.g. -72 for a file 72% smaller. */
export function percentChange(before: number, after: number): number {
  if (!(before > 0)) return 0;
  return Math.round(((after - before) / before) * 100);
}
