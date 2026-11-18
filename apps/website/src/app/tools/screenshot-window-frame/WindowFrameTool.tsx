"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { BACKGROUNDS, computeFrameLayout, DEFAULT_FRAME, drawFrame, type FrameOptions, type FrameStyle } from "@/features/tools/frame";
import { canvasToBlob, chipClass, download, fieldClass, ImagePicker, labelClass, type PickedImage } from "@/features/tools/ImagePicker";

const STYLES: { id: FrameStyle; label: string }[] = [
  { id: "window", label: "Window bar" },
  { id: "browser", label: "Browser bar" },
  { id: "none", label: "No frame" },
];

export function WindowFrameTool() {
  const [picked, setPicked] = useState<PickedImage | null>(null);
  const [opts, setOpts] = useState<FrameOptions>(DEFAULT_FRAME);
  const canvas = useRef<HTMLCanvasElement>(null);
  const set = <K extends keyof FrameOptions>(k: K, v: FrameOptions[K]) => setOpts((o) => ({ ...o, [k]: v }));

  useEffect(() => {
    const c = canvas.current;
    if (!c || !picked) return;
    const layout = computeFrameLayout(picked, opts);
    c.width = layout.width;
    c.height = layout.height;
    const ctx = c.getContext("2d");
    if (ctx) drawFrame(ctx, picked.bitmap, layout, opts);
  }, [picked, opts]);

  async function save() {
    if (!canvas.current || !picked) return;
    const blob = await canvasToBlob(canvas.current, "image/png");
    download(blob, `${picked.name.replace(/\.[a-z0-9]+$/i, "") || "screenshot"} framed.png`);
  }

  return (
    <div>
      <ImagePicker onPick={setPicked} compact={picked !== null} />

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <fieldset>
          <legend className={labelClass}>Frame</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {STYLES.map((s) => (
              <button key={s.id} type="button" aria-pressed={opts.style === s.id} className={chipClass(opts.style === s.id)} onClick={() => set("style", s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className={labelClass}>Bar colour</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["light", "dark"] as const).map((t) => (
              <button key={t} type="button" aria-pressed={opts.theme === t} className={chipClass(opts.theme === t)} onClick={() => set("theme", t)}>
                {t === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </fieldset>
        <label className={labelClass}>
          Background
          <select value={opts.background} onChange={(e) => set("background", e.target.value)} className={fieldClass}>
            {BACKGROUNDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        {opts.style === "browser" && (
          <label className={labelClass}>
            Address bar text
            <input type="text" value={opts.url} maxLength={120} onChange={(e) => set("url", e.target.value)} className={fieldClass} />
          </label>
        )}
        <label className={labelClass}>
          Padding: {opts.paddingPercent}%
          <input type="range" min="0" max="20" value={opts.paddingPercent} onChange={(e) => set("paddingPercent", Number(e.target.value))} className="mt-2 w-full accent-[var(--color-accent)]" />
        </label>
        <label className={labelClass}>
          Corner radius: {opts.radius}
          <input type="range" min="0" max="32" value={opts.radius} onChange={(e) => set("radius", Number(e.target.value))} className="mt-2 w-full accent-[var(--color-accent)]" />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <input type="checkbox" checked={opts.shadow} onChange={(e) => set("shadow", e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
          Shadow (needs some padding)
        </label>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-[repeating-conic-gradient(var(--color-paper-sunk)_0_25%,var(--color-paper)_0_50%)] bg-[length:20px_20px]">
        {picked ? (
          <canvas ref={canvas} className="block h-auto max-h-[70vh] w-full object-contain" role="img" aria-label="Preview of the framed screenshot" />
        ) : (
          <p className="p-8 text-center text-ink-muted">Open a screenshot to see the preview.</p>
        )}
      </div>
      {picked && (
        <button type="button" className={buttonClass("accent", "md", "mt-4")} onClick={() => void save()}>
          Download PNG
        </button>
      )}
    </div>
  );
}
