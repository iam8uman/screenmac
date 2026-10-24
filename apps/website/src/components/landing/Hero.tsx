import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Kbd } from "@/components/ui/Badge";
import { primaryCta, shortcuts } from "@/lib/product";
import { CaptureMarquee } from "./CaptureMarquee";

/**
 * Centered, dark hero: the pill says what it is and what it costs, the headline sells the feeling,
 * one primary action, and the live editor (Showcase) peeks in right below on the same night stage.
 */
export function Hero() {
  const cta = primaryCta();

  return (
    <section className="relative flex flex-col justify-center px-4 pb-10 pt-10 text-center md:min-h-[calc(100svh-4rem-9rem)] md:px-6 md:pb-12 md:pt-12">
      {/* Fills the first screen minus a 9rem strip where the live editor peeks in. */}
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <Link
          href="/#install"
          className="sm-rise group inline-flex max-w-full items-center gap-3 rounded-full bg-white/[0.06] py-1.5 pl-4 pr-1.5 text-left text-sm text-white/80 ring-1 ring-inset ring-white/10 transition-[background-color,color] duration-150 hover:bg-white/[0.1] hover:text-white"
        >
          <span>
            <span className="font-medium text-white">Free for macOS</span>, with the source on GitHub. Install it in one line
          </span>
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden="true">
            <ArrowRight className="size-3.5" />
          </span>
        </Link>

        <div className="mt-9 inline-block max-w-full md:mt-10">
          <CaptureMarquee tone="dark">
            <h1 className="text-balance text-[clamp(2.7rem,8vw,6.4rem)] font-medium leading-[0.98] tracking-[-0.045em] text-white [overflow-wrap:break-word]">
              Your screen,
              <br />
              captured beautifully.
            </h1>
          </CaptureMarquee>
        </div>

        <div className="sm-rise mt-14 flex flex-col items-center gap-3 [animation-delay:120ms] sm:flex-row sm:gap-2 md:mt-16">
          <Link
            href={cta.href}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-base font-medium text-ink shadow-[0_0_0_4px_rgba(255,255,255,0.08),0_10px_30px_-10px_rgba(255,255,255,0.35)] transition-[background-color,transform] duration-150 ease-out hover:bg-white/90 active:scale-[0.97]"
          >
            Download free for Mac
          </Link>
          <Link
            href="#editor"
            className="inline-flex h-12 items-center justify-center rounded-xl px-5 text-base font-medium text-white/80 ring-1 ring-inset ring-white/15 transition-[background-color,color,transform] duration-150 ease-out hover:bg-white/[0.06] hover:text-white active:scale-[0.97]"
          >
            Try the editor
          </Link>
        </div>

        <dl
          className="sm-rise mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/55 [animation-delay:200ms]"
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
