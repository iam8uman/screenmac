import type { EditorDocument, ImageSize } from "./model";
import { renderDocument, type ImageSource } from "./render";

export interface ExportInput {
  image: ImageSource;
  imageSize: ImageSize;
  doc: EditorDocument;
  fontFamily?: string;
}

/** Flatten the document into a brand-new canvas at full output resolution. */
export function renderToCanvas(input: ExportInput): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not create a drawing surface.");
  renderDocument(ctx, { ...input });
  return canvas;
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The browser did not produce a PNG. Try a smaller crop or another browser."));
    }, "image/png");
  });
}

export async function exportPng(input: ExportInput): Promise<Blob> {
  return canvasToPng(renderToCanvas(input));
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function exportFilename(sampleId: string, now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} at ${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
  const safe = sampleId.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "") || "capture";
  return `Screenmac ${safe} ${stamp}.png`;
}

export type ClipboardSupport = "supported" | "unsupported";

export function clipboardSupport(): ClipboardSupport {
  if (typeof window === "undefined") return "unsupported";
  if (!window.isSecureContext) return "unsupported";
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) return "unsupported";
  return "supported";
}

/**
 * Copy a PNG to the clipboard. Safari requires the ClipboardItem to be created
 * synchronously inside the user gesture, so we hand it a promise.
 */
export async function copyPng(produce: () => Promise<Blob>): Promise<void> {
  if (clipboardSupport() === "unsupported") {
    throw new Error("This browser can't copy images. Use Export PNG instead.");
  }
  const item = new ClipboardItem({ "image/png": produce() });
  try {
    await navigator.clipboard.write([item]);
  } catch (error) {
    const reason = error instanceof Error && error.name === "NotAllowedError" ? " Clipboard permission was denied." : "";
    throw new Error(`Copy failed.${reason} Use Export PNG instead.`);
  }
}
