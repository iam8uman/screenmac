/**
 * Release truth. Marketing copy reads from here so the site never promises
 * something that does not exist yet. Flip a flag only when the thing ships.
 */
export const product = {
  name: "Screenmac",
  siteUrl: "https://screenmac.vercel.app",
  /** Must match MARKETING_VERSION in apps/macos (a unit test checks this). */
  version: "0.2.0",
  repoUrl: "https://github.com/iam8uman/screenmac",
  tagline: "Capture anything. Make it clear. Share it instantly.",
  headline: "Your screen, captured beautifully.",
  description:
    "A native Mac app for screenshots and screen recordings. Capture an area, a window, or a whole display, mark it up, hide what's private, and share it in seconds.",
  minimumMacOS: "14",
  email: "hello@screenmac.app",
  /** Built and published by .github/workflows/ci.yml on every new version pushed to main. */
  downloadUrl: "https://github.com/iam8uman/screenmac/releases/latest/download/Screenmac.zip" as string | null,
  checksumUrl: "https://github.com/iam8uman/screenmac/releases/latest/download/Screenmac.zip.sha256",
  releasesUrl: "https://github.com/iam8uman/screenmac/releases",
  installCommand: "curl -fsSL https://screenmac.vercel.app/install.sh | bash",
  /** Ad-hoc signed by CI. Flip once builds are signed with a Developer ID and notarized. */
  notarized: false,
  billingLive: false,
  cloudLive: false,
  copyrightYear: 2026,
} as const;

export function hasDownloadArtifact(): boolean {
  return Boolean(product.downloadUrl);
}

export function primaryCta(): { href: string; label: string } {
  return hasDownloadArtifact()
    ? { href: "/#install", label: "Download for Mac" }
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
