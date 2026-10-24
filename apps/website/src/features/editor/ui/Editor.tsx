"use client";

import {
  Copy,
  Download,
  ImagePlus,
  LoaderCircle,
  Maximize2,
  Redo2,
  RotateCcw,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { cn } from "@/lib/cn";
import { canRedo, canUndo, createEditorState, editorReducer, isDirty } from "../history";
import { clipboardSupport, copyPng, downloadBlob, exportFilename, exportPng } from "../export";
import {
  DEFAULT_STYLE,
  type Annotation,
  type Backdrop,
  type Rect,
  type TextAnnotation,
  type ToolId,
} from "../model";
import { SAMPLES, UPLOAD_PREFIX, seededAnnotations } from "../samples";
import { STYLED_TOOLS, toolForKey, toolInfo } from "../tools";
import { EditorCanvas, type DrawStyle } from "./EditorCanvas";
import { ASPECTS, Inspector, type AspectLabel, type Strength } from "./Inspector";
import { Toolbar, Tooltip } from "./Toolbar";
import { useImageLibrary } from "./useImageLibrary";

type Toast = { id: number; tone: "info" | "success" | "error"; message: string; action?: { label: string; run: () => void } };

const ZOOM_STEPS = [0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const FONT_SIZES: Record<number, number> = { 4: 26, 7: 34, 11: 46 };
const COUNTER_RADII: Record<number, number> = { 4: 15, 7: 19, 11: 25 };
const BLUR: Record<Strength, number> = { 1: 10, 2: 18, 3: 30 };
const PIXEL: Record<Strength, number> = { 1: 9, 2: 15, 3: 26 };

const TOOL_HINTS: Partial<Record<ToolId, string>> = {
  select: "Click to select. Drag to move. Double-click text to edit.",
  crop: "Drag to choose the area to keep.",
  arrow: "Drag from tail to tip. Hold Shift for 45°.",
  line: "Drag to draw. Hold Shift for 45°.",
  rectangle: "Drag to draw. Hold Shift for a square.",
  "filled-rectangle": "Drag to draw a solid block.",
  ellipse: "Drag to draw. Hold Shift for a circle.",
  text: "Click to place a label. Return to finish.",
  counter: "Click to drop numbered steps in order.",
  highlighter: "Drag across text to highlight it.",
  pencil: "Draw freehand.",
  blur: "Drag over anything private to blur it.",
  pixelate: "Drag over anything private to pixelate it.",
  redact: "Drag to black out text completely.",
};

function strengthOf(annotation: Annotation | null, fallback: Strength, unit: number): Strength {
  if (!annotation || (annotation.kind !== "blur" && annotation.kind !== "pixelate")) return fallback;
  const table = annotation.kind === "blur" ? BLUR : PIXEL;
  const value = annotation.intensity / unit;
  return ([1, 2, 3] as Strength[]).reduce((best, s) => (Math.abs(table[s] - value) < Math.abs(table[best] - value) ? s : best), 2 as Strength);
}

function nearestKey(table: Record<number, number>, value: number): number {
  return Number(
    Object.entries(table).reduce((best, entry) => (Math.abs(entry[1] - value) < Math.abs(best[1] - value) ? entry : best))[0],
  );
}

/** Which Fine / Medium / Bold step an annotation was drawn with. */
function baseWidthOf(annotation: Annotation | null, fallback: number, unit: number): number {
  if (!annotation) return fallback;
  switch (annotation.kind) {
    case "text":
      return nearestKey(FONT_SIZES, annotation.fontSize / unit);
    case "counter":
      return nearestKey(COUNTER_RADII, annotation.radius / unit);
    case "highlighter":
      return nearestKey({ 4: 4, 7: 7, 11: 11 }, annotation.strokeWidth / 3.4 / unit);
    case "arrow":
    case "line":
    case "rectangle":
    case "ellipse":
    case "pencil":
      return nearestKey({ 4: 4, 7: 7, 11: 11 }, annotation.strokeWidth / unit);
    default:
      return fallback;
  }
}

export interface EditorProps {
  variant?: "showcase" | "full";
  className?: string;
}

export function Editor({ variant = "showcase", className }: EditorProps) {
  const full = variant === "full";
  const firstSample = SAMPLES[0].id;
  const [state, dispatch] = useReducer(editorReducer, undefined, () =>
    full
      ? createEditorState(firstSample)
      : createEditorState(firstSample, {
          annotations: seededAnnotations(firstSample),
          backdrop: { id: "violet", padding: 6, radius: 18, shadow: true },
        }),
  );
  const { images, status, addFile } = useImageLibrary();

  const [tool, setToolState] = useState<ToolId>("arrow");
  const [color, setColor] = useState(DEFAULT_STYLE.color);
  const [baseWidth, setBaseWidth] = useState<number>(DEFAULT_STYLE.strokeWidth);
  const [textStyle, setTextStyle] = useState<TextAnnotation["style"]>("label");
  const [strength, setStrength] = useState<Strength>(2);
  const [zoom, setZoom] = useState<"fit" | number>("fit");
  const [scaleInfo, setScaleInfo] = useState({ scale: 1, fit: 1 });
  const [pendingCrop, setPendingCrop] = useState<Rect | null>(null);
  const [aspect, setAspect] = useState<AspectLabel>("Free");
  const [busy, setBusy] = useState<"export" | "copy" | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [fontFamily, setFontFamily] = useState("ui-sans-serif, system-ui, sans-serif");

  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);
  const toastTimer = useRef<number | null>(null);

  const doc = state.doc;
  const image = images.get(doc.sampleId) ?? null;
  const imageStatus = status[doc.sampleId];
  const unit = image ? Math.min(4, Math.max(0.5, Math.max(image.size.width, image.size.height) / 1600)) : 1;
  const selected = state.selectedId ? doc.annotations.find((a) => a.id === state.selectedId) ?? null : null;

  const newId = useCallback(() => {
    idCounter.current += 1;
    return `a${Date.now().toString(36)}${idCounter.current}`;
  }, []);

  // Use the page's Geist face in the canvas, once it has loaded.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const family = getComputedStyle(root).getPropertyValue("--font-geist-sans").trim();
    if (!family) return;
    const stack = `${family}, ui-sans-serif, system-ui, sans-serif`;
    document.fonts
      .load(`600 32px ${family}`)
      .then(() => setFontFamily(stack))
      .catch(() => setFontFamily(stack));
  }, []);

  const notify = useCallback((tone: Toast["tone"], message: string, action?: Toast["action"]) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), tone, message, action });
    toastTimer.current = window.setTimeout(() => setToast(null), tone === "error" ? 7000 : action ? 5000 : 2600);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const drawStyle: DrawStyle = useMemo(
    () => ({
      color,
      strokeWidth: baseWidth * unit,
      fontSize: (FONT_SIZES[baseWidth] ?? 34) * unit,
      counterRadius: (COUNTER_RADII[baseWidth] ?? 19) * unit,
      textStyle,
      blur: BLUR[strength] * unit,
      pixelate: PIXEL[strength] * unit,
    }),
    [baseWidth, color, strength, textStyle, unit],
  );

  // ----- crop -------------------------------------------------------------

  const fullRect = useCallback((): Rect | null => (image ? { x: 0, y: 0, width: image.size.width, height: image.size.height } : null), [image]);

  const applyPendingCrop = useCallback(() => {
    if (!image || !pendingCrop) return;
    const isFull = pendingCrop.width >= image.size.width - 0.5 && pendingCrop.height >= image.size.height - 0.5;
    const next = isFull ? null : { x: Math.round(pendingCrop.x), y: Math.round(pendingCrop.y), width: Math.round(pendingCrop.width), height: Math.round(pendingCrop.height) };
    const same = JSON.stringify(next) === JSON.stringify(doc.crop);
    if (!same) dispatch({ type: "setCrop", crop: next });
  }, [doc.crop, image, pendingCrop]);

  const setTool = useCallback(
    (next: ToolId) => {
      if (next === tool) return;
      if (tool === "crop") applyPendingCrop();
      if (next === "crop") {
        setPendingCrop(doc.crop ?? fullRect());
        setAspect("Free");
        dispatch({ type: "select", id: null });
      }
      if (next !== "select" && next !== "crop" && selected && !STYLED_TOOLS.has(next)) {
        dispatch({ type: "select", id: null });
      }
      setToolState(next);
    },
    [applyPendingCrop, doc.crop, fullRect, selected, tool],
  );

  const cancelCrop = useCallback(() => {
    setPendingCrop(null);
    setToolState("select");
  }, []);

  const chooseAspect = useCallback(
    (label: AspectLabel) => {
      setAspect(label);
      const ratio = ASPECTS.find((a) => a.label === label)?.value ?? null;
      if (!ratio || !image) return;
      const base = pendingCrop ?? fullRect()!;
      let width = base.width;
      let height = width / ratio;
      if (height > base.height) {
        height = base.height;
        width = height * ratio;
      }
      setPendingCrop({ x: base.x + (base.width - width) / 2, y: base.y + (base.height - height) / 2, width, height });
    },
    [fullRect, image, pendingCrop],
  );

  // ----- style changes apply to the selection too ---------------------------

  const updateSelected = useCallback(
    (fn: (a: Annotation) => Annotation | null) => {
      if (!selected) return;
      const next = fn(selected);
      if (next && JSON.stringify(next) !== JSON.stringify(selected)) dispatch({ type: "update", annotation: next });
    },
    [selected],
  );

  const onColor = (value: string) => {
    setColor(value);
    updateSelected((a) => ("color" in a ? { ...a, color: value } : null));
  };

  const onStrokeWidth = (value: number) => {
    setBaseWidth(value);
    updateSelected((a) => {
      switch (a.kind) {
        case "text":
          return { ...a, fontSize: (FONT_SIZES[value] ?? 34) * unit };
        case "counter":
          return { ...a, radius: (COUNTER_RADII[value] ?? 19) * unit };
        case "highlighter":
          return { ...a, strokeWidth: value * 3.4 * unit };
        case "arrow":
        case "line":
        case "rectangle":
        case "ellipse":
        case "pencil":
          return { ...a, strokeWidth: value * unit };
        default:
          return null;
      }
    });
  };

  const onTextStyle = (value: TextAnnotation["style"]) => {
    setTextStyle(value);
    updateSelected((a) => (a.kind === "text" ? { ...a, style: value } : null));
  };

  const onStrength = (value: Strength) => {
    setStrength(value);
    updateSelected((a) =>
      a.kind === "blur" ? { ...a, intensity: BLUR[value] * unit } : a.kind === "pixelate" ? { ...a, intensity: PIXEL[value] * unit } : null,
    );
  };

  const onBackdrop = (backdrop: Backdrop) => dispatch({ type: "setBackdrop", backdrop });

  // Reflect the selection's style in the inspector.
  const inspectorColor = selected && "color" in selected ? selected.color : color;
  const inspectorWidth = baseWidthOf(selected, baseWidth, unit);
  const inspectorTextStyle = selected?.kind === "text" ? selected.style : textStyle;
  const inspectorStrength = strengthOf(selected, strength, unit);

  // ----- image switching --------------------------------------------------

  const switchTo = useCallback(
    (sampleId: string, title: string) => {
      if (sampleId === doc.sampleId) return;
      if (tool === "crop") {
        setPendingCrop(null);
        setToolState("select");
      }
      const hadWork = isDirty(state);
      dispatch({ type: "switchSample", sampleId });
      setZoom("fit");
      if (hadWork) notify("info", `Opened ${title}.`, { label: "Undo", run: () => dispatch({ type: "undo" }) });
    },
    [doc.sampleId, notify, state, tool],
  );

  const openFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!file) {
        notify("error", "That isn't an image. Open a PNG, JPEG, WebP, or GIF.");
        return;
      }
      try {
        const entry = await addFile(file);
        switchTo(entry.id, entry.title);
        notify("success", `Opened ${entry.title}. It stays in this browser tab.`);
      } catch (error) {
        notify("error", error instanceof Error ? error.message : "This image couldn't be opened.");
      }
    },
    [addFile, notify, switchTo],
  );

  // ----- history actions ----------------------------------------------------

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  const reset = useCallback(() => {
    if (!isDirty(state)) {
      notify("info", "Nothing to reset. The image is untouched.");
      return;
    }
    setPendingCrop(null);
    if (tool === "crop") setToolState("select");
    dispatch({ type: "reset" });
    notify("info", "Reset to the original image.", { label: "Undo", run: () => dispatch({ type: "undo" }) });
  }, [notify, state, tool]);

  // ----- export -------------------------------------------------------------

  const exportDoc = useCallback(() => {
    // Crop in progress counts: export what the user sees once they leave the tool.
    if (tool === "crop" && pendingCrop && image) {
      const isFull = pendingCrop.width >= image.size.width - 0.5 && pendingCrop.height >= image.size.height - 0.5;
      return { ...doc, crop: isFull ? null : pendingCrop };
    }
    return doc;
  }, [doc, image, pendingCrop, tool]);

  const produce = useCallback(async () => {
    if (!image) throw new Error("The image is still loading.");
    await document.fonts.ready;
    return exportPng({ image: image.image, imageSize: image.size, doc: exportDoc(), fontFamily });
  }, [exportDoc, fontFamily, image]);

  const exportImage = useCallback(async () => {
    if (!image || busy) return;
    setBusy("export");
    try {
      const blob = await produce();
      const name = exportFilename(image.id.startsWith(UPLOAD_PREFIX) ? image.title : image.id);
      downloadBlob(blob, name);
      notify("success", `Exported ${name}`);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Export failed. Try again.");
    } finally {
      setBusy(null);
    }
  }, [busy, image, notify, produce]);

  const copyImage = useCallback(async () => {
    if (!image || busy) return;
    if (clipboardSupport() === "unsupported") {
      notify("error", "This browser can't put images on the clipboard. Use Export PNG instead.", {
        label: "Export PNG",
        run: () => void exportImage(),
      });
      return;
    }
    setBusy("copy");
    try {
      await copyPng(produce);
      notify("success", "Copied to the clipboard as PNG.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Copy failed. Use Export PNG instead.", {
        label: "Export PNG",
        run: () => void exportImage(),
      });
    } finally {
      setBusy(null);
    }
  }, [busy, exportImage, image, notify, produce]);

  // ----- zoom ----------------------------------------------------------------

  const zoomBy = useCallback(
    (direction: 1 | -1) => {
      const current = scaleInfo.scale;
      const next =
        direction > 0
          ? ZOOM_STEPS.find((s) => s > current + 0.001) ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]
          : [...ZOOM_STEPS].reverse().find((s) => s < current - 0.001) ?? ZOOM_STEPS[0];
      setZoom(next);
    },
    [scaleInfo.scale],
  );

  const onScaleChange = useCallback((scale: number, fit: number) => {
    setScaleInfo((prev) => (prev.scale === scale && prev.fit === fit ? prev : { scale, fit }));
  }, []);

  // ----- keyboard -----------------------------------------------------------

  const onKeyDown = (event: KeyboardEvent | ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable='true']")) return;
    const mod = event.metaKey || event.ctrlKey;
    const key = event.key;

    if (mod && key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (mod && key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (mod && key.toLowerCase() === "s") {
      event.preventDefault();
      void exportImage();
      return;
    }
    if (mod && key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
      event.preventDefault();
      void copyImage();
      return;
    }
    if (mod && key.toLowerCase() === "d" && selected) {
      event.preventDefault();
      dispatch({ type: "duplicate", id: selected.id, offset: 24 * unit, newId: newId() });
      return;
    }
    if (mod && (key === "=" || key === "+")) {
      event.preventDefault();
      zoomBy(1);
      return;
    }
    if (mod && key === "-") {
      event.preventDefault();
      zoomBy(-1);
      return;
    }
    if (mod && key === "0") {
      event.preventDefault();
      setZoom("fit");
      return;
    }
    if (mod || event.altKey) return;

    if (key === "Escape") {
      if (tool === "crop") {
        event.preventDefault();
        cancelCrop();
      } else if (selected) {
        event.preventDefault();
        dispatch({ type: "select", id: null });
      }
      return;
    }
    if (key === "Enter" && tool === "crop") {
      event.preventDefault();
      applyPendingCrop();
      setPendingCrop(null);
      setToolState("select");
      return;
    }
    if ((key === "Delete" || key === "Backspace") && selected) {
      event.preventDefault();
      dispatch({ type: "remove", id: selected.id });
      return;
    }
    if (key.startsWith("Arrow") && selected) {
      event.preventDefault();
      const step = (event.shiftKey ? 10 : 1) * unit;
      const dx = key === "ArrowLeft" ? -step : key === "ArrowRight" ? step : 0;
      const dy = key === "ArrowUp" ? -step : key === "ArrowDown" ? step : 0;
      dispatch({ type: "nudge", id: selected.id, dx, dy });
      return;
    }
    const next = key.length === 1 ? toolForKey(key) : null;
    if (next) {
      event.preventDefault();
      setTool(next);
    }
  };

  const onPaste = (event: ClipboardEvent | ReactClipboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea")) return;
    const files = event.clipboardData?.files;
    if (files?.length) {
      event.preventDefault();
      void openFiles(files);
    }
  };

  // The editor stays "active" after you use it, even if focus falls back to the
  // page (for example when a focused button becomes disabled), so shortcuts and
  // paste keep working until you interact with something else.
  const activeRef = useRef(false);
  const handlers = useRef({ onKeyDown, onPaste });
  useEffect(() => {
    handlers.current = { onKeyDown, onPaste };
  });
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const owns = (node: EventTarget | null) => node instanceof Node && root.contains(node);
    const onPointerDown = (event: PointerEvent) => {
      activeRef.current = owns(event.target);
    };
    const onFocusIn = (event: FocusEvent) => {
      activeRef.current = owns(event.target);
    };
    const applies = (event: Event) =>
      activeRef.current && root.isConnected && (root.checkVisibility?.() ?? true) && (owns(event.target) || event.target === document.body);
    const onKey = (event: KeyboardEvent) => {
      if (applies(event)) handlers.current.onKeyDown(event);
    };
    const onPasteEvent = (event: ClipboardEvent) => {
      if (applies(event)) handlers.current.onPaste(event);
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPasteEvent);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPasteEvent);
    };
  }, []);

  // ----- render ---------------------------------------------------------------

  const sampleTabs = [
    ...SAMPLES.map((s) => ({ id: s.id, title: s.title })),
    ...Array.from(images.values())
      .filter((i) => i.id.startsWith(UPLOAD_PREFIX))
      .map((i) => ({ id: i.id, title: i.title })),
  ];

  const zoomLabel = `${Math.round(scaleInfo.scale * 100)}%`;
  const hint = TOOL_HINTS[tool];

  return (
    <div
      ref={rootRef}
      data-editor-root
      tabIndex={-1}
      className={cn(
        "relative flex flex-col overflow-hidden bg-stage text-stage-ink outline-none",
        full ? "h-full" : "rounded-[18px] shadow-[0_40px_80px_-30px_rgba(23,22,28,0.55),0_0_0_1px_rgba(23,22,28,0.9)]",
        className,
      )}
    >
      {/* Title bar: window controls + images */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-stage-line bg-[#201f27] px-3 sm:px-4">
        <div className="hidden shrink-0 gap-2 sm:flex" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div role="tablist" aria-label="Image" className="sm-scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:justify-center">
          {sampleTabs.map((tab) => {
            const active = tab.id === doc.sampleId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`sample-${tab.id.replace(":", "-")}`}
                onClick={() => switchTo(tab.id, tab.title)}
                className={cn(
                  "h-8 shrink-0 rounded-lg px-3 text-[13px] transition-colors",
                  active ? "bg-white/10 text-stage-ink" : "text-stage-ink-muted hover:text-stage-ink",
                )}
              >
                <span className="block max-w-36 truncate">{tab.title}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-stage-ink-muted ring-1 ring-stage-line transition-colors hover:text-stage-ink"
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Open image</span>
          <span className="sr-only sm:hidden">Open image</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          data-testid="editor-file-input"
          onChange={(event) => {
            if (event.target.files?.length) void openFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {/* Tools and history */}
      <div className="flex shrink-0 items-center gap-2 border-b border-stage-line px-2 py-1.5 sm:px-3">
        <div className="sm-scrollbar-none min-w-0 flex-1 overflow-x-auto lg:overflow-visible">
          <Toolbar tool={tool} onToolChange={setTool} />
        </div>
        <div className="flex shrink-0 items-center gap-1 border-l border-stage-line pl-2">
          <IconButton label="Undo" shortcut="⌘Z" onClick={undo} disabled={!canUndo(state)}>
            <Undo2 className="size-[18px]" />
          </IconButton>
          <IconButton label="Redo" shortcut="⇧⌘Z" onClick={redo} disabled={!canRedo(state)}>
            <Redo2 className="size-[18px]" />
          </IconButton>
        </div>
      </div>

      {/* Canvas + inspector */}
      <div className={cn("flex min-h-0 flex-1 flex-col lg:flex-row", !full && "lg:h-[620px] lg:flex-none")}>
        <div className={cn("relative flex min-h-0 min-w-0 flex-col lg:flex-1", full ? "flex-1" : "h-[300px] sm:h-[460px] lg:h-auto")}>
          <EditorCanvas
            key={doc.sampleId}
            state={state}
            dispatch={dispatch}
            tool={tool}
            drawStyle={drawStyle}
            image={image}
            loadError={imageStatus === "error"}
            zoom={zoom}
            onScaleChange={onScaleChange}
            pendingCrop={tool === "crop" ? pendingCrop : null}
            onPendingCropChange={setPendingCrop}
            cropAspect={ASPECTS.find((a) => a.label === aspect)?.value ?? null}
            fontFamily={fontFamily}
            newId={newId}
            onFiles={(files) => void openFiles(files)}
            onTextCommitted={() => setToolState("select")}
            compact={!full}
          />
          {toast ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
              <div
                key={toast.id}
                className={cn(
                  "sm-toast pointer-events-auto flex max-w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] shadow-2xl ring-1 backdrop-blur-md",
                  toast.tone === "error" ? "bg-[#3a1715]/95 text-[#ffd9d5] ring-[#F0443A]/40" : "bg-[#121118]/92 text-white ring-white/10",
                )}
              >
                {toast.tone === "success" ? <span className="size-1.5 shrink-0 rounded-full bg-[#4ade80]" aria-hidden="true" /> : null}
                <span className="min-w-0">{toast.message}</span>
                {toast.action ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-md px-2 py-0.5 font-medium text-[#b6adff] hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      toast.action?.run();
                      setToast(null);
                    }}
                  >
                    {toast.action.label}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <Inspector
          tool={tool}
          selected={selected}
          color={inspectorColor}
          strokeWidth={inspectorWidth}
          textStyle={inspectorTextStyle}
          strength={inspectorStrength}
          backdrop={doc.backdrop}
          pendingCrop={pendingCrop}
          imageSize={image?.size ?? null}
          hasCrop={doc.crop !== null}
          aspect={aspect}
          onColor={onColor}
          onStrokeWidth={onStrokeWidth}
          onTextStyle={onTextStyle}
          onStrength={onStrength}
          onBackdrop={onBackdrop}
          onApplyCrop={() => {
            applyPendingCrop();
            setPendingCrop(null);
            setToolState("select");
          }}
          onCancelCrop={cancelCrop}
          onClearCrop={() => {
            dispatch({ type: "setCrop", crop: null });
            setPendingCrop(fullRect());
          }}
          onAspect={chooseAspect}
          onDuplicate={() => selected && dispatch({ type: "duplicate", id: selected.id, offset: 24 * unit, newId: newId() })}
          onDelete={() => selected && dispatch({ type: "remove", id: selected.id })}
          onReorder={(to) => selected && dispatch({ type: "reorder", id: selected.id, to })}
        />
      </div>

      {/* Status + output */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-stage-line bg-[#201f27] px-3 py-2 sm:px-4">
        <p className="order-last hidden min-w-0 flex-1 truncate text-xs text-stage-ink-muted md:order-none md:block" aria-live="polite">
          <span className="text-stage-ink">{toolInfo(tool).label}</span>
          {hint ? <span> — {hint}</span> : null}
        </p>
        <div className="flex items-center gap-0.5 rounded-lg ring-1 ring-stage-line">
          <IconButton label="Zoom out" shortcut="⌘−" onClick={() => zoomBy(-1)} small tooltipSide="top">
            <ZoomOut className="size-4" />
          </IconButton>
          <button
            type="button"
            onClick={() => setZoom("fit")}
            aria-label={`Zoom ${zoomLabel}. Fit to window`}
            className="h-7 min-w-12 rounded-md px-1 font-mono text-[11.5px] text-stage-ink-muted hover:text-stage-ink"
          >
            {zoomLabel}
          </button>
          <IconButton label="Zoom in" shortcut="⌘+" onClick={() => zoomBy(1)} small tooltipSide="top">
            <ZoomIn className="size-4" />
          </IconButton>
          <IconButton label="Fit to window" shortcut="⌘0" onClick={() => setZoom("fit")} small tooltipSide="top" disabled={zoom === "fit"}>
            <Maximize2 className="size-3.5" />
          </IconButton>
        </div>
        {image ? (
          <span className="hidden font-mono text-[11.5px] text-stage-ink-muted sm:inline">
            {Math.round((doc.crop ?? image.size).width)} × {Math.round((doc.crop ?? image.size).height)}
          </span>
        ) : null}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-stage-ink-muted transition-colors hover:bg-white/8 hover:text-stage-ink"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => void copyImage()}
            disabled={!image || busy !== null}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] text-stage-ink ring-1 ring-stage-line transition-colors hover:bg-white/8 disabled:opacity-50"
          >
            {busy === "copy" ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
            Copy
          </button>
          <button
            type="button"
            onClick={() => void exportImage()}
            disabled={!image || busy !== null}
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-3.5 text-[13px] font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset] transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {busy === "export" ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
            Export PNG
          </button>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  shortcut,
  onClick,
  disabled,
  small,
  tooltipSide = "bottom",
  children,
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  small?: boolean;
  tooltipSide?: "top" | "bottom";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center rounded-lg text-stage-ink-muted transition-colors hover:bg-white/8 hover:text-stage-ink disabled:pointer-events-none disabled:opacity-35",
        small ? "size-7" : "size-9",
      )}
    >
      {children}
      <Tooltip label={label} shortcut={shortcut} side={tooltipSide} />
    </button>
  );
}
