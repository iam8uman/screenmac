"use client";

import { ArrowRight, PenLine, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * The hero is a working capture surface: rulers and a crosshair follow the mouse, a drag draws a
 * selection, and letting go "takes" the screenshot: a shutter flash, then a Quick Access card
 * holding a live thumbnail of exactly what was selected. Screenmac's own shortcuts work on the page:
 * ⌥⇧⌘4 arms area capture over the whole page, ⌥⇧⌘3 takes the full screen, ⌥⇧⌘2 the editor window.
 */

export type CaptureKind = "area" | "window" | "full";
const CAPTURE_EVENT = "sm:capture";

/** Lets buttons elsewhere on the page start a capture without sharing state. */
export function requestCapture(kind: CaptureKind) {
  window.dispatchEvent(new CustomEvent<CaptureKind>(CAPTURE_EVENT, { detail: kind }));
}

type Rect = { x: number; y: number; w: number; h: number };
type Shot = { id: number; kind: CaptureKind; rect: Rect; source: HTMLElement; sourceBox: Rect };

const INTERACTIVE = "a,button,input,textarea,select,label,summary,[role='button'],[data-no-capture]";
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

const noop = () => () => {};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const toRect = (b: DOMRect): Rect => ({ x: b.left, y: b.top, w: b.width, h: b.height });

function subscribeFine(onChange: () => void) {
  const media = window.matchMedia("(pointer: fine)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
/** A mouse or trackpad, read without a hydration mismatch (the server renders the touch version). */
function useFinePointer() {
  return useSyncExternalStore(subscribeFine, () => window.matchMedia("(pointer: fine)").matches, () => false);
}

function useDragSelect(onDone: (viewportRect: Rect) => void, mouseOnly: boolean) {
  const [drag, setDrag] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const box = useRef<DOMRect | null>(null);
  const rect: Rect | null = drag
    ? {
        x: Math.min(drag.x0, drag.x1),
        y: Math.min(drag.y0, drag.y1),
        w: Math.abs(drag.x1 - drag.x0),
        h: Math.abs(drag.y1 - drag.y0),
      }
    : null;

  const handlers = {
    onPointerDown(e: ReactPointerEvent<HTMLElement>) {
      if (e.button !== 0 || (mouseOnly && e.pointerType !== "mouse")) return;
      if ((e.target as Element).closest(INTERACTIVE)) return;
      e.preventDefault();
      box.current = e.currentTarget.getBoundingClientRect();
      e.currentTarget.setPointerCapture(e.pointerId);
      const x = e.clientX - box.current.left;
      const y = e.clientY - box.current.top;
      setDrag({ x0: x, y0: y, x1: x, y1: y });
    },
    onPointerMove(e: ReactPointerEvent<HTMLElement>) {
      const b = box.current;
      if (!drag || !b) return;
      setDrag({ ...drag, x1: clamp(e.clientX - b.left, 0, b.width), y1: clamp(e.clientY - b.top, 0, b.height) });
    },
    onPointerUp() {
      const b = box.current;
      setDrag(null);
      if (!rect || !b || rect.w < 12 || rect.h < 12) return;
      onDone({ x: rect.x + b.left, y: rect.y + b.top, w: rect.w, h: rect.h });
    },
    onPointerCancel() {
      setDrag(null);
    },
  };
  return { selection: rect, dragging: drag !== null, handlers };
}

/* ---------- Pieces ---------- */

function Selection({ rect, dpr, bounds }: { rect: Rect; dpr: number; bounds: { w: number; h: number } }) {
  const below = rect.y + rect.h + 34 < bounds.h;
  return (
    <div
      aria-hidden="true"
      data-capture-ignore
      className="pointer-events-none absolute z-20"
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxShadow: "0 0 0 200vmax rgba(23,22,28,0.26)" }}
    >
      <div className="absolute inset-0 bg-accent/[0.05] outline-[1.5px] -outline-offset-[0.75px] outline-dashed outline-accent" />
      {HANDLES.map(([left, top]) => (
        <span
          key={`${left}-${top}`}
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border-[1.5px] border-accent bg-paper-raised"
          style={{ left: `${left}%`, top: `${top}%` }}
        />
      ))}
      <span
        className={cn(
          "absolute right-0 whitespace-nowrap rounded-md bg-ink px-2 py-1 font-mono text-[11px] leading-none text-paper tabular-nums",
          below ? "-bottom-8" : "bottom-2 right-2",
        )}
      >
        {Math.round(rect.w * dpr)} × {Math.round(rect.h * dpr)}
      </span>
    </div>
  );
}

function Crosshair({ x, y, dpr }: { x: MotionValue<number>; y: MotionValue<number>; dpr: number }) {
  const label = useTransform(() => `${Math.round(x.get() * dpr)}  ${Math.round(y.get() * dpr)}`);
  const chipX = useTransform(x, (v) => v + 14);
  const chipY = useTransform(y, (v) => v + 16);
  return (
    <div aria-hidden="true" data-capture-ignore
      className="pointer-events-none absolute inset-0 z-10">
      <motion.div className="absolute inset-x-0 top-0 h-px bg-accent/35" style={{ y }} />
      <motion.div className="absolute inset-y-0 left-0 w-px bg-accent/35" style={{ x }} />
      <motion.span
        className="absolute left-0 top-0 whitespace-pre rounded-[5px] bg-ink/90 px-1.5 py-[3px] font-mono text-[10px] leading-none text-paper tabular-nums shadow-sm"
        style={{ x: chipX, y: chipY }}
      >
        {label}
      </motion.span>
    </div>
  );
}

/** Design-tool rulers along the top and left edges, with a marker that tracks the pointer. */
function Rulers({ x, y, size, visible }: { x: MotionValue<number>; y: MotionValue<number>; size: { w: number; h: number }; visible: boolean }) {
  const ticks = (dir: "right" | "bottom") =>
    [
      `repeating-linear-gradient(to ${dir}, var(--sm-line-strong) 0 1px, transparent 1px 10px)`,
      `repeating-linear-gradient(to ${dir}, var(--sm-ink-faint) 0 1px, transparent 1px 100px)`,
    ].join(",");
  const majors = (n: number) => Array.from({ length: Math.floor(n / 100) + 1 }, (_, i) => i * 100);

  return (
    <div
      aria-hidden="true"
      data-capture-ignore
      className={cn(
        "pointer-events-none absolute inset-0 z-[5] hidden transition-opacity duration-300 lg:block",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-5 border-b border-line bg-paper/70 backdrop-blur-[2px]"
        style={{ backgroundImage: ticks("right"), backgroundSize: "100% 4px, 100% 9px", backgroundPosition: "0 100%, 0 100%", backgroundRepeat: "repeat-x" }}
      >
        {majors(size.w).map((v) => (
          <span key={v} className="absolute top-[3px] font-mono text-[9px] leading-none text-ink-faint" style={{ left: v + 3 }}>
            {v}
          </span>
        ))}
        <motion.span className="absolute inset-y-0 left-0 w-px bg-accent" style={{ x }} />
      </div>
      <div
        className="absolute inset-y-0 left-0 w-5 border-r border-line bg-paper/70 backdrop-blur-[2px]"
        style={{ backgroundImage: ticks("bottom"), backgroundSize: "4px 100%, 9px 100%", backgroundPosition: "100% 0, 100% 0", backgroundRepeat: "repeat-y" }}
      >
        {majors(size.h).map((v) =>
          v === 0 ? null : (
            <span
              key={v}
              className="absolute left-[3px] font-mono text-[9px] leading-none text-ink-faint [writing-mode:vertical-rl] rotate-180"
              style={{ top: v + 3 }}
            >
              {v}
            </span>
          ),
        )}
        <motion.span className="absolute inset-x-0 top-0 h-px bg-accent" style={{ y }} />
      </div>
      <div className="absolute left-0 top-0 size-5 border-b border-r border-line bg-paper-raised" />
    </div>
  );
}

/** A real thumbnail: the captured region of the page, cloned and scaled (canvases copied too). */
function Snapshot({ shot, width, height }: { shot: Shot; width: number; height: number }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const src = shot.source;
    const clone = document.createElement("div");
    clone.className = src.className;
    for (const child of Array.from(src.childNodes)) clone.append(child.cloneNode(true));

    // Canvases clone blank; paint each one from its original before anything is removed.
    const from = src.querySelectorAll("canvas");
    clone.querySelectorAll("canvas").forEach((canvas, i) => {
      try {
        canvas.getContext("2d")?.drawImage(from[i], 0, 0);
      } catch {
        /* a tainted or WebGL canvas just stays blank */
      }
    });
    clone.querySelectorAll("[data-capture-ignore],script,style,noscript").forEach((n) => n.remove());
    // Keep ids, test ids and anchors unique on the real page.
    clone.querySelectorAll("[id],[data-testid],[data-editor-root]").forEach((n) => {
      n.removeAttribute("id");
      n.removeAttribute("data-testid");
      n.removeAttribute("data-editor-root");
    });

    const s = width / shot.rect.w;
    Object.assign(clone.style, {
      position: "absolute",
      left: "0",
      top: "0",
      margin: "0",
      width: `${shot.sourceBox.w}px`,
      height: `${shot.sourceBox.h}px`,
      transformOrigin: "0 0",
      transform: `scale(${s}) translate(${-(shot.rect.x - shot.sourceBox.x)}px, ${-(shot.rect.y - shot.sourceBox.y)}px)`,
      pointerEvents: "none",
    });
    el.replaceChildren(clone);
    return () => el.replaceChildren();
  }, [shot, width]);

  return <div ref={host} inert aria-hidden="true" className="relative overflow-hidden bg-paper" style={{ width, height }} />;
}

function QuickAccess({ shot, dpr, onClose }: { shot: Shot; dpr: number; onClose: () => void }) {
  const [paused, setPaused] = useState(false);
  const scale = Math.min(268 / shot.rect.w, 168 / shot.rect.h);
  const tw = Math.max(40, Math.round(shot.rect.w * scale));
  const th = Math.max(30, Math.round(shot.rect.h * scale));
  const what = shot.kind === "full" ? "Full screen" : shot.kind === "window" ? "Window" : "Area";

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(onClose, 9000);
    return () => window.clearTimeout(t);
  }, [paused, onClose, shot.id]);

  return (
    <motion.div
      role="dialog"
      aria-label="Quick Access"
      data-capture-ignore
      className="fixed bottom-4 left-4 z-[70] w-[min(300px,calc(100vw-2rem))] rounded-2xl bg-stage p-2 text-stage-ink shadow-[0_40px_80px_-24px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] sm:bottom-6 sm:left-6"
      initial={{ opacity: 0, x: -24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 30, delay: 0.22 } }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="grid h-[176px] place-items-center overflow-hidden rounded-xl bg-[#121117] sm-checker">
        <div className="overflow-hidden rounded-[6px] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.1)]">
          <Snapshot shot={shot} width={tw} height={th} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-1.5 pb-0.5 pt-2.5">
        <div className="min-w-0">
          <p className="text-[13px] font-medium leading-tight">{what} captured</p>
          <p className="font-mono text-[11px] leading-tight text-stage-ink-muted tabular-nums">
            {Math.round(shot.rect.w * dpr)} × {Math.round(shot.rect.h * dpr)} px
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="grid size-7 shrink-0 place-items-center rounded-full text-stage-ink-muted transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <Link
          href="/#editor"
          onClick={onClose}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white/[0.08] text-[12px] font-medium transition-colors hover:bg-white/[0.14]"
        >
          <PenLine className="size-3.5" />
          Annotate one
        </Link>
        <Link
          href="/#install"
          onClick={onClose}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-accent text-[12px] font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Get the app
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <p className="px-1.5 pb-1 pt-2.5 text-[11px] leading-snug text-stage-ink-muted">
        That&apos;s Quick Access. In Screenmac it holds your real screen.
      </p>
    </motion.div>
  );
}

