import { product } from "@/lib/product";
import { LinkButton } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";
import { CopyCommand } from "@/components/install/CopyCommand";

export function FinalCTA() {
  return (
    <section aria-labelledby="cta-title" className="px-4 pb-24 md:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[24px] bg-accent px-6 py-14 text-white md:px-14 md:py-20">
        <LogoMark className="size-11 [&_rect:first-child]:fill-white [&_path]:stroke-[var(--sm-accent)] [&_rect:last-child]:fill-[var(--sm-ink)]" />
        <h2
          id="cta-title"
          className="mt-8 max-w-2xl text-[clamp(2rem,4.6vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em]"
        >
          Get Screenmac for your Mac.
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
          Paste one line into Terminal. About 10 sec, then press your first shortcut.
        </p>
        <div className="mt-8 flex max-w-2xl flex-col gap-4">
          <CopyCommand command={product.installCommand} tone="onAccent" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/#install" size="lg" variant="inverse">
              Download free for Mac
            </LinkButton>
            <LinkButton href={product.repoUrl} size="lg" variant="glass">
              View on GitHub
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
