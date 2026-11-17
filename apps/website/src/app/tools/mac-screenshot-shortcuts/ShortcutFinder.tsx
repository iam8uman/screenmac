"use client";

import { useState } from "react";

// Apple Support "How to take a screenshot on your Mac" (support.apple.com/102646), checked 2026-11-17.
const WHAT = [
  { id: "screen", label: "Entire screen", keys: ["Shift", "Command", "3"], how: "Press the keys together." },
  { id: "area", label: "Part of the screen", keys: ["Shift", "Command", "4"], how: "Drag the crosshair over the area. Hold Space while dragging to move the selection; press Esc to cancel." },
  { id: "window", label: "A window or menu", keys: ["Shift", "Command", "4", "Space"], how: "Open the window or menu, press the keys, then click it. Hold Option while clicking to leave out the shadow." },
  { id: "app", label: "Timer, recording or more options", keys: ["Shift", "Command", "5"], how: "The Screenshot app opens with capture and record buttons and an Options menu." },
] as const;

const WHERE = [
  { id: "file", label: "Save a file (desktop by default)" },
  { id: "clip", label: "Copy to the clipboard" },
] as const;

export function ShortcutFinder() {
  const [what, setWhat] = useState<(typeof WHAT)[number]["id"]>("area");
  const [where, setWhere] = useState<(typeof WHERE)[number]["id"]>("file");
  const w = WHAT.find((x) => x.id === what)!;
  const canClip = what !== "app";
  const keys = where === "clip" && canClip ? ["Control", ...w.keys] : [...w.keys];

  const chip = (active: boolean) =>
    `rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${active ? "border-accent bg-accent-soft text-ink" : "border-line-strong bg-paper text-ink-muted hover:text-ink"}`;

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-medium text-ink-muted">What do you want to capture?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {WHAT.map((x) => (
            <button key={x.id} type="button" aria-pressed={what === x.id} className={chip(what === x.id)} onClick={() => setWhat(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-ink-muted">Where should it go?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {WHERE.map((x) => (
            <button key={x.id} type="button" aria-pressed={where === x.id} className={chip(where === x.id)} onClick={() => setWhere(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-6 rounded-2xl bg-paper-sunk p-5" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Your shortcut</p>
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-lg">
          {keys.map((k, i) => (
            <span key={k + i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-ink-faint">+</span>}
              <kbd className="rounded-md border border-line-strong bg-paper-raised px-2 py-0.5 font-mono text-[15px] text-ink shadow-[0_1px_0_var(--color-line-strong)]">{k}</kbd>
            </span>
          ))}
        </p>
        <p className="mt-3 leading-7 text-ink-muted">{w.how}</p>
        {where === "clip" && !canClip && (
          <p className="mt-2 text-sm leading-6 text-ink-muted">In the Screenshot app, open Options and choose Clipboard under Save to.</p>
        )}
      </div>
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-ink">Full cheat sheet</summary>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-ink">
              <th className="py-2 pr-3 font-medium">Capture</th>
              <th className="py-2 pr-3 font-medium">Save a file</th>
              <th className="py-2 font-medium">Copy to clipboard</th>
            </tr>
          </thead>
          <tbody className="text-ink-muted">
            {WHAT.map((x) => (
              <tr key={x.id} className="border-b border-line">
                <td className="py-2 pr-3">{x.label}</td>
                <td className="py-2 pr-3 font-mono">{x.keys.join("-")}</td>
                <td className="py-2 font-mono">{x.id === "app" ? "Options → Clipboard" : ["Control", ...x.keys].join("-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
