/**
 * Canvas renderer shared by the live editor view and PNG export.
 *
 * The same function produces what you see and what you download, so the
 * exported file is a faithful, flattened copy: blur, pixelate, and redact are
 * written into the output pixels, never layered on top as removable objects.
 */
import { TEXT_LINE_HEIGHT, TEXT_PADDING_X, TEXT_PADDING_Y, clampRect, getBounds, setTextMeasurer } from "./geometry";
import type {
  Annotation,
  Backdrop,
  BackdropId,
  EditorDocument,
  EffectAnnotation,
  ImageSize,
  Point,
  Rect,
  SegmentAnnotation,
  StrokeAnnotation,
  TextAnnotation,
} from "./model";

type Ctx = CanvasRenderingContext2D;
export type ImageSource = CanvasImageSource & { width: number; height: number };

export interface Layout {
  /** Region of the source image that is visible (crop or full image). */
  view: Rect;
  /** Offset of the view inside the output, in output pixels. */
  offset: Point;
  outputWidth: number;
  outputHeight: number;
  /** Rounded corner radius of the screenshot, output pixels. */
  radius: number;
}

export interface BackdropPreset {
  id: BackdropId;
  label: string;
  stops: readonly [string, string];
}

export const BACKDROPS: readonly BackdropPreset[] = [
  { id: "none", label: "None", stops: ["transparent", "transparent"] },
  { id: "violet", label: "Iris", stops: ["#6D6BFF", "#C3B5FF"] },
  { id: "dusk", label: "Dusk", stops: ["#FF8E6E", "#8A5CF6"] },
  { id: "mint", label: "Mint", stops: ["#9BEBC8", "#3A9F8C"] },
  { id: "sand", label: "Sand", stops: ["#F6EBDA", "#DDBF96"] },
  { id: "graphite", label: "Graphite", stops: ["#3A3A44", "#121217"] },
];

export const FONT_STACK = "ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif";

export function computeLayout(doc: Pick<EditorDocument, "crop" | "backdrop">, image: ImageSize): Layout {
  const view = doc.crop ?? { x: 0, y: 0, width: image.width, height: image.height };
  const framed = doc.backdrop.id !== "none";
  const longEdge = Math.max(view.width, view.height);
  const pad = framed ? Math.round((doc.backdrop.padding / 100) * longEdge) : 0;
  const radius = framed ? Math.round(doc.backdrop.radius * (longEdge / 1600)) : 0;
  return {
    view,
    offset: { x: pad, y: pad },
    outputWidth: Math.max(1, Math.round(view.width + pad * 2)),
    outputHeight: Math.max(1, Math.round(view.height + pad * 2)),
    radius,
  };
}

/** Output-space point → image-space point. */
export function outputToImage(layout: Layout, point: Point): Point {
  return { x: point.x - layout.offset.x + layout.view.x, y: point.y - layout.offset.y + layout.view.y };
}

/** Image-space point → output-space point. */
export function imageToOutput(layout: Layout, point: Point): Point {
  return { x: point.x - layout.view.x + layout.offset.x, y: point.y - layout.view.y + layout.offset.y };
}

function roundRectPath(ctx: Ctx, rect: Rect, radius: number) {
  const r = Math.max(0, Math.min(radius, rect.width / 2, rect.height / 2));
  ctx.beginPath();
  ctx.moveTo(rect.x + r, rect.y);
  ctx.arcTo(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height, r);
  ctx.arcTo(rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height, r);
  ctx.arcTo(rect.x, rect.y + rect.height, rect.x, rect.y, r);
  ctx.arcTo(rect.x, rect.y, rect.x + rect.width, rect.y, r);
  ctx.closePath();
}

