import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { hasDownloadArtifact, product } from "@/lib/product";

export const metadata: Metadata = {
  title: "Download",
  description: "Join the Screenmac Mac beta list. A download appears here once a signed build exists.",
};

export default function DownloadPage() {
  const ready = hasDownloadArtifact() && product.downloadUrl;

  if (ready) {
    return (
      <PageHeader title="Download Screenmac for Mac.">
        <p>The current signed and notarized build, for macOS {product.minimumMacOS} or later.</p>
        <LinkButton href={product.downloadUrl!} size="lg" className="mt-8">
          Download for Mac
        </LinkButton>
      </PageHeader>
    );
  }

  return (
    <>
      <PageHeader title="The Mac app isn't ready to download yet.">
        <p>
          There&apos;s no signed build to share yet, so there&apos;s no download button. Leave your email and we&apos;ll
          write once, when the beta build is ready.
        </p>
      </PageHeader>
      <div className="px-4 pb-24 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="max-w-xl">
            <WaitlistForm id="download-email" />
            <p className="mt-6 text-sm leading-6 text-ink-muted">
              Prefer email? Write to{" "}
              <a className="text-ink underline underline-offset-2" href={`mailto:${product.email}`}>
                {product.email}
              </a>
              . Your address is used only for the beta announcement.
            </p>
          </div>
          <div className="rounded-[20px] bg-paper-raised p-6 ring-1 ring-line">
            <h2 className="font-semibold text-ink">While you wait</h2>
            <p className="mt-2 leading-7 text-ink-muted">
              The annotation editor runs in your browser today. Open one of your own screenshots in it, mark it up, and
              export a PNG.
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
