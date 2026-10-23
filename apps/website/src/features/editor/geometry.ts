import type { Annotation, ImageSize, Point, Rect } from "./model";

export type HandleId = "start" | "end" | "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface Handle {
  id: HandleId;
  point: Point;
}

export const TEXT_LINE_HEIGHT = 1.25;
export const TEXT_PADDING_X = 0.35; // multiples of font size
export const TEXT_PADDING_Y = 0.2;

type TextMeasurer = (text: string, fontSize: number) => number;

/** Rough fallback used in tests and before a canvas context is available. */
let measureLine: TextMeasurer = (text, fontSize) => text.length * fontSize * 0.56;

export function setTextMeasurer(measurer: TextMeasurer): void {
  measureLine = measurer;
}

export function normalizeRect(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

export function clampPoint(point: Point, size: ImageSize): Point {
  return {
    x: Math.min(Math.max(point.x, 0), size.width),
    y: Math.min(Math.max(point.y, 0), size.height),
  };
}

export function clampRect(rect: Rect, size: ImageSize): Rect {
  const x = Math.min(Math.max(rect.x, 0), size.width);
  const y = Math.min(Math.max(rect.y, 0), size.height);
  const right = Math.min(Math.max(rect.x + rect.width, 0), size.width);
  const bottom = Math.min(Math.max(rect.y + rect.height, 0), size.height);
  return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}

export function rectContains(rect: Rect, point: Point, tolerance = 0): boolean {
  return (
    point.x >= rect.x - tolerance &&
    point.x <= rect.x + rect.width + tolerance &&
    point.y >= rect.y - tolerance &&
    point.y <= rect.y + rect.height + tolerance
  );
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function textBlockSize(text: string, fontSize: number): { width: number; height: number } {
  const lines = text.split("\n");
  const widest = Math.max(...lines.map((line) => measureLine(line || " ", fontSize)));
  return {
    width: widest + fontSize * TEXT_PADDING_X * 2,
    height: lines.length * fontSize * TEXT_LINE_HEIGHT + fontSize * TEXT_PADDING_Y * 2,
  };
}

export function getBounds(annotation: Annotation): Rect {
  switch (annotation.kind) {
    case "arrow":
    case "line": {
      const pad = annotation.strokeWidth * (annotation.kind === "arrow" ? 2.4 : 0.5);
      const rect = normalizeRect(annotation.start, annotation.end);
      return { x: rect.x - pad, y: rect.y - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 };
    }
    case "rectangle":
    case "ellipse":
    case "blur":
    case "pixelate":
    case "redact":
      return { ...annotation.rect };
    case "pencil":
    case "highlighter": {
      const xs = annotation.points.map((p) => p.x);
      const ys = annotation.points.map((p) => p.y);
      const pad = annotation.strokeWidth / 2;
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return {
        x: minX - pad,
        y: minY - pad,
        width: Math.max(...xs) - minX + pad * 2,
        height: Math.max(...ys) - minY + pad * 2,
      };
    }
    case "text": {
      const size = textBlockSize(annotation.text, annotation.fontSize);
      return { x: annotation.origin.x, y: annotation.origin.y, ...size };
    }
    case "counter":
      return {
        x: annotation.center.x - annotation.radius,
        y: annotation.center.y - annotation.radius,
        width: annotation.radius * 2,
        height: annotation.radius * 2,
      };
  }
}

export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Whether a point (image space) touches an annotation. */
export function hitsAnnotation(annotation: Annotation, point: Point, tolerance: number): boolean {
  switch (annotation.kind) {
    case "arrow":
    case "line":
      return distanceToSegment(point, annotation.start, annotation.end) <= annotation.strokeWidth / 2 + tolerance;
    case "pencil":
    case "highlighter": {
      const reach = annotation.strokeWidth / 2 + tolerance;
      const { points } = annotation;
      if (points.length === 1) return Math.hypot(point.x - points[0].x, point.y - points[0].y) <= reach;
      for (let i = 1; i < points.length; i += 1) {
        if (distanceToSegment(point, points[i - 1], points[i]) <= reach) return true;
      }
      return false;
    }
    case "rectangle": {
      const { rect } = annotation;
      if (annotation.filled) return rectContains(rect, point, tolerance);
      const reach = annotation.strokeWidth / 2 + tolerance;
      if (!rectContains(rect, point, reach)) return false;
      const inner: Rect = {
        x: rect.x + reach,
        y: rect.y + reach,
        width: rect.width - reach * 2,
        height: rect.height - reach * 2,
      };
      return inner.width <= 0 || inner.height <= 0 || !rectContains(inner, point);
    }
    case "ellipse": {
      const { rect } = annotation;
      const rx = rect.width / 2;
      const ry = rect.height / 2;
      if (rx <= 0 || ry <= 0) return false;
      const cx = rect.x + rx;
      const cy = rect.y + ry;
      const normalized = Math.hypot((point.x - cx) / rx, (point.y - cy) / ry);
      if (annotation.filled) return normalized <= 1 + tolerance / Math.min(rx, ry);
      const reach = annotation.strokeWidth / 2 + tolerance;
      return Math.abs(normalized - 1) * Math.min(rx, ry) <= reach;
    }
    case "blur":
    case "pixelate":
    case "redact":
    case "text":
      return rectContains(getBounds(annotation), point, tolerance);
    case "counter":
      return Math.hypot(point.x - annotation.center.x, point.y - annotation.center.y) <= annotation.radius + tolerance;
  }
}

/** Topmost annotation under a point, or null. */
export function hitTest(annotations: readonly Annotation[], point: Point, tolerance: number): Annotation | null {
  for (let i = annotations.length - 1; i >= 0; i -= 1) {
    if (hitsAnnotation(annotations[i], point, tolerance)) return annotations[i];
  }
  return null;
}

const movePoint = (p: Point, dx: number, dy: number): Point => ({ x: p.x + dx, y: p.y + dy });
const moveRect = (r: Rect, dx: number, dy: number): Rect => ({ ...r, x: r.x + dx, y: r.y + dy });

export function translateAnnotation<T extends Annotation>(annotation: T, dx: number, dy: number): T {
  switch (annotation.kind) {
    case "arrow":
    case "line":
      return { ...annotation, start: movePoint(annotation.start, dx, dy), end: movePoint(annotation.end, dx, dy) };
    case "rectangle":
    case "ellipse":
    case "blur":
    case "pixelate":
    case "redact":
      return { ...annotation, rect: moveRect(annotation.rect, dx, dy) };
    case "pencil":
    case "highlighter":
      return { ...annotation, points: annotation.points.map((p) => movePoint(p, dx, dy)) };
    case "text":
      return { ...annotation, origin: movePoint(annotation.origin, dx, dy) };
    case "counter":
      return { ...annotation, center: movePoint(annotation.center, dx, dy) };
  }
}

export function rectHandles(rect: Rect): Handle[] {
  const { x, y, width: w, height: h } = rect;
  return [
    { id: "nw", point: { x, y } },
    { id: "n", point: { x: x + w / 2, y } },
    { id: "ne", point: { x: x + w, y } },
    { id: "e", point: { x: x + w, y: y + h / 2 } },
    { id: "se", point: { x: x + w, y: y + h } },
    { id: "s", point: { x: x + w / 2, y: y + h } },
    { id: "sw", point: { x, y: y + h } },
    { id: "w", point: { x, y: y + h / 2 } },
  ];
}

/** Resize handles for an annotation. Freehand, text, and counters move only. */
export function getHandles(annotation: Annotation): Handle[] {
  switch (annotation.kind) {
    case "arrow":
    case "line":
      return [
        { id: "start", point: annotation.start },
        { id: "end", point: annotation.end },
      ];
    case "rectangle":
    case "ellipse":
    case "blur":
    case "pixelate":
    case "redact":
      return rectHandles(annotation.rect);
    default:
      return [];
  }
}

export function hitHandle(handles: readonly Handle[], point: Point, tolerance: number): HandleId | null {
  for (const handle of handles) {
    if (Math.abs(point.x - handle.point.x) <= tolerance && Math.abs(point.y - handle.point.y) <= tolerance) {
      return handle.id;
    }
  }
  return null;
}

/** Drag one edge/corner of a rect to `point`. Flips cleanly past the opposite edge. */
export function resizeRect(rect: Rect, handle: HandleId, point: Point): Rect {
  let left = rect.x;
  let top = rect.y;
  let right = rect.x + rect.width;
  let bottom = rect.y + rect.height;
  if (handle.includes("w")) left = point.x;
  if (handle.includes("e")) right = point.x;
  if (handle === "n" || handle === "nw" || handle === "ne") top = point.y;
  if (handle === "s" || handle === "sw" || handle === "se") bottom = point.y;
  return normalizeRect({ x: left, y: top }, { x: right, y: bottom });
}

export function resizeAnnotation<T extends Annotation>(annotation: T, handle: HandleId, point: Point): T {
  switch (annotation.kind) {
    case "arrow":
    case "line":
      if (handle === "start") return { ...annotation, start: point };
      if (handle === "end") return { ...annotation, end: point };
      return annotation;
    case "rectangle":
    case "ellipse":
    case "blur":
    case "pixelate":
    case "redact":
      if (handle === "start" || handle === "end") return annotation;
      return { ...annotation, rect: resizeRect(annotation.rect, handle, point) };
    default:
      return annotation;
  }
}

/** Constrain a segment end to 45° increments (Shift while drawing). */
export function snapAngle(start: Point, end: Point): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const step = Math.PI / 4;
  const angle = Math.round(Math.atan2(dy, dx) / step) * step;
  return { x: start.x + Math.cos(angle) * length, y: start.y + Math.sin(angle) * length };
}

/** Constrain a drag to a square (Shift while drawing shapes). */
export function squareFrom(start: Point, end: Point): Point {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const size = Math.max(Math.abs(dx), Math.abs(dy));
  return { x: start.x + Math.sign(dx || 1) * size, y: start.y + Math.sign(dy || 1) * size };
}

/** Remove near-duplicate points from freehand input to keep strokes light. */
export function simplifyStroke(points: readonly Point[], minDistance: number): Point[] {
  if (points.length <= 2) return [...points];
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const last = result[result.length - 1];
    if (Math.hypot(points[i].x - last.x, points[i].y - last.y) >= minDistance) result.push(points[i]);
  }
  result.push(points[points.length - 1]);
  return result;
}

/** Whether a freshly drawn annotation is too small to keep (an accidental click). */
export function isNegligible(annotation: Annotation): boolean {
  switch (annotation.kind) {
    case "arrow":
    case "line":
      return Math.hypot(annotation.end.x - annotation.start.x, annotation.end.y - annotation.start.y) < 6;
    case "rectangle":
    case "ellipse":
    case "blur":
    case "pixelate":
    case "redact":
      return annotation.rect.width < 6 || annotation.rect.height < 6;
    case "pencil":
    case "highlighter":
      return annotation.points.length < 2;
    case "text":
      return annotation.text.trim().length === 0;
    case "counter":
      return false;
  }
}
