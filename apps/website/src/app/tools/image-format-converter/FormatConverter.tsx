"use client";

import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { formatBytes } from "@/features/tools/fileSize";
import { FORMATS, formatInfo, outputName, percentChange, scaledSize, type OutputFormat } from "@/features/tools/convert";
import { canvasToBlob, chipClass, download, ImagePicker, labelClass, type PickedImage } from "@/features/tools/ImagePicker";

const SCALES = [100, 75, 50, 25];

export function FormatConverter() {
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState(85);
  const [scale, setScale] = useState(100);
  const [result, setResult] = useState<{ blob: Blob; width: number; height: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!picked) return;
    let cancelled = false;
    const run = async () => {
      setBusy(true);
      setError(null);
      try {
        const info = formatInfo(format);
        const { width, height } = scaledSize(picked.width, picked.height, scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("This browser could not create a drawing surface.");
        if (format === "jpeg") {
          // JPEG has no transparency: put transparent areas on white instead of black.
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(picked.bitmap, 0, 0, width, height);
        const blob = await canvasToBlob(canvas, info.mime, info.lossy ? quality / 100 : undefined);
        if (blob.type !== info.mime) throw new Error(`This browser can't save ${info.label} files. Try PNG or JPG, or another browser.`);
        if (!cancelled) setResult({ blob, width, height });
      } catch (e) {
        if (!cancelled) {
          setResult(null);
          setError(e instanceof Error ? e.message : "Conversion failed.");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    const t = window.setTimeout(run, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [picked, format, quality, scale]);

  const info = formatInfo(format);

  return (
    <div>
      <ImagePicker onPick={setPicked} compact={picked !== null} />
      {picked && (
        <p className="mt-3 text-sm text-ink-muted">
          <strong className="text-ink">{picked.name}</strong>: {picked.width} × {picked.height} px, {formatBytes(picked.bytes)}
        </p>
      )}

      <fieldset className="mt-6">
        <legend className={labelClass}>Convert to</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {FORMATS.map((f) => (
            <button key={f.id} type="button" aria-pressed={format === f.id} className={chipClass(format === f.id)} onClick={() => setFormat(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </fieldset>

      {info.lossy && (
        <label className={`${labelClass} mt-5`}>
          Quality: {quality}
          <input type="range" min="40" max="100" step="1" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-2 w-full accent-[var(--color-accent)]" />
        </label>
      )}

      <fieldset className="mt-5">
        <legend className={labelClass}>Size</legend>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {SCALES.map((p) => (
            <button key={p} type="button" aria-pressed={scale === p} className={chipClass(scale === p)} onClick={() => setScale(p)}>
              {p}%
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 rounded-2xl bg-paper-sunk p-5" aria-live="polite">
        {!picked && <p className="text-ink-muted">Open an image to see the converted size.</p>}
        {picked && busy && !result && <p className="text-ink-muted">Converting…</p>}
        {error && (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}
        {picked && result && !error && (
          <>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Result</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">
              {formatBytes(result.blob.size)}{" "}
              <span className="text-base font-normal text-ink-muted">
                ({percentChange(picked.bytes, result.blob.size) > 0 ? "+" : ""}
                {percentChange(picked.bytes, result.blob.size)}%), {result.width} × {result.height} px
              </span>
            </p>
            <button type="button" className={buttonClass("accent", "md", "mt-4")} onClick={() => download(result.blob, outputName(picked.name, format))}>
              Download {outputName(picked.name, format)}
            </button>
          </>
        )}
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-faint">
        The file is redrawn from its pixels, so the download carries no EXIF, XMP or location data from the original. JPG has no transparency, so transparent areas become white.
      </p>
    </div>
  );
}
