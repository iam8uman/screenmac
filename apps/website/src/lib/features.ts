/**
 * Every capability the site mentions, with an honest availability status.
 * Marketing components render from this list; change a status only when it
 * becomes true.
 */
export type Availability = "editor" | "building" | "planned";

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  editor: "Try it in the editor",
  building: "In the Mac beta",
  planned: "Planned",
};

export const AVAILABILITY_DESCRIPTION: Record<Availability, string> = {
  editor: "Works today in the browser editor on this site.",
  building: "In the native Mac app, available as a free beta download.",
  planned: "On the roadmap. Not built yet.",
};

export interface Feature {
  id: string;
  name: string;
  detail: string;
  status: Availability;
}

export interface FeatureGroup {
  id: string;
  title: string;
  summary: string;
  features: Feature[];
}

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "capture",
    title: "Capture",
    summary: "One shortcut, then drag. Screenmac picks the right display and keeps Retina detail.",
    features: [
      { id: "area", name: "Area capture", detail: "Crosshair selection you can nudge and resize before you confirm.", status: "building" },
      { id: "window", name: "Window capture", detail: "Hover to highlight a window, click to capture it alone.", status: "building" },
      { id: "fullscreen", name: "Full screen", detail: "The display under your pointer, at native resolution.", status: "building" },
      { id: "hotkeys", name: "Global shortcuts", detail: "Configurable, and checked against the shortcuts macOS already uses.", status: "building" },
      { id: "recording", name: "Screen recording", detail: "Display, area, or window to MP4, with microphone if you allow it.", status: "building" },
      { id: "scrolling", name: "Scrolling capture", detail: "Long pages stitched into one image, for apps we've tested.", status: "planned" },
    ],
  },
  {
    id: "markup",
    title: "Mark up",
    summary: "Fourteen tools that look good by default, so a screenshot explains itself.",
    features: [
      { id: "arrows", name: "Arrows, lines, and shapes", detail: "Tapered arrows, rectangles, ellipses, solid blocks. Shift snaps.", status: "editor" },
      { id: "text", name: "Text labels", detail: "Plain text or a filled label that stays readable on any background.", status: "editor" },
      { id: "counters", name: "Numbered steps", detail: "Click, click, click. Steps number themselves in order.", status: "editor" },
      { id: "freehand", name: "Highlighter and pencil", detail: "Smoothed strokes that don't look like a trackpad accident.", status: "editor" },
      { id: "crop", name: "Crop", detail: "Free or fixed aspect ratio, with the pixel size shown as you drag.", status: "editor" },
      { id: "backdrop", name: "Backgrounds", detail: "Padding, rounded corners, and a soft shadow for slides and posts.", status: "editor" },
    ],
  },
  {
    id: "protect",
    title: "Protect",
    summary: "Hide tokens, emails, and card numbers before anything leaves your screen.",
    features: [
      { id: "redact", name: "Solid redaction", detail: "Pixels are replaced in the export. Nothing underneath survives.", status: "editor" },
      { id: "blur", name: "Blur and pixelate", detail: "Computed from the image and flattened into the file you save.", status: "editor" },
      { id: "local", name: "Local by default", detail: "No account. Captures and history stay in your Mac's Application Support folder.", status: "building" },
      { id: "ocr", name: "Copy text from images", detail: "On-device text recognition with Apple's Vision framework.", status: "planned" },
    ],
  },
  {
    id: "share",
    title: "Share and keep",
    summary: "Get the result where it's going without hunting through Desktop files.",
    features: [
      { id: "quickaccess", name: "Quick Access preview", detail: "A small floating preview: annotate, copy, save, drag, or dismiss.", status: "building" },
      { id: "export", name: "Copy and export PNG", detail: "Straight to the clipboard, or a file named like a Mac screenshot.", status: "editor" },
      { id: "history", name: "Capture history", detail: "Search past captures, reveal them in Finder, or reopen them in the editor.", status: "building" },
      { id: "cloud", name: "Share links", detail: "Upload and share with a link. Not built, and won't be shown as working until it is.", status: "planned" },
    ],
  },
];

export function allFeatures(): Feature[] {
  return FEATURE_GROUPS.flatMap((group) => group.features);
}
