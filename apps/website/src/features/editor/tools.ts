import type { ToolId } from "./model";

export interface ToolInfo {
  id: ToolId;
  label: string;
  /** Single-key shortcut (case-insensitive). */
  key: string;
  group: "edit" | "draw" | "shape" | "privacy" | "mark";
}

export const TOOLS: readonly ToolInfo[] = [
  { id: "select", label: "Select", key: "v", group: "edit" },
  { id: "crop", label: "Crop", key: "c", group: "edit" },
  { id: "arrow", label: "Arrow", key: "a", group: "draw" },
  { id: "line", label: "Line", key: "l", group: "draw" },
  { id: "rectangle", label: "Rectangle", key: "r", group: "shape" },
  { id: "filled-rectangle", label: "Filled rectangle", key: "f", group: "shape" },
  { id: "ellipse", label: "Ellipse", key: "o", group: "shape" },
  { id: "text", label: "Text", key: "t", group: "mark" },
  { id: "counter", label: "Counter", key: "n", group: "mark" },
  { id: "highlighter", label: "Highlighter", key: "h", group: "draw" },
  { id: "pencil", label: "Pencil", key: "p", group: "draw" },
  { id: "blur", label: "Blur", key: "b", group: "privacy" },
  { id: "pixelate", label: "Pixelate", key: "x", group: "privacy" },
  { id: "redact", label: "Redact", key: "d", group: "privacy" },
];

export function toolForKey(key: string): ToolId | null {
  const lower = key.toLowerCase();
  return TOOLS.find((tool) => tool.key === lower)?.id ?? null;
}

export function toolInfo(id: ToolId): ToolInfo {
  const info = TOOLS.find((tool) => tool.id === id);
  if (!info) throw new Error(`Unknown tool ${id}`);
  return info;
}

/** Tools whose output uses the color/stroke style controls. */
export const STYLED_TOOLS: ReadonlySet<ToolId> = new Set([
  "arrow",
  "line",
  "rectangle",
  "filled-rectangle",
  "ellipse",
  "text",
  "counter",
  "highlighter",
  "pencil",
]);
