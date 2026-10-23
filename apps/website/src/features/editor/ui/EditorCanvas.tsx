"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  clampPoint,
  clampRect,
  getBounds,
  getHandles,
  hitHandle,
  hitTest,
  isNegligible,
  normalizeRect,
  rectContains,
  rectHandles,
  resizeAnnotation,
  resizeRect,
  simplifyStroke,
  snapAngle,
  squareFrom,
  textBlockSize,
  translateAnnotation,
  type HandleId,
} from "../geometry";
import { nextCounterValue, type EditorAction, type EditorState } from "../history";
import type { Annotation, EditorDocument, Point, Rect, TextAnnotation, ToolId } from "../model";
import { computeLayout, imageToOutput, outputToImage, renderDocument, type Layout } from "../render";
import { TEXT_LINE_HEIGHT, TEXT_PADDING_X, TEXT_PADDING_Y } from "../geometry";
import type { LibraryImage } from "./useImageLibrary";

export interface DrawStyle {
  color: string;
  /** Stroke width in image pixels, already scaled for the image size. */
  strokeWidth: number;
  fontSize: number;
  counterRadius: number;
  textStyle: TextAnnotation["style"];
  blur: number;
  pixelate: number;
}

interface EditorCanvasProps {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  tool: ToolId;
  drawStyle: DrawStyle;
  image: LibraryImage | null;
  loadError: boolean;
  zoom: "fit" | number;
  onScaleChange: (scale: number, fitScale: number) => void;
  pendingCrop: Rect | null;
  onPendingCropChange: (crop: Rect) => void;
  /** Width / height ratio that new crop drags keep, or null for free. */
  cropAspect: number | null;
  fontFamily: string;
  newId: () => string;
  onFiles: (files: FileList) => void;
  /** Called after a text label is committed so the editor can return to Select. */
  onTextCommitted?: () => void;
  compact?: boolean;
}

type Interaction =
  | { type: "draw"; origin: Point }
  | { type: "move"; id: string; origin: Point; baseDoc: EditorDocument; base: Annotation; moved: boolean }
  | { type: "resize"; id: string; handle: HandleId; baseDoc: EditorDocument; base: Annotation }
  | { type: "crop-new"; origin: Point }
  | { type: "crop-move"; origin: Point; base: Rect }
  | { type: "crop-resize"; handle: HandleId; base: Rect };

interface TextEdit {
  id: string;
  isNew: boolean;
  origin: Point;
  text: string;
  color: string;
  fontSize: number;
  style: TextAnnotation["style"];
}

const HANDLE_CURSORS: Record<HandleId, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  start: "move",
  end: "move",
};

const STAGE_PADDING = 28;
const COMPACT_STAGE_PADDING = 14;

