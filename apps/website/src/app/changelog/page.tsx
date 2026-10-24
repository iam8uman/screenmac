import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What changed in Screenmac, newest first. Only shipped changes are listed.",
};

const ENTRIES = [
  {
    date: "2026-10-24",
    title: "Mac app 0.2.0, the first public beta",
    items: [
      "Download Screenmac.zip from GitHub Releases or install with one line in Terminal. One universal build for Apple silicon and Intel, macOS 14 or later.",
      "Capture an area, a window, or a full screen with global shortcuts, then annotate, copy, or save from the Quick Access preview.",
      "Screen recording to MP4 with optional microphone, plus local capture history.",
      "If captures fail after an update, Fix Screen Recording Permission… in the menu bar resets Screenmac's own permission so macOS asks again.",
      "Every release is built and tested by GitHub Actions and published with a SHA-256 checksum. Builds aren't notarized by Apple yet.",
    ],
  },
  {
    date: "2026-10-23",
    title: "Website and browser editor",
    items: [
      "New website with the annotation editor built in.",
      "Editor: fourteen tools, selection with move and resize, undo and redo, crop with aspect ratios, backgrounds.",
      "Editor: open, paste, or drop your own image. It stays in your browser.",
      "Editor: export a flattened PNG or copy it to the clipboard. Redaction, blur, and pixelate are written into the pixels.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <PageHeader title="Changelog">
        <p>Shipped changes only, newest first.</p>
      </PageHeader>
      <div className="px-4 pb-24 md:px-6">
        <ol className="mx-auto max-w-6xl divide-y divide-line border-y border-line">
          {ENTRIES.map((entry) => (
            <li key={entry.date} className="grid gap-4 py-10 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]">
              <time dateTime={entry.date} className="font-mono text-sm text-ink-muted">
                {entry.date}
              </time>
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink">{entry.title}</h2>
                <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 leading-7 text-ink-muted">
                  {entry.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
