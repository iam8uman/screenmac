/**
 * Screenmac browser editor — document model.
 *
 * All coordinates are in *source image pixels*. The view layer converts
 * pointer positions into this space, so zoom, crop, and backdrop padding never
 * change stored geometry.
 */

export type ToolId =
  | "select"
  | "crop"
  | "arrow"
  | "line"
  | "rectangle"
  | "filled-rectangle"
  | "ellipse"
  | "text"
  | "highlighter"
  | "pencil"
  | "blur"
  | "pixelate"
  | "redact"
  | "counter";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BaseAnnotation {
  id: string;
}

export interface SegmentAnnotation extends BaseAnnotation {
  kind: "arrow" | "line";
  start: Point;
  end: Point;
  color: string;
  strokeWidth: number;
}

export interface ShapeAnnotation extends BaseAnnotation {
  kind: "rectangle" | "ellipse";
  rect: Rect;
  color: string;
  strokeWidth: number;
  filled: boolean;
}

export interface StrokeAnnotation extends BaseAnnotation {
  kind: "pencil" | "highlighter";
  points: Point[];
  color: string;
  strokeWidth: number;
}

export interface TextAnnotation extends BaseAnnotation {
  kind: "text";
  origin: Point;
  text: string;
  color: string;
  fontSize: number;
  /** "label" draws the text on a solid pill in `color`. */
  style: "plain" | "label";
}

export interface EffectAnnotation extends BaseAnnotation {
  kind: "blur" | "pixelate" | "redact";
  rect: Rect;
  /** Blur radius or pixel block size in image pixels. Ignored for redact. */
  intensity: number;
}

export interface CounterAnnotation extends BaseAnnotation {
  kind: "counter";
  center: Point;
  value: number;
  color: string;
  radius: number;
}

export type Annotation =
  | SegmentAnnotation
  | ShapeAnnotation
  | StrokeAnnotation
  | TextAnnotation
  | EffectAnnotation
  | CounterAnnotation;

export type AnnotationKind = Annotation["kind"];

export type BackdropId = "none" | "violet" | "dusk" | "mint" | "sand" | "graphite";

export interface Backdrop {
  id: BackdropId;
  /** Padding around the screenshot as a percentage of its longer edge. */
  padding: number;
  /** Screenshot corner radius, in pixels at a 1600px reference width. */
  radius: number;
  shadow: boolean;
}

/** Everything that undo/redo restores and export renders. */
export interface EditorDocument {
  sampleId: string;
  annotations: Annotation[];
  crop: Rect | null;
  backdrop: Backdrop;
}

export interface ImageSize {
  width: number;
  height: number;
}

export const DEFAULT_BACKDROP: Backdrop = {
  id: "none",
  padding: 7,
  radius: 16,
  shadow: true,
};

export function createDocument(sampleId: string): EditorDocument {
  return {
    sampleId,
    annotations: [],
    crop: null,
    backdrop: { ...DEFAULT_BACKDROP },
  };
}

export const PALETTE = [
  { name: "Signal red", value: "#F0443A" },
  { name: "Amber", value: "#FFB020" },
  { name: "Mint", value: "#19C08A" },
  { name: "Iris", value: "#5B5BF6" },
  { name: "Sky", value: "#2E9BFF" },
  { name: "Ink", value: "#15141A" },
  { name: "Paper", value: "#FFFFFF" },
] as const;

export const STROKE_WIDTHS = [
  { name: "Fine", value: 4 },
  { name: "Medium", value: 7 },
  { name: "Bold", value: 11 },
] as const;

export interface ToolStyle {
  color: string;
  strokeWidth: number;
}

export const DEFAULT_STYLE: ToolStyle = {
  color: PALETTE[0].value,
  strokeWidth: STROKE_WIDTHS[1].value,
};
