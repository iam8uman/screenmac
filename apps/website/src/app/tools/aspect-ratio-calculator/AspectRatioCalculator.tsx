"use client";

import { useState } from "react";
import { chipClass, fieldClass, labelClass } from "@/features/tools/ImagePicker";
import { heightForWidth, largestCrop, nearestPreset, padToRatio, RATIO_PRESETS, ratioLabel, simplify, widthForHeight, type Ratio } from "@/features/tools/aspect";

const num = (v: string) => Number.parseFloat(v) || 0;

export function AspectRatioCalculator() {
  const [w, setW] = useState("2880");
  const [h, setH] = useState("1800");
  const [newW, setNewW] = useState("1280");
  const [newH, setNewH] = useState("");
  const [ratio, setRatio] = useState<Ratio>({ w: 16, h: 9 });

  const size = { width: num(w), height: num(h) };
  const simple = simplify(size);
  const near = nearestPreset(size);
  const crop = largestCrop(size, ratio);
  const pad = padToRatio(size, ratio);
  const valid = simple !== null;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Width (px)
          <input type="number" inputMode="numeric" min="1" value={w} onChange={(e) => setW(e.target.value)} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Height (px)
          <input type="number" inputMode="numeric" min="1" value={h} onChange={(e) => setH(e.target.value)} className={fieldClass} />
        </label>
      </div>

      <div className="mt-5 rounded-2xl bg-paper-sunk p-5" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Aspect ratio</p>
        {simple ? (
          <>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-ink">{ratioLabel(simple)}</p>
            <p className="mt-2 leading-7 text-ink-muted">
              {(size.width / size.height).toFixed(3)} : 1
              {near && (near.off < 0.0005 ? `, exactly ${ratioLabel(near.ratio)}` : `, closest common ratio ${ratioLabel(near.ratio)} (${(near.off * 100).toFixed(1)}% off)`)}
            </p>
          </>
        ) : (
          <p className="mt-2 text-ink-muted">Enter a width and height.</p>
        )}
      </div>

      <h3 className="mt-8 text-lg font-semibold text-ink">Resize without distorting</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          New width
          <input type="number" min="1" value={newW} onChange={(e) => { setNewW(e.target.value); setNewH(""); }} className={fieldClass} />
        </label>
        <label className={labelClass}>
          or new height
          <input type="number" min="1" value={newH} onChange={(e) => { setNewH(e.target.value); setNewW(""); }} className={fieldClass} />
        </label>
      </div>
      <p className="mt-3 text-ink-muted" aria-live="polite">
        {valid && num(newW) > 0 && (
          <>
            {num(newW)} × <strong className="text-ink">{heightForWidth(size, num(newW))}</strong> px
          </>
        )}
        {valid && num(newH) > 0 && (
          <>
            <strong className="text-ink">{widthForHeight(size, num(newH))}</strong> × {num(newH)} px
          </>
        )}
      </p>

      <h3 className="mt-8 text-lg font-semibold text-ink">Fit to another ratio</h3>
      <fieldset className="mt-3">
        <legend className="sr-only">Target ratio</legend>
        <div className="grid grid-cols-4 gap-2">
          {RATIO_PRESETS.map((r) => {
            const active = r.w === ratio.w && r.h === ratio.h;
            return (
              <button key={ratioLabel(r)} type="button" aria-pressed={active} className={chipClass(active)} onClick={() => setRatio(r)}>
                {ratioLabel(r)}
              </button>
            );
          })}
        </div>
      </fieldset>
      {valid && crop && pad && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm font-medium text-ink">Crop (lose the edges)</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {crop.width} × {crop.height}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Largest centred crop, starting {crop.x} px from the left and {crop.y} px from the top.
            </p>
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm font-medium text-ink">Pad (keep everything)</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {pad.width} × {pad.height}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Add {pad.padX} px each side and {pad.padY} px top and bottom.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
