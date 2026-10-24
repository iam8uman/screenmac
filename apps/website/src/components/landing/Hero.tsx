import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Kbd } from "@/components/ui/Badge";
import { primaryCta, product, shortcuts } from "@/lib/product";
import { CaptureMarquee } from "./CaptureMarquee";

/**
 * Centered, dark hero. The live editor (Showcase) sits directly under it on the same night stage,
 * so the first screen is headline → action → the real product.
 */
export function Hero() {
  const cta = primaryCta();

  return (
    <section className="relative px-4 pb-12 pt-12 text-center md:px-6 md:pb-14 md:pt-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <Link
          href="/#install"
          className="sm-rise group inline-flex items-center gap-3 rounded-full bg-white/[0.06] py-1.5 pl-4 pr-1.5 text-sm text-white/80 ring-1 ring-inset ring-white/10 transition-[background-color,color] duration-150 hover:bg-white/[0.1] hover:text-white"
        >
          <span>
            <span className="font-medium text-white">Screenmac {product.version}</span> is out. Install it in one line
          </span>
          <span className="h-4 w-px bg-white/15" aria-hidden="true" />
          <span className="grid size-7 place-items-center rounded-full bg-white/10 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden="true">
            <ArrowRight className="size-3.5" />
          </span>
        </Link>

        <div className="mt-9 inline-block max-w-full md:mt-10">
          <CaptureMarquee tone="dark">
            <h1 className="text-balance text-[clamp(2.7rem,8vw,6.4rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white">
              Your screen,
              <br />
              captured beautifully.
            </h1>
          </CaptureMarquee>
        </div>

        <p className="sm-rise mt-12 max-w-2xl text-pretty text-lg leading-8 text-white/65 [animation-delay:120ms] md:mt-14 md:text-xl md:leading-9">
          {product.description}
        </p>

        <div className="sm-rise mt-8 flex flex-col items-center gap-3 [animation-delay:180ms] sm:flex-row sm:gap-2">
          <Link
            href={cta.href}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-medium text-ink shadow-[0_0_0_4px_rgba(255,255,255,0.08),0_10px_30px_-10px_rgba(255,255,255,0.35)] transition-[background-color,transform] duration-150 ease-out hover:bg-white/90 active:scale-[0.97]"
          >
            {cta.label}
          </Link>
          <Link
            href="#editor"
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl px-5 text-base font-medium text-white/85 transition-colors duration-150 hover:text-white"
          >
            Try the editor
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <p className="sm-rise mt-5 text-sm text-white/45 [animation-delay:220ms]">
          Free while in beta · macOS {product.minimumMacOS}+ · Apple silicon and Intel
        </p>

        <dl
          className="sm-rise mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/55 [animation-delay:260ms]"
          aria-label="Default shortcuts"
        >
          {[
            { keys: shortcuts.area, label: "Area" },
            { keys: shortcuts.window, label: "Window" },
            { keys: shortcuts.fullScreen, label: "Full screen" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <dt className="order-last">{row.label}</dt>
              <dd className="flex gap-1">
                {row.keys.map((key) => (
                  <Kbd key={key} tone="dark">
                    {key}
                  </Kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