export function EditorCanvas(props: EditorCanvasProps) {
  const {
    state,
    dispatch,
    tool,
    drawStyle,
    image,
    loadError,
    zoom,
    onScaleChange,
    pendingCrop,
    onPendingCropChange,
    cropAspect,
    fontFamily,
    newId,
    onFiles,
    onTextCommitted,
    compact,
  } = props;
  const { doc, selectedId } = state;

  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const interaction = useRef<Interaction | null>(null);
  const strokePoints = useRef<Point[]>([]);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [draft, setDraft] = useState<Annotation | null>(null);
  const [textEdit, setTextEdit] = useState<TextEdit | null>(null);
  const [cursor, setCursor] = useState("crosshair");
  const [dropActive, setDropActive] = useState(false);

  const cropMode = tool === "crop";
  const size = image?.size ?? null;

  const layout: Layout | null = useMemo(() => {
    if (!size) return null;
    return computeLayout(cropMode ? { crop: null, backdrop: { ...doc.backdrop, id: "none" } } : doc, size);
  }, [cropMode, doc, size]);

  // Measure the stage so "fit" can size the canvas.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      setStageSize({ width: box.width, height: box.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pad = compact ? COMPACT_STAGE_PADDING : STAGE_PADDING;
  const fitScale = useMemo(() => {
    if (!layout || stageSize.width === 0) return 1;
    const sx = (stageSize.width - pad * 2) / layout.outputWidth;
    const sy = (stageSize.height - pad * 2) / layout.outputHeight;
    return Math.max(0.05, Math.min(sx, sy, 2));
  }, [layout, pad, stageSize]);
  const scale = zoom === "fit" ? fitScale : zoom;

  useEffect(() => {
    onScaleChange(scale, fitScale);
  }, [fitScale, onScaleChange, scale]);

  const displayWidth = layout ? Math.round(layout.outputWidth * scale) : 0;
  const displayHeight = layout ? Math.round(layout.outputHeight * scale) : 0;

  const hiddenIds = useMemo(() => (textEdit && !textEdit.isNew ? new Set([textEdit.id]) : undefined), [textEdit]);
  const annotations = useMemo(() => (draft ? [...doc.annotations, draft] : doc.annotations), [doc.annotations, draft]);

  // Paint. One renderer for view and export keeps them identical.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const frame = requestAnimationFrame(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      renderDocument(ctx, {
        image: image.image,
        imageSize: image.size,
        doc,
        annotations,
        ignoreCrop: cropMode,
        fontFamily,
        hiddenIds,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [annotations, cropMode, doc, fontFamily, hiddenIds, image]);

  const tolerance = 7 / scale;

  const toImage = useCallback(
    (clientX: number, clientY: number): Point => {
      const el = overlayRef.current;
      if (!el || !layout) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const ox = ((clientX - rect.left) / rect.width) * layout.outputWidth;
      const oy = ((clientY - rect.top) / rect.height) * layout.outputHeight;
      return outputToImage(layout, { x: ox, y: oy });
    },
    [layout],
  );

  const toDisplay = useCallback(
    (p: Point): Point => {
      if (!layout) return p;
      const o = imageToOutput(layout, p);
      return { x: o.x * scale, y: o.y * scale };
    },
    [layout, scale],
  );

  const selected = selectedId ? doc.annotations.find((a) => a.id === selectedId) ?? null : null;

  // ----- text editing -------------------------------------------------------

  // The ref guards against a second commit when the textarea blurs on unmount.
  const textEditRef = useRef<TextEdit | null>(null);
  useLayoutEffect(() => {
    textEditRef.current = textEdit;
  }, [textEdit]);

  const commitText = () => {
    const edit = textEditRef.current;
    if (!edit) return;
    textEditRef.current = null;
    setTextEdit(null);
    const text = edit.text.replace(/\s+$/g, "");
    if (edit.isNew) {
      if (text.trim()) {
        dispatch({
          type: "add",
          annotation: {
            id: edit.id,
            kind: "text",
            origin: edit.origin,
            text,
            color: edit.color,
            fontSize: edit.fontSize,
            style: edit.style,
          },
        });
        onTextCommitted?.();
      }
      return;
    }
    const current = doc.annotations.find((a) => a.id === edit.id);
    if (!current || current.kind !== "text") return;
    if (!text.trim()) dispatch({ type: "remove", id: edit.id });
    else if (text !== current.text) dispatch({ type: "update", annotation: { ...current, text } });
  };

  const cancelText = () => {
    textEditRef.current = null;
    setTextEdit(null);
  };

  const beginTextEdit = (annotation: TextAnnotation) => {
    setTextEdit({
      id: annotation.id,
      isNew: false,
      origin: annotation.origin,
      text: annotation.text,
      color: annotation.color,
      fontSize: annotation.fontSize,
      style: annotation.style,
    });
  };

  useEffect(() => {
    if (!textEdit) return;
    const el = textRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    if (!textEdit.isNew) el.select();
    // Only on start of an edit session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textEdit?.id]);

  // ----- pointer handling ---------------------------------------------------

  const startGesture = (next: Interaction, event: ReactPointerEvent) => {
    interaction.current = next;
    overlayRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!layout || !size) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.preventDefault();
    overlayRef.current?.closest<HTMLElement>("[data-editor-root]")?.focus({ preventScroll: true });

    if (textEdit) {
      commitText();
      return;
    }

    const raw = toImage(event.clientX, event.clientY);
    const p = clampPoint(raw, size);

    // Crop tool: adjust or draw the pending crop rectangle.
    if (cropMode) {
      const current = pendingCrop ?? { x: 0, y: 0, width: size.width, height: size.height };
      const handle = hitHandle(rectHandles(current), raw, tolerance * 1.6);
      if (handle) startGesture({ type: "crop-resize", handle, base: current }, event);
      else if (rectContains(current, raw) && (current.width < size.width || current.height < size.height))
        startGesture({ type: "crop-move", origin: raw, base: current }, event);
      else startGesture({ type: "crop-new", origin: p }, event);
      return;
    }

    // Handles of the current selection work with any tool.
    if (selected) {
      const handle = hitHandle(getHandles(selected), raw, tolerance * 1.4);
      if (handle) {
        dispatch({ type: "gestureStart" });
        startGesture({ type: "resize", id: selected.id, handle, baseDoc: doc, base: selected }, event);
        return;
      }
    }

    if (tool === "select") {
      const hit = hitTest(doc.annotations, raw, tolerance);
      if (!hit) {
        dispatch({ type: "select", id: null });
        return;
      }
      if (hit.id !== selectedId) dispatch({ type: "select", id: hit.id });
      dispatch({ type: "gestureStart" });
      startGesture({ type: "move", id: hit.id, origin: raw, baseDoc: doc, base: hit, moved: false }, event);
      return;
    }

    if (tool === "text") {
      const hit = hitTest(doc.annotations, raw, tolerance);
      if (hit?.kind === "text") {
        dispatch({ type: "select", id: hit.id });
        beginTextEdit(hit);
        return;
      }
      dispatch({ type: "select", id: null });
      const height = drawStyle.fontSize * (TEXT_LINE_HEIGHT + TEXT_PADDING_Y * 2);
      setTextEdit({
        id: newId(),
        isNew: true,
        origin: { x: p.x, y: Math.max(0, p.y - height / 2) },
        text: "",
        color: drawStyle.color,
        fontSize: drawStyle.fontSize,
        style: drawStyle.textStyle,
      });
      return;
    }

    if (tool === "counter") {
      dispatch({
        type: "add",
        annotation: {
          id: newId(),
          kind: "counter",
          center: p,
          value: nextCounterValue(doc.annotations),
          color: drawStyle.color,
          radius: drawStyle.counterRadius,
        },
      });
      return;
    }

    const created = createDraft(tool, p, drawStyle, newId());
    if (!created) return;
    dispatch({ type: "select", id: null });
    strokePoints.current = [p];
    setDraft(created);
    startGesture({ type: "draw", origin: p }, event);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!layout || !size) return;
    const raw = toImage(event.clientX, event.clientY);
    const current = interaction.current;

    if (!current) {
      setCursor(hoverCursor(raw));
      return;
    }

    const p = clampPoint(raw, size);
    switch (current.type) {
      case "draw": {
        setDraft((d) => (d ? updateDraft(d, current.origin, p, event.shiftKey, strokePoints.current) : d));
        break;
      }
      case "move": {
        const dx = raw.x - current.origin.x;
        const dy = raw.y - current.origin.y;
        if (!current.moved && Math.hypot(dx, dy) < 2 / scale) return;
        current.moved = true;
        const moved = translateAnnotation(current.base, dx, dy);
        dispatch({ type: "gesturePreview", doc: replaceAnnotation(current.baseDoc, moved) });
        break;
      }
      case "resize": {
        const target = event.shiftKey && (current.base.kind === "arrow" || current.base.kind === "line")
          ? snapAngle(current.handle === "end" ? current.base.start : current.base.end, p)
          : p;
        const resized = resizeAnnotation(current.base, current.handle, target);
        dispatch({ type: "gesturePreview", doc: replaceAnnotation(current.baseDoc, resized) });
        break;
      }
      case "crop-new": {
        const ratio = event.shiftKey ? 1 : cropAspect;
        const end = ratio ? clampPoint(constrainAspect(current.origin, p, ratio), size) : p;
        onPendingCropChange(normalizeRect(current.origin, end));
        break;
      }
      case "crop-move": {
        const dx = raw.x - current.origin.x;
        const dy = raw.y - current.origin.y;
        const b = current.base;
        onPendingCropChange({
          ...b,
          x: Math.min(Math.max(0, b.x + dx), size.width - b.width),
          y: Math.min(Math.max(0, b.y + dy), size.height - b.height),
        });
        break;
      }
      case "crop-resize":
        onPendingCropChange(clampRect(resizeRect(current.base, current.handle, p), size));
        break;
    }
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const current = interaction.current;
    interaction.current = null;
    if (overlayRef.current?.hasPointerCapture(event.pointerId)) {
      overlayRef.current.releasePointerCapture(event.pointerId);
    }
    if (!current) return;
    switch (current.type) {
      case "draw": {
        const finished = draft ? finalizeDraft(draft) : null;
        setDraft(null);
        if (!cancelled && finished && !isNegligible(finished)) dispatch({ type: "add", annotation: finished });
        break;
      }
      case "move":
      case "resize":
        dispatch({ type: cancelled ? "gestureCancel" : "gestureEnd" });
        break;
      case "crop-new":
        if (pendingCrop && (pendingCrop.width < 8 || pendingCrop.height < 8) && size) {
          onPendingCropChange({ x: 0, y: 0, width: size.width, height: size.height });
        }
        break;
      default:
        break;
    }
  };

  // Escape cancels an in-flight drag without touching history.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !interaction.current) return;
      event.stopPropagation();
      const current = interaction.current;
      interaction.current = null;
      if (current.type === "draw") setDraft(null);
      if (current.type === "move" || current.type === "resize") dispatch({ type: "gestureCancel" });
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [dispatch]);

  const hoverCursor = (p: Point): string => {
    if (cropMode) {
      if (!size) return "crosshair";
      const current = pendingCrop ?? { x: 0, y: 0, width: size.width, height: size.height };
      const handle = hitHandle(rectHandles(current), p, tolerance * 1.6);
      if (handle) return HANDLE_CURSORS[handle];
      return rectContains(current, p) && (current.width < size.width || current.height < size.height) ? "move" : "crosshair";
    }
    if (selected) {
      const handle = hitHandle(getHandles(selected), p, tolerance * 1.4);
      if (handle) return HANDLE_CURSORS[handle];
    }
    if (tool === "select") return hitTest(doc.annotations, p, tolerance) ? "move" : "default";
    if (tool === "text") return "text";
    return "crosshair";
  };

  // ----- drag & drop images -------------------------------------------------

  const onDragOver = (event: React.DragEvent) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDropActive(true);
  };
  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDropActive(false);
    if (event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
  };

  // ----- overlays -----------------------------------------------------------

  const selectionOverlay = (() => {
    if (!layout || cropMode || !selected || (textEdit && textEdit.id === selected.id)) return null;
    const bounds = getBounds(selected);
    const tl = toDisplay({ x: bounds.x, y: bounds.y });
    const br = toDisplay({ x: bounds.x + bounds.width, y: bounds.y + bounds.height });
    const handles = getHandles(selected).map((h) => ({ ...h, d: toDisplay(h.point) }));
    return (
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={displayWidth} height={displayHeight} aria-hidden="true">
        <rect
          x={tl.x - 3}
          y={tl.y - 3}
          width={br.x - tl.x + 6}
          height={br.y - tl.y + 6}
          fill="none"
          stroke="#8C80FF"
          strokeWidth={1.25}
          strokeDasharray="4 3"
          rx={3}
        />
        {handles.map((h) => (
          <rect
            key={h.id}
            x={h.d.x - 4.5}
            y={h.d.y - 4.5}
            width={9}
            height={9}
            rx={2.5}
            fill="#fff"
            stroke="#5B4CF5"
            strokeWidth={1.5}
          />
        ))}
      </svg>
    );
  })();

  const cropOverlay = (() => {
    if (!layout || !cropMode || !size) return null;
    const c = pendingCrop ?? { x: 0, y: 0, width: size.width, height: size.height };
    const tl = toDisplay({ x: c.x, y: c.y });
    const br = toDisplay({ x: c.x + c.width, y: c.y + c.height });
    const w = br.x - tl.x;
    const h = br.y - tl.y;
    return (
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={displayWidth} height={displayHeight} aria-hidden="true">
        <defs>
          <mask id="sm-crop-mask">
            <rect width={displayWidth} height={displayHeight} fill="#fff" />
            <rect x={tl.x} y={tl.y} width={w} height={h} fill="#000" />
          </mask>
        </defs>
        <rect width={displayWidth} height={displayHeight} fill="rgba(12,11,18,0.62)" mask="url(#sm-crop-mask)" />
        <rect x={tl.x} y={tl.y} width={w} height={h} fill="none" stroke="#fff" strokeWidth={1.5} />
        {[1, 2].map((i) => (
          <g key={i} stroke="rgba(255,255,255,0.35)" strokeWidth={1}>
            <line x1={tl.x + (w * i) / 3} y1={tl.y} x2={tl.x + (w * i) / 3} y2={br.y} />
            <line x1={tl.x} y1={tl.y + (h * i) / 3} x2={br.x} y2={tl.y + (h * i) / 3} />
          </g>
        ))}
        {rectHandles(c).map((handle) => {
          const d = toDisplay(handle.point);
          return <rect key={handle.id} x={d.x - 5} y={d.y - 5} width={10} height={10} rx={2} fill="#fff" stroke="#5B4CF5" strokeWidth={1.5} />;
        })}
        <g transform={`translate(${tl.x + 8}, ${Math.max(tl.y + 8, 8)})`}>
          <rect width={92} height={22} rx={6} fill="rgba(20,19,27,0.85)" />
          <text x={46} y={15} textAnchor="middle" fill="#fff" fontSize={11.5} fontFamily="var(--font-geist-mono), monospace">
            {Math.round(c.width)} × {Math.round(c.height)}
          </text>
        </g>
      </svg>
    );
  })();

  const textOverlay = (() => {
    if (!layout || !textEdit) return null;
    const pos = toDisplay(textEdit.origin);
    const fontPx = textEdit.fontSize * scale;
    const measured = textBlockSize(textEdit.text || "Type here", textEdit.fontSize);
    const isLabel = textEdit.style === "label";
    const ink = isLabel ? labelInk(textEdit.color) : textEdit.color;
    return (
      <textarea
        ref={textRef}
        aria-label="Annotation text"
        value={textEdit.text}
        placeholder="Type here"
        spellCheck={false}
        onChange={(event) => setTextEdit((edit) => (edit ? { ...edit, text: event.target.value } : edit))}
        onBlur={commitText}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
          event.stopPropagation();
          if (event.key === "Escape") {
            event.preventDefault();
            cancelText();
          } else if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            commitText();
          }
        }}
        rows={Math.max(1, textEdit.text.split("\n").length)}
        className="absolute resize-none overflow-hidden border-0 outline-none placeholder:opacity-60"
        style={{
          left: pos.x,
          top: pos.y,
          width: measured.width * scale + 4,
          height: measured.height * scale,
          font: `600 ${fontPx}px ${fontFamily}`,
          lineHeight: TEXT_LINE_HEIGHT,
          padding: `${textEdit.fontSize * TEXT_PADDING_Y * scale}px ${textEdit.fontSize * TEXT_PADDING_X * scale}px`,
          color: ink,
          caretColor: ink,
          background: isLabel ? textEdit.color : "transparent",
          borderRadius: isLabel ? textEdit.fontSize * 0.42 * scale : 4,
          boxShadow: isLabel ? "0 2px 10px rgba(0,0,0,0.25)" : "0 0 0 1.5px rgba(140,128,255,0.9)",
          textShadow: isLabel ? "none" : "0 1px 3px rgba(0,0,0,0.35)",
        }}
      />
    );
  })();

  const label = image
    ? `${image.alt} ${doc.annotations.length} annotation${doc.annotations.length === 1 ? "" : "s"}.`
    : "Loading image";

  return (
    <div
      ref={scrollRef}
      className="sm-checker relative min-h-0 flex-1 overflow-auto overscroll-contain"
      onDragOver={onDragOver}
      onDragLeave={() => setDropActive(false)}
      onDrop={onDrop}
    >
      <div
        className="grid min-h-full min-w-full place-items-center"
        style={{ padding: pad, width: displayWidth + pad * 2 > stageSize.width ? displayWidth + pad * 2 : undefined }}
      >
        {image && layout ? (
          <div
            className="relative shrink-0"
            style={{
              width: displayWidth,
              height: displayHeight,
              boxShadow: doc.backdrop.id === "none" || cropMode ? "0 18px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" : "0 18px 50px -16px rgba(0,0,0,0.55)",
              borderRadius: 4,
            }}
          >
            <canvas
              ref={canvasRef}
              data-testid="editor-canvas"
              role="img"
              aria-label={label}
              className="absolute inset-0 block size-full rounded-[3px]"
            />
            <div
              ref={overlayRef}
              data-testid="editor-surface"
              className="absolute inset-0 touch-none select-none"
              style={{ cursor }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => finishPointer(event)}
              onDoubleClick={(event) => {
                if (cropMode || textEdit) return;
                const hit = hitTest(doc.annotations, toImage(event.clientX, event.clientY), tolerance);
                if (hit?.kind === "text") {
                  dispatch({ type: "select", id: hit.id });
                  beginTextEdit(hit);
                }
              }}
              onPointerCancel={(event) => finishPointer(event, true)}
              onLostPointerCapture={(event) => {
                if (interaction.current) finishPointer(event);
              }}
            >
              {cropOverlay}
              {selectionOverlay}
              {textOverlay}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-sm text-stage-ink-muted" role="status">
            {loadError ? (
              <span>This sample didn&apos;t load. Check your connection and pick it again.</span>
            ) : (
              <>
                <span className="size-5 animate-spin rounded-full border-2 border-stage-line border-t-stage-ink" aria-hidden="true" />
                <span>Loading sample…</span>
              </>
            )}
          </div>
        )}
      </div>
      {dropActive ? (
        <div className="pointer-events-none absolute inset-3 grid place-items-center rounded-xl border-2 border-dashed border-[#8C80FF] bg-[#5B4CF5]/15 text-sm font-medium text-white">
          Drop to open this image. It stays in your browser.
        </div>
      ) : null}
    </div>
  );
}

