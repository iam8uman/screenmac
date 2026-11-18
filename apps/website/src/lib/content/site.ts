/** Shared data for guides, tools and quizzes. Mirrors the Windowmac/Slidemac content kit. */
import { product } from "@/lib/product";

export type AppKey = "windowmac" | "slidemac" | "screenmac";

export const SITE_KEY: AppKey = "screenmac";
export const AUTHOR = { name: "Suman Sharma", url: "https://github.com/iam8uman" };

export interface AppInfo {
  key: AppKey;
  name: string;
  url: string;
  icon: string;
  pitch: string;
}

/** The three free Mac apps. Every guide cross-promotes all three. */
export const APPS: AppInfo[] = [
  {
    key: "screenmac",
    name: "Screenmac",
    url: "https://www.screenmac.app/",
    icon: "https://www.screenmac.app/icon.png",
    pitch: "Screenshots and screen recordings with annotation and redaction. Native, free, nothing uploaded.",
  },
  {
    key: "windowmac",
    name: "Windowmac",
    url: "https://www.windowmac.app/",
    icon: "https://www.windowmac.app/icon.png",
    pitch: "Hold Option and flick to snap any window to halves, thirds or another screen. Free and open source.",
  },
  {
    key: "slidemac",
    name: "Slidemac",
    url: "https://www.slidemac.app/",
    icon: "https://slidemac.vercel.app/icon.png",
    pitch: "Slide along your trackpad edges for volume, brightness (even external monitors), apps and keyboard light.",
  },
];

/** The three apps, with the post's primary app first and Screenmac second. */
export function appsFor(primary: AppKey) {
  const rank = (k: AppKey) => (k === primary ? 0 : k === SITE_KEY ? 1 : 2);
  return [...APPS].sort((a, b) => rank(a.key) - rank(b.key));
}

/** Facts guides may state about Screenmac. Writers must not claim anything beyond these. */
export const FACTS = [
  `Native macOS app (SwiftUI, AppKit, ScreenCaptureKit; not Electron) for macOS ${product.minimumMacOS} Sonoma or later; one universal build for Apple silicon and Intel.`,
  "Capture an area, a window or a whole display with global shortcuts: Option-Shift-Command-4 area, Option-Shift-Command-2 window, Option-Shift-Command-3 full screen, Option-Shift-Command-5 record.",
  "Annotation editor: arrows, shapes, text, numbered steps, highlighter, crop; redact, blur and pixelate are flattened into the exported pixels.",
  "Screen recording to MP4 with optional microphone.",
  "Quick Access preview to copy, save or drag a capture; local capture history; no account and no uploads.",
  "Free during the beta. A paid Pro tier is planned but not built and not for sale. Builds are ad-hoc signed, not yet notarized.",
  "The same annotation editor runs free in the browser at /editor: open, paste or drop an image, mark it up, export a PNG.",
];

/** Blog topics. A post's `tags` must use these keys; each gets a hub at /blog/topics/<key>. */
export const TOPICS: Record<string, { label: string; description: string }> = {
  "how-to": { label: "How-to guides", description: "Step-by-step answers for screenshots and screen recordings on a Mac." },
  screenshots: { label: "Screenshots", description: "Every way to capture the screen on macOS, and what to do with the result." },
  "screen-recording": { label: "Screen recording", description: "Recording your Mac screen with audio, trimming, sharing and file sizes." },
  "annotation-privacy": { label: "Annotate and redact", description: "Marking up screenshots and hiding private information safely." },
  "keyboard-shortcuts": { label: "Keyboard shortcuts", description: "Screenshot and recording shortcuts on macOS, built-in and in apps." },
  alternatives: { label: "Alternatives and comparisons", description: "Mac screenshot and recording apps compared, and why Screenmac is our pick." },
  "best-apps-2027": { label: "Best Mac apps 2027", description: "Roundups of the Mac apps worth installing in 2027." },
  troubleshooting: { label: "Troubleshooting", description: "Fixes for screenshots and recordings that fail, go missing or come out wrong." },
};

export const absoluteUrl = (path: string) => new URL(path, product.siteUrl).toString();
