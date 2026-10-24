import type { Metadata } from "next";
import { Install } from "@/components/install/Install";
import { LinkButton } from "@/components/ui/Button";
import { product } from "@/lib/product";

export const metadata: Metadata = {
  title: "Download",
  description: `Download Screenmac ${product.version} for macOS ${product.minimumMacOS} or later, or install it with one line in Terminal.`,
};


export default function DownloadPage() {
  return (
    <>
      <Install headingLevel={1} />
      <div className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="rounded-[22px] bg-paper-raised p-6 ring-1 ring-line">
            <h2 className="font-semibold text-ink">Build it yourself</h2>
            <p className="mt-2 leading-7 text-ink-muted">
              Screenmac is a native SwiftUI and ScreenCaptureKit app. Clone the repository, open{" "}
              <code className="rounded bg-paper-sunk px-1.5 py-0.5 font-mono text-[0.85em]">apps/macos/Screenmac.xcodeproj</code>{" "}
              in Xcode 16 and press Run.
            </p>
            <LinkButton href={product.repoUrl} variant="secondary" className="mt-5">
              View the source
            </LinkButton>
          </div>
          <div className="rounded-[22px] bg-paper-raised p-6 ring-1 ring-line">
            <h2 className="font-semibold text-ink">Not on a Mac right now?</h2>
            <p className="mt-2 leading-7 text-ink-muted">
              The annotation editor runs in your browser. Open one of your own screenshots in it, mark it up, and export a PNG.
            </p>
            <LinkButton href="/editor" variant="secondary" className="mt-5">
              Open the editor
            </LinkButton>
          </div>
        </div>
      </div>
    </>
  );
}