// ----- helpers ---------------------------------------------------------------

function labelInk(color: string): string {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return "#fff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? "#15141A" : "#FFFFFF";
}

function replaceAnnotation(doc: EditorDocument, annotation: Annotation): EditorDocument {
  return { ...doc, annotations: doc.annotations.map((a) => (a.id === annotation.id ? annotation : a)) };
}

function createDraft(tool: ToolId, p: Point, style: DrawStyle, id: string): Annotation | null {
  const rect = { x: p.x, y: p.y, width: 0, height: 0 };
  switch (tool) {
    case "arrow":
    case "line":
      return { id, kind: tool, start: p, end: p, color: style.color, strokeWidth: style.strokeWidth };
    case "rectangle":
    case "filled-rectangle":
      return { id, kind: "rectangle", rect, color: style.color, strokeWidth: style.strokeWidth, filled: tool === "filled-rectangle" };
    case "ellipse":
      return { id, kind: "ellipse", rect, color: style.color, strokeWidth: style.strokeWidth, filled: false };
    case "pencil":
      return { id, kind: "pencil", points: [p], color: style.color, strokeWidth: style.strokeWidth };
    case "highlighter":
      return { id, kind: "highlighter", points: [p], color: style.color, strokeWidth: style.strokeWidth * 3.4 };
    case "blur":
      return { id, kind: "blur", rect, intensity: style.blur };
    case "pixelate":
      return { id, kind: "pixelate", rect, intensity: style.pixelate };
    case "redact":
      return { id, kind: "redact", rect, intensity: 0 };
    default:
      return null;
  }
}