/** Page-wide area capture armed by ⌥⇧⌘4: dim, crosshair, drag, Esc to cancel. */
function ArmedOverlay({ dpr, onCapture, onCancel }: { dpr: number; onCapture: (r: Rect) => void; onCancel: () => void }) {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Only ever rendered on the client (inside a portal), so the window is there.
  const size = { w: window.innerWidth, h: window.innerHeight };
  const { selection, handlers } = useDragSelect(onCapture, false);

  return (
    <motion.div
      data-capture-ignore
      className="fixed inset-0 z-[65] cursor-crosshair touch-none select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      {...handlers}
      onPointerMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
        handlers.onPointerMove(e);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      {!selection ? <div className="absolute inset-0 bg-ink/[0.12]" /> : null}
      <Crosshair x={x} y={y} dpr={dpr} />
      {selection ? <Selection rect={selection} dpr={dpr} bounds={size} /> : null}
      <div className="pointer-events-none absolute inset-x-0 top-20 flex justify-center">
        <span className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink/90 py-1.5 pl-4 pr-1.5 text-[13px] text-paper shadow-lg backdrop-blur">
          Drag to capture
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[12px] transition-colors hover:bg-white/20"
          >
            Cancel <kbd className="hidden font-mono text-[11px] text-paper/60 sm:inline">Esc</kbd>
          </button>
        </span>
      </div>
    </motion.div>
  );
}

