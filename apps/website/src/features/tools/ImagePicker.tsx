"use client";

import { useEffect, useId, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/Button";

export interface PickedImage {
  name: string;
  type: string;
  bytes: number;
  bitmap: ImageBitmap;
  width: number;
  height: number;
}

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];

async function decode(file: File): Promise<PickedImage> {
  if (!ACCEPT.includes(file.type)) {
    throw new Error("That file isn't a PNG, JPEG, WebP or GIF image. For HEIC, open it in Preview and export a PNG first.");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image couldn't be decoded by your browser.");
  }
  return { name: file.name || "pasted-image.png", type: file.type, bytes: file.size, bitmap, width: bitmap.width, height: bitmap.height };
}

/** Open, drop or paste one image. It is decoded in the browser and never uploaded. */
export function ImagePicker({ onPick, compact = false }: { onPick: (image: PickedImage) => void; compact?: boolean }) {
  const inputId = useId();
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pickRef = useRef(onPick);
  useEffect(() => {
    pickRef.current = onPick;
  }, [onPick]);

  async function load(file: File | undefined | null) {
    if (!file) return;
    try {
      pickRef.current(await decode(file));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "This image couldn't be opened.");
    }
  }

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) {
        e.preventDefault();
        decode(file)
          .then((img) => {
            pickRef.current(img);
            setError(null);
          })
          .catch((err: unknown) => setError(err instanceof Error ? err.message : "This image couldn't be opened."));
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void load(e.dataTransfer.files[0]);
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed text-center transition-colors ${compact ? "p-4" : "p-8"} ${over ? "border-accent bg-accent-soft" : "border-line-strong bg-paper"}`}
      >
        <label htmlFor={inputId} className={buttonClass("primary", "md", "cursor-pointer")}>
          Open an image
        </label>
        <input
          id={inputId}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          onChange={(e) => {
            void load(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <p className="text-sm text-ink-muted">or drop it here, or paste with Command-V. It stays in your browser.</p>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The browser could not encode this image."))), mime, quality);
  });
}

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export const fieldClass =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
export const labelClass = "block text-sm font-medium text-ink-muted";
export const chipClass = (active: boolean) =>
  `rounded-xl border px-3 py-2 text-left text-sm transition-colors ${active ? "border-accent bg-accent-soft text-ink" : "border-line-strong bg-paper text-ink-muted hover:text-ink"}`;
