import { LinkButton } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Badge";
import { primaryCta, product, shortcuts } from "@/lib/product";
import { CaptureMarquee } from "./CaptureMarquee";

export function Hero() {
  const cta = primaryCta();

  return (
    <section className="px-4 pb-14 pt-14 md:px-6 md:pb-20 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="inline-block max-w-full">
          <CaptureMarquee>
            <h1 className="text-[clamp(2.6rem,7.4vw,5.9rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">
              Your screen,
              <br />
              captured beautifully.
            </h1>
          </CaptureMarquee>
        </div>
        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="max-w-xl">
            <p className="text-lg leading-8 text-ink-muted md:text-xl md:leading-8">{product.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href={cta.href} size="lg">
                {cta.label}
              </LinkButton>
              <LinkButton href="#editor" size="lg" variant="secondary">
                Try the editor
              </LinkButton>
            </div>
            <p className="mt-4 text-sm text-ink-faint">
              Version {product.version}, free while in beta. macOS {product.minimumMacOS}+, Apple silicon and Intel.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm md:grid-cols-1 md:text-right" aria-label="Default shortcuts">
            {[
              { keys: shortcuts.area, label: "Area" },
              { keys: shortcuts.window, label: "Window" },
              { keys: shortcuts.fullScreen, label: "Full screen" },
            ].map((row) => (
              <div key={row.label} className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-end md:gap-3">
                <dt className="text-ink-muted md:order-first">{row.label}</dt>
                <dd className="flex gap-1">
                  {row.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
