"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Editor } from "@/features/editor/ui/Editor";
import { shortcutText, shortcuts } from "@/lib/product";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/** Floating macOS pieces that frame the editor in depth. Decorative only. */
function MenuBarMenu() {
  const rows: [string, string][] = [
    ["Capture Area", shortcutText(shortcuts.area)],
    ["Capture Window", shortcutText(shortcuts.window)],
    ["Capture Full Screen", shortcutText(shortcuts.fullScreen)],
    ["Record Area…", shortcutText(shortcuts.record)],
  ];
  return (
    <div className="w-60 rounded-xl bg-[#2a2932]/95 p-1.5 text-[13px] text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-xl">
      {rows.map(([label, keys], i) => (
        <div key={label} className={`flex items-center justify-between rounded-md px-2.5 py-1.5 ${i === 0 ? "bg-accent" : ""}`}>
          <span>{label}</span>
          <span className={`font-mono text-[11px] ${i === 0 ? "text-white/85" : "text-white/45"}`}>{keys}</span>
        </div>
      ))}
      <div className="my-1 h-px bg-white/10" />
      <div className="px-2.5 py-1.5 text-white/70">Capture History…</div>
    </div>
  );
}

function QuickAccessCard() {
  return (
    <div className="w-56 rounded-2xl bg-[#1c1b22] p-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br from-[#6d6bff] to-[#c3b5ff] p-2.5">
        <div className="h-full rounded-md bg-[#15141a] p-2">
          <div className="h-1.5 w-1/2 rounded bg-white/15" />
          <div className="mt-1.5 h-1.5 w-3/4 rounded bg-white/10" />
          <div className="mt-3 h-5 w-2/3 rounded-sm border-2 border-[#f0443a]" />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[11px] text-white/85">
        {["Annotate", "Copy", "Save"].map((label) => (
          <span key={label} className="rounded-lg bg-white/8 py-1.5">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  // Once the editor has flattened we keep it flat, so pointer math is exact while you use it.
  const [settled, setSettled] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.3"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.985 && !settled) setSettled(true);
  });

  const rotateX = useTransform(progress, [0, 1], [26, 0]);
  const scale = useTransform(progress, [0, 1], [0.86, 1]);
  const y = useTransform(progress, [0, 1], [40, 0]);
  const floatOpacity = useTransform(progress, [0, 0.35, 0.85, 1], [0, 1, 1, 0]);
  const menuY = useTransform(progress, [0, 1], [-30, 60]);
  const cardY = useTransform(progress, [0, 1], [60, -40]);
  const flat = reduce || settled;

  return (
    <section id="editor" aria-labelledby="editor-title" className="scroll-mt-20 overflow-x-clip px-3 pb-10 sm:px-4 md:px-6 md:pb-14">
      <div className="mx-auto max-w-7xl">
        <div ref={ref} className="relative [perspective:1800px]">
          {!flat ? (
            <>
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -left-14 top-24 z-10 hidden xl:block"
                style={{ opacity: floatOpacity, y: menuY, rotateX, translateZ: 120 }}
              >
                <MenuBarMenu />
              </motion.div>
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 bottom-16 z-10 hidden xl:block"
                style={{ opacity: floatOpacity, y: cardY, rotateX, translateZ: 160 }}
              >
                <QuickAccessCard />
              </motion.div>
            </>
          ) : null}
          <motion.div
            style={flat ? undefined : { rotateX, scale, y, transformOrigin: "50% 0%" }}
            className={flat ? "relative" : "relative will-change-transform"}
            onPointerDownCapture={(event) => {
              // A tilted surface can't map pointer positions exactly; the first touch flattens it instead.
              // Buttons work while tilted. Drawing needs exact pointer math, so a press on
              // the canvas flattens the editor first instead of starting a stroke.
              if (flat || !(event.target as HTMLElement).closest("[data-testid='editor-surface']")) return;
              event.preventDefault();
              event.stopPropagation();
              setSettled(true);
            }}
          >
            <div className="rounded-[24px] bg-paper-raised p-1.5 shadow-[0_0_0_1px_var(--sm-line),0_50px_100px_-50px_rgba(23,22,28,0.45)] md:rounded-[26px] md:p-2">
              <Editor />
            </div>
          </motion.div>
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center gap-1.5 px-1 text-center md:mt-7">
          <h2 id="editor-title" className="text-base font-medium tracking-[-0.01em] text-ink">
            This is the real editor. Go ahead.
          </h2>
          <p className="text-sm text-ink-muted">Mark up a sample, or drop in your own screenshot. It never leaves your browser.</p>
        </div>
      </div>
    </section>
  );
}
