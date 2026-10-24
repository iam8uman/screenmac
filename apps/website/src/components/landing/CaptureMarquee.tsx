"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// [left, top] as percentages of the frame.
const HANDLES: [number, number][] = [
  [0, 0],
  [50, 0],
  [100, 0],
  [100, 50],
  [100, 100],
  [50, 100],
  [0, 100],
  [0, 50],
];

/**
 * Wraps content in a screen-capture selection: dashed frame, resize handles,
 * and a live readout of the frame's size in device pixels.
 */
export function CaptureMarquee({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const box = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      setSize({ w: Math.round(box.width * dpr), h: Math.round(box.height * dpr) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative -mx-2 px-2 py-2 sm:-mx-5 sm:px-5 sm:py-3">
      <div aria-hidden="true" className="sm-marquee-in pointer-events-none absolute inset-0 rounded-[2px] bg-accent/[0.045] outline-[1.5px] -outline-offset-[0.75px] outline-dashed outline-accent" />
      <div aria-hidden="true" className="sm-pop pointer-events-none absolute inset-0">
        {HANDLES.map(([left, top]) => (
          <span
            key={`${left}-${top}`}
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] border-[1.5px] border-accent bg-paper-raised"
            style={{ left: `${left}%`, top: `${top}%` }}
          />
        ))}
        <span className="absolute -bottom-9 right-0 rounded-md bg-ink px-2 py-1 font-mono text-[11px] leading-none text-paper tabular-nums sm:-bottom-10">
          {size ? `${size.w} × ${size.h}` : " "}
        </span>
      </div>
      {children}
    </div>
  );
}