function paintBackdrop(ctx: Ctx, backdrop: Backdrop, layout: Layout) {
  const preset = BACKDROPS.find((item) => item.id === backdrop.id);
  if (!preset || preset.id === "none") return;
  const gradient = ctx.createLinearGradient(0, 0, layout.outputWidth, layout.outputHeight);
  gradient.addColorStop(0, preset.stops[0]);
  gradient.addColorStop(1, preset.stops[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, layout.outputWidth, layout.outputHeight);

  if (backdrop.shadow) {
    const longEdge = Math.max(layout.view.width, layout.view.height);
    ctx.save();
    ctx.shadowColor = "rgba(12, 10, 30, 0.35)";
    ctx.shadowBlur = longEdge * 0.04;
    ctx.shadowOffsetY = longEdge * 0.014;
    ctx.fillStyle = "#000";
    roundRectPath(ctx, { ...layout.offset, width: layout.view.width, height: layout.view.height }, layout.radius);
    ctx.fill();
    ctx.restore();
  }
}

function withShadow(ctx: Ctx, strokeWidth: number) {
  ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
  ctx.shadowBlur = Math.max(3, strokeWidth * 0.9);
  ctx.shadowOffsetY = Math.max(1, strokeWidth * 0.2);
}

function drawSegment(ctx: Ctx, a: SegmentAnnotation) {
  const { start, end, strokeWidth: w, color } = a;
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  ctx.save();
  withShadow(ctx, w);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = w;
  if (a.kind === "line") {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const head = Math.min(Math.max(w * 3.4, 16), length * 0.6);
  const spread = Math.PI / 7;
  const base = { x: end.x - Math.cos(angle) * head * 0.82, y: end.y - Math.sin(angle) * head * 0.82 };
  // Tapered shaft: narrow at the tail, full width at the head.
  const tail = w * 0.35;
  const nx = Math.sin(angle);
  const ny = -Math.cos(angle);
  ctx.beginPath();
  ctx.moveTo(start.x + nx * tail, start.y + ny * tail);
  ctx.lineTo(base.x + nx * (w / 2), base.y + ny * (w / 2));
  ctx.lineTo(base.x - nx * (w / 2), base.y - ny * (w / 2));
  ctx.lineTo(start.x - nx * tail, start.y - ny * tail);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(start.x, start.y, tail, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - Math.cos(angle - spread) * head, end.y - Math.sin(angle - spread) * head);
  ctx.quadraticCurveTo(base.x, base.y, end.x - Math.cos(angle + spread) * head, end.y - Math.sin(angle + spread) * head);
  ctx.closePath();
  ctx.lineWidth = Math.max(2, w * 0.35);
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

function strokePath(ctx: Ctx, points: readonly Point[]) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 1) {
    ctx.lineTo(points[0].x + 0.01, points[0].y);
    return;
  }
  for (let i = 1; i < points.length - 1; i += 1) {
    const mid = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
    ctx.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
}

function drawStroke(ctx: Ctx, a: StrokeAnnotation) {
  if (a.points.length === 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = a.color;
  ctx.lineWidth = a.strokeWidth;
  if (a.kind === "highlighter") {
    ctx.globalAlpha = 0.42;
  } else {
    withShadow(ctx, a.strokeWidth * 0.6);
  }
  strokePath(ctx, a.points);
  ctx.stroke();
  ctx.restore();
}

/** Readable foreground for text placed on `color`. */
export function contrastingInk(color: string): string {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return "#FFFFFF";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#15141A" : "#FFFFFF";
}

function drawText(ctx: Ctx, a: TextAnnotation, fontFamily: string) {
  const bounds = getBounds(a);
  ctx.save();
  ctx.font = `600 ${a.fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";
  const lines = a.text.split("\n");
  const x = a.origin.x + a.fontSize * TEXT_PADDING_X;
  const y0 = a.origin.y + a.fontSize * TEXT_PADDING_Y + a.fontSize * (TEXT_LINE_HEIGHT - 1) * 0.5;
  if (a.style === "label") {
    withShadow(ctx, a.fontSize * 0.3);
    ctx.fillStyle = a.color;
    roundRectPath(ctx, bounds, a.fontSize * 0.42);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = contrastingInk(a.color);
  } else {
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = a.fontSize * 0.18;
    ctx.shadowOffsetY = a.fontSize * 0.04;
    ctx.fillStyle = a.color;
  }
  lines.forEach((line, index) => ctx.fillText(line, x, y0 + index * a.fontSize * TEXT_LINE_HEIGHT));
  ctx.restore();
}

let scratch: HTMLCanvasElement | null = null;
let scratchB: HTMLCanvasElement | null = null;
function scratchCanvas(which: "a" | "b", width: number, height: number): HTMLCanvasElement {
  const existing = which === "a" ? scratch : scratchB;
  const canvas = existing ?? document.createElement("canvas");
  if (which === "a") scratch = canvas;
  else scratchB = canvas;
  canvas.width = Math.max(1, Math.ceil(width));
  canvas.height = Math.max(1, Math.ceil(height));
  return canvas;
}

/**
 * Rewrite the pixels beneath an effect region. `deviceRect` is in the
 * canvas's own pixel space (the renderer keeps an identity scale).
 */
function applyEffect(ctx: Ctx, a: EffectAnnotation, deviceRect: Rect) {
  const { x, y, width, height } = {
    x: Math.floor(deviceRect.x),
    y: Math.floor(deviceRect.y),
    width: Math.ceil(deviceRect.width),
    height: Math.ceil(deviceRect.height),
  };
  if (width < 1 || height < 1) return;
  const source = ctx.canvas;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (a.kind === "redact") {
    ctx.fillStyle = "#0E0E12";
    ctx.fillRect(x, y, width, height);
    ctx.restore();
    return;
  }

  if (a.kind === "pixelate") {
    const block = Math.max(4, a.intensity);
    const small = scratchCanvas("a", width / block, height / block);
    const sctx = small.getContext("2d");
    if (sctx) {
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = "high";
      sctx.drawImage(source, x, y, width, height, 0, 0, small.width, small.height);
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, small.width, small.height, x, y, small.width * block, small.height * block);
    }
    ctx.restore();
    return;
  }

  // Blur: down-sample (discards detail for real), then smooth back up.
  const factor = Math.max(2, a.intensity / 2.5);
  const small = scratchCanvas("a", width / factor, height / factor);
  const mid = scratchCanvas("b", width / 2, height / 2);
  const sctx = small.getContext("2d");
  const mctx = mid.getContext("2d");
  if (sctx && mctx) {
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(source, x, y, width, height, 0, 0, small.width, small.height);
    mctx.imageSmoothingEnabled = true;
    mctx.imageSmoothingQuality = "high";
    if ("filter" in mctx) mctx.filter = `blur(${Math.max(1, factor / 3)}px)`;
    mctx.drawImage(small, 0, 0, small.width, small.height, -2, -2, mid.width + 4, mid.height + 4);
    if ("filter" in mctx) mctx.filter = "none";
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(mid, 0, 0, mid.width, mid.height, x, y, width, height);
  }
  ctx.restore();
}

export interface RenderOptions {
  image: ImageSource;
  imageSize: ImageSize;
  doc: EditorDocument;
  /** Annotations to draw (lets the view include an in-progress draft). */
  annotations?: readonly Annotation[];
  /** Skip crop/backdrop: draw the full image (used while the crop tool is active). */
  ignoreCrop?: boolean;
  fontFamily?: string;
  /** Annotation ids to skip (e.g. text currently being edited in an overlay). */
  hiddenIds?: ReadonlySet<string>;
}

/**
 * Render a document into `ctx` at output resolution. The context's canvas is
 * resized to the layout's output size. Returns the layout used.
 */
export function renderDocument(ctx: Ctx, options: RenderOptions): Layout {
  const { image, imageSize, doc } = options;
  const fontFamily = options.fontFamily ?? FONT_STACK;
  const layoutDoc = options.ignoreCrop ? { crop: null, backdrop: { ...doc.backdrop, id: "none" as const } } : doc;
  const layout = computeLayout(layoutDoc, imageSize);
  const canvas = ctx.canvas;
  if (canvas.width !== layout.outputWidth) canvas.width = layout.outputWidth;
  if (canvas.height !== layout.outputHeight) canvas.height = layout.outputHeight;

  setTextMeasurer((text, fontSize) => {
    ctx.save();
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    const width = ctx.measureText(text).width;
    ctx.restore();
    return width;
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintBackdrop(ctx, layoutDoc.backdrop, layout);

  ctx.save();
  roundRectPath(ctx, { ...layout.offset, width: layout.view.width, height: layout.view.height }, layout.radius);
  ctx.clip();
  const tx = layout.offset.x - layout.view.x;
  const ty = layout.offset.y - layout.view.y;
  ctx.setTransform(1, 0, 0, 1, tx, ty);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, 0, 0, imageSize.width, imageSize.height);

  for (const a of options.annotations ?? doc.annotations) {
    if (options.hiddenIds?.has(a.id)) continue;
    switch (a.kind) {
      case "arrow":
      case "line":
        drawSegment(ctx, a);
        break;
      case "rectangle":
      case "ellipse": {
        ctx.save();
        withShadow(ctx, a.strokeWidth);
        ctx.strokeStyle = a.color;
        ctx.fillStyle = a.color;
        ctx.lineWidth = a.strokeWidth;
        ctx.lineJoin = "round";
        if (a.kind === "rectangle") {
          roundRectPath(ctx, a.rect, Math.max(4, a.strokeWidth * 1.1));
        } else {
          ctx.beginPath();
          ctx.ellipse(
            a.rect.x + a.rect.width / 2,
            a.rect.y + a.rect.height / 2,
            Math.max(0.5, a.rect.width / 2),
            Math.max(0.5, a.rect.height / 2),
            0,
            0,
            Math.PI * 2,
          );
        }
        if (a.filled) ctx.fill();
        else ctx.stroke();
        ctx.restore();
        break;
      }
      case "pencil":
      case "highlighter":
        drawStroke(ctx, a);
        break;
      case "text":
        drawText(ctx, a, fontFamily);
        break;
      case "counter": {
        ctx.save();
        withShadow(ctx, a.radius * 0.4);
        ctx.fillStyle = a.color;
        ctx.beginPath();
        ctx.arc(a.center.x, a.center.y, a.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.lineWidth = Math.max(2, a.radius * 0.14);
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.stroke();
        ctx.fillStyle = contrastingInk(a.color);
        ctx.font = `700 ${Math.round(a.radius * 1.05)}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(a.value), a.center.x, a.center.y + a.radius * 0.04);
        ctx.restore();
        break;
      }
      case "blur":
      case "pixelate":
      case "redact": {
        const region = clampRect(a.rect, imageSize);
        applyEffect(ctx, a, { x: region.x + tx, y: region.y + ty, width: region.width, height: region.height });
        break;
      }
    }
  }
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return layout;
}
