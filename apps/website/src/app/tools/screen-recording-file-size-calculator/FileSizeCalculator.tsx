"use client";

import { useState } from "react";
import { chipClass, fieldClass, labelClass } from "@/features/tools/ImagePicker";
import { bitrateFromSample, bytesFor, formatBytes, formatKbps, maxBitrateForTarget, sizeFromBitrates, toSeconds } from "@/features/tools/fileSize";

type Mode = "bitrate" | "sample" | "target";

const MODES: { id: Mode; label: string }[] = [
  { id: "bitrate", label: "I know the bitrate" },
  { id: "sample", label: "Measure from a recording I have" },
  { id: "target", label: "Fit under a size limit" },
];

function NumberField({ label, value, onChange, step = "any", suffix }: { label: string; value: string; onChange: (v: string) => void; step?: string; suffix?: string }) {
  return (
    <label className={labelClass}>
      {label}
      <span className="mt-1.5 flex items-center gap-2">
        <input type="number" inputMode="decimal" min="0" step={step} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass.replace("mt-1.5 ", "")} />
        {suffix && <span className="shrink-0 text-sm text-ink-faint">{suffix}</span>}
      </span>
    </label>
  );
}

const num = (v: string) => Number.parseFloat(v) || 0;

export function FileSizeCalculator() {
  const [mode, setMode] = useState<Mode>("bitrate");
  const [h, setH] = useState("0");
  const [m, setM] = useState("10");
  const [s, setS] = useState("0");
  const [video, setVideo] = useState("8");
  const [audio, setAudio] = useState("128");
  const [sampleMB, setSampleMB] = useState("");
  const [sampleMin, setSampleMin] = useState("");
  const [sampleSec, setSampleSec] = useState("");
  const [target, setTarget] = useState("25");

  const seconds = toSeconds({ hours: num(h), minutes: num(m), seconds: num(s) });
  const sampleSeconds = toSeconds({ hours: 0, minutes: num(sampleMin), seconds: num(sampleSec) });
  const sampleKbps = bitrateFromSample(num(sampleMB), sampleSeconds);

  let headline = "";
  let detail = "";
  if (mode === "bitrate") {
    const bytes = sizeFromBitrates(num(video), num(audio), seconds);
    headline = formatBytes(bytes);
    detail = `${num(video)} Mbps video + ${num(audio)} kbps audio for ${seconds.toLocaleString("en-US")} seconds.`;
  } else if (mode === "sample") {
    const bytes = bytesFor(sampleKbps, seconds);
    headline = sampleKbps > 0 ? formatBytes(bytes) : "Enter your sample";
    detail = sampleKbps > 0 ? `Your sample averages ${formatKbps(sampleKbps)}. At that rate, ${seconds.toLocaleString("en-US")} seconds comes to about ${formatBytes(bytes)}.` : "Use the size and length of a recording you already made with the same app and settings.";
  } else {
    const kbps = maxBitrateForTarget(num(target), seconds);
    headline = kbps > 0 ? formatKbps(kbps) : "Enter a limit";
    detail = kbps > 0 ? `Average total bitrate (video plus audio) that keeps ${seconds.toLocaleString("en-US")} seconds under ${num(target)} MB. Leave some headroom: encoders do not hit an average exactly.` : "";
  }

  return (
    <div>
      <fieldset>
        <legend className={labelClass}>What do you know?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {MODES.map((x) => (
            <button key={x.id} type="button" aria-pressed={mode === x.id} className={chipClass(mode === x.id)} onClick={() => setMode(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className={labelClass}>Recording length</legend>
        <div className="mt-2 grid grid-cols-3 gap-3">
          <NumberField label="Hours" value={h} onChange={setH} step="1" />
          <NumberField label="Minutes" value={m} onChange={setM} step="1" />
          <NumberField label="Seconds" value={s} onChange={setS} step="1" />
        </div>
      </fieldset>

      {mode === "bitrate" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <NumberField label="Video bitrate" value={video} onChange={setVideo} suffix="Mbps" />
          <NumberField label="Audio bitrate (0 if none)" value={audio} onChange={setAudio} suffix="kbps" />
        </div>
      )}
      {mode === "sample" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <NumberField label="Sample file size" value={sampleMB} onChange={setSampleMB} suffix="MB" />
          <NumberField label="Sample minutes" value={sampleMin} onChange={setSampleMin} step="1" />
          <NumberField label="Sample seconds" value={sampleSec} onChange={setSampleSec} step="1" />
        </div>
      )}
      {mode === "target" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <NumberField label="Size limit" value={target} onChange={setTarget} suffix="MB" />
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-paper-sunk p-5" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">{mode === "target" ? "Maximum bitrate" : "Estimated file size"}</p>
        <p className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-ink">{headline}</p>
        {detail && <p className="mt-2 leading-7 text-ink-muted">{detail}</p>}
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-faint">
        Formula: size in bytes = (video kbps + audio kbps) × 1,000 × seconds ÷ 8. Sizes use decimal megabytes (1 MB = 1,000,000 bytes), as Finder does. Real files vary a little because of container overhead and variable bitrate encoding.
      </p>
    </div>
  );
}
