import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { hasDownloadArtifact, product } from "@/lib/product";
import { LinkButton } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";

export function FinalCTA() {
  const ready = hasDownloadArtifact();
  return (
    <section aria-labelledby="cta-title" className="px-4 pb-24 md:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[24px] bg-accent px-6 py-14 text-white md:px-14 md:py-20">
        <LogoMark className="size-11 [&_rect:first-child]:fill-white [&_path]:stroke-[var(--sm-accent)] [&_rect:last-child]:fill-[var(--sm-ink)]" />
        <h2 id="cta-title" className="mt-8 max-w-2xl text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
          {ready ? "Get Screenmac for your Mac." : "Be first to get the Mac app."}
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
          {ready
            ? `Version ${product.version} for macOS ${product.minimumMacOS} and later. Free while in beta, Apple silicon and Intel.`
            : "We'll email you once when there's a signed beta build to download. Nothing else."}
        </p>
        <div className="mt-8 max-w-xl">
          {ready && product.downloadUrl ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/#install" size="lg" className="bg-white text-ink hover:bg-white/90">
                Download for Mac
              </LinkButton>
              <LinkButton href={product.repoUrl} size="lg" className="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20">
                View on GitHub
              </LinkButton>
            </div>
          ) : (
            <WaitlistForm tone="accent" id="cta-email" />
          )}
        </div>
      </div>
    </section>
  );
}
