/**
 * Release truth. Marketing copy reads from here so the site never promises
 * something that does not exist yet. Flip a flag only when the thing ships.
 */
export const product = {
  name: "Screenmac",
  siteUrl: "https://screenmac.app",
  tagline: "Capture anything. Make it clear. Share it instantly.",
  headline: "Your screen, captured beautifully.",
  description:
    "A native Mac app for screenshots and screen recordings. Capture an area, a window, or a whole display, mark it up, hide what's private, and share it in seconds.",
  minimumMacOS: "14",
  email: "hello@screenmac.app",
  /** Set to the notarized .dmg URL once a signed build exists. */
  downloadUrl: null as string | null,
  billingLive: false,
  cloudLive: false,
  copyrightYear: 2026,
} as const;

export function hasDownloadArtifact(): boolean {
  return Boolean(product.downloadUrl);
}

export function primaryCta(): { href: string; label: string } {
  return hasDownloadArtifact()
    ? { href: "/download", label: "Download for Mac" }
    : { href: "/download", label: "Join the Mac beta" };
}

/** Default global shortcuts in the Mac app (apps/macos/Screenmac/Hotkeys/Shortcut.swift). */
export const shortcuts = {
  area: ["⌥", "⇧", "⌘", "4"],
  window: ["⌥", "⇧", "⌘", "2"],
  fullScreen: ["⌥", "⇧", "⌘", "3"],
  record: ["⌥", "⇧", "⌘", "5"],
} as const;

export const shortcutText = (keys: readonly string[]) => keys.join("");