function updateDraft(draft: Annotation, origin: Point, p: Point, shift: boolean, points: Point[]): Annotation {
  switch (draft.kind) {
    case "arrow":
    case "line":
      return { ...draft, end: shift ? snapAngle(origin, p) : p };
    case "rectangle":
    case "ellipse":
    case "blur":
    case "pixelate":
    case "redact":
      return { ...draft, rect: normalizeRect(origin, shift ? squareFrom(origin, p) : p) };
    case "pencil":
    case "highlighter": {
      if (shift && points.length) {
        // Shift draws a straight stroke from the first point.
        points.length = 1;
        points.push(p);
      } else {
        points.push(p);
      }
      return { ...draft, points: [...points] };
    }
    default:
      return draft;
  }
}

function finalizeDraft(draft: Annotation): Annotation {
  if (draft.kind === "pencil" || draft.kind === "highlighter") {
    return { ...draft, points: simplifyStroke(draft.points, Math.max(1.5, draft.strokeWidth * 0.15)) };
  }
  return draft;
}

function constrainAspect(origin: Point, p: Point, ratio: number): Point {
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  let w = Math.abs(dx);
  let h = Math.abs(dy);
  if (h === 0 || w / h > ratio) w = h * ratio;
  else h = w / ratio;
  return { x: origin.x + Math.sign(dx || 1) * w, y: origin.y + Math.sign(dy || 1) * h };
}