/* ---------- Stage ---------- */

export function CaptureStage({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotionSafe();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const dpr = useSyncExternalStore(noop, () => window.devicePixelRatio || 1, () => 2);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [inside, setInside] = useState(false);
  const [hot, setHot] = useState(false);
  const [armed, setArmed] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [flash, setFlash] = useState(0);
  const [ghost, setGhost] = useState<{ id: number; rect: Rect } | null>(null);
  const [announce, setAnnounce] = useState("");
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const capture = useCallback(
    (kind: CaptureKind, rect: Rect, source: HTMLElement) => {
      const id = Date.now();
      setShot({ id, kind, rect, source, sourceBox: toRect(source.getBoundingClientRect()) });
      setAnnounce(`${kind === "area" ? "Area" : kind === "window" ? "Window" : "Full screen"} captured, ${Math.round(rect.w * dpr)} by ${Math.round(rect.h * dpr)} pixels.`);
      if (!reduce) {
        setFlash(id);
        setGhost({ id, rect });
      }
    },
    [dpr, reduce],
  );

  const run = useCallback(
    (kind: CaptureKind) => {
      if (kind === "area") {
        setShot(null);
        setArmed(true);
        return;
      }
      if (kind === "full") {
        capture("full", { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight }, document.body);
        return;
      }
      // "Window": the editor is the one real window on the page. Fall back to this stage.
      const win = (document.querySelector("[data-editor-root]")?.closest("[data-capture-window]") as HTMLElement | null) ?? ref.current;
      if (win) capture("window", toRect(win.getBoundingClientRect()), win);
    },
    [capture],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setArmed(false);
        setShot(null);
        return;
      }
      if (!(e.metaKey && e.altKey && e.shiftKey)) return;
      const kind: CaptureKind | null = e.code === "Digit4" ? "area" : e.code === "Digit3" ? "full" : e.code === "Digit2" ? "window" : null;
      if (!kind) return;
      e.preventDefault();
      run(kind);
    };
    const onRequest = (e: Event) => run((e as CustomEvent<CaptureKind>).detail);
    window.addEventListener("keydown", onKey);
    window.addEventListener(CAPTURE_EVENT, onRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(CAPTURE_EVENT, onRequest);
    };
  }, [run]);

  const { selection, dragging, handlers } = useDragSelect((r) => {
    if (ref.current) capture("area", r, ref.current);
  }, true);

  const live = fine && inside && (!hot || dragging) && !armed;

  return (
    <section
      ref={ref}
      data-no-reveal
      className={cn("relative isolate overflow-clip", fine && "cursor-crosshair select-none", className)}
      {...handlers}
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - b.left);
        my.set(e.clientY - b.top);
        setInside(true);
        setHot(Boolean((e.target as Element).closest(INTERACTIVE)));
        handlers.onPointerMove(e);
      }}
      onPointerLeave={() => setInside(false)}
    >
      {/* Canvas: a fine dot grid that fades out toward the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--sm-line-strong)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_42%,#000_30%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[420px] w-[min(900px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(91,76,245,0.13),transparent)] blur-2xl"
      />

      {fine ? (
        <>
          <Rulers x={mx} y={my} size={size} visible={inside && !armed} />
          {live ? <Crosshair x={mx} y={my} dpr={dpr} /> : null}
        </>
      ) : null}
      {selection ? <Selection rect={selection} dpr={dpr} bounds={size} /> : null}

      {children}

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {mounted
        ? createPortal(
            <div data-capture-ignore>
              <AnimatePresence>
                {armed ? (
                  <ArmedOverlay
                    key="armed"
                    dpr={dpr}
                    onCancel={() => setArmed(false)}
                    onCapture={(r) => {
                      setArmed(false);
                      capture("area", r, document.body);
                    }}
                  />
                ) : null}
              </AnimatePresence>
              {flash ? (
                <motion.div
                  key={`flash-${flash}`}
                  aria-hidden="true"
                  className="pointer-events-none fixed inset-0 z-[80] bg-white"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  onAnimationComplete={() => setFlash(0)}
                />
              ) : null}
              {ghost ? (
                <motion.div
                  key={`ghost-${ghost.id}`}
                  aria-hidden="true"
                  className="pointer-events-none fixed z-[75] rounded-[4px] outline-2 outline-accent"
                  initial={{ left: ghost.rect.x, top: ghost.rect.y, width: ghost.rect.w, height: ghost.rect.h, opacity: 1 }}
                  animate={{ left: 32, top: window.innerHeight - 220, width: 260, height: 160, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onAnimationComplete={() => setGhost(null)}
                />
              ) : null}
              <AnimatePresence>
                {shot ? <QuickAccess key={shot.id} shot={shot} dpr={dpr} onClose={() => setShot(null)} /> : null}
              </AnimatePresence>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

/** The three default shortcuts, as buttons that run the capture they name. */
export function CaptureTriggers({ items }: { items: { kind: CaptureKind; label: string; keys: readonly string[] }[] }) {
  const fine = useFinePointer();
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label="Try a capture">
        {items.map((item) => (
          <button
            key={item.kind}
            type="button"
            onClick={() => requestCapture(item.kind)}
            className="group inline-flex h-9 items-center gap-2 rounded-full bg-paper-raised/80 pl-2 pr-3.5 text-sm text-ink-muted ring-1 ring-inset ring-line backdrop-blur transition-[background-color,color,box-shadow] duration-150 hover:text-ink hover:ring-line-strong"
          >
            <span className="flex gap-0.5" aria-hidden="true">
              {item.keys.map((key) => (
                <kbd
                  key={key}
                  className="inline-flex min-w-[1.5rem] items-center justify-center rounded-[5px] bg-paper px-1 font-mono text-[11px] leading-[1.6rem] text-ink shadow-[0_0_0_1px_var(--sm-line-strong),0_1px_0_var(--sm-line-strong)] transition-colors group-hover:bg-accent-soft group-hover:text-accent-ink"
                >
                  {key}
                </kbd>
              ))}
            </span>
            <span>
              {item.label}
              <span className="sr-only"> capture, {item.keys.join(" ")}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="text-[13px] text-ink-faint">
        {fine ? (
          <>These work on this page. Press one, or just drag across this space.</>
        ) : (
          <>Tap one to see what a capture feels like.</>
        )}
      </p>
    </div>
  );
}
