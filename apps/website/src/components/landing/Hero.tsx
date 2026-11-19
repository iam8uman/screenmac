import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { primaryCta, product, shortcuts } from "@/lib/product";
import { CaptureMarquee } from "./CaptureMarquee";
import { CaptureStage, CaptureTriggers } from "./capture/CaptureStage";

const makerApps = [
  { name: "Windowmac", href: "https://www.windowmac.app/", icon: "https://www.windowmac.app/icon.png" },
  { name: "Slidemac", href: "https://www.slidemac.app/", icon: "https://slidemac.vercel.app/icon.png" },
];

/**
 * Centered hero on a working capture surface (see CaptureStage): the pill says what it is and what
 * it costs, the headline sells the feeling, one primary action, and the visitor can take a real
 * capture of the page right here. The live editor (Showcase) peeks in right below.
 */
export function Hero() {
  const cta = primaryCta();
  const facts = [
    "Native Swift",
    "ScreenCaptureKit",
    product.notarized ? "Notarized by Apple" : "Open source",
    `macOS ${product.minimumMacOS}+`,
  ];

  return (
    <CaptureStage className="flex flex-col justify-center px-4 pb-12 pt-12 text-center md:min-h-[calc(100svh-5rem-8rem)] md:px-6 md:pb-14 md:pt-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <Link
          href="/#install"
          className="sm-rise group inline-flex max-w-full cursor-pointer items-center gap-3 rounded-2xl bg-paper-raised py-2 pl-4 pr-1.5 text-left text-sm leading-5 text-ink-muted ring-1 ring-inset ring-line transition-[background-color,color] duration-150 hover:bg-paper-sunk hover:text-ink sm:rounded-full sm:py-1.5 sm:leading-normal"
        >
          <span className="min-w-0">
            <span className="font-medium text-ink">Free for macOS</span>
            <span className="hidden sm:inline">, with the source on GitHub. Install it in one line</span>
            <span className="sm:hidden">
              , with the source on GitHub.
              <br />
              Install it in one line
            </span>
          </span>
          <span
            className="grid size-7 shrink-0 place-items-center rounded-full bg-paper-sunk transition-transform duration-200 ease-out group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <ArrowRight className="size-3.5" />
          </span>
        </Link>

        <div className="mt-9 inline-block max-w-full md:mt-11">
          <CaptureMarquee>
            <h1 className="text-balance text-[clamp(2.7rem,8vw,6.4rem)] font-medium leading-[0.98] tracking-[-0.045em] text-ink [overflow-wrap:break-word]">
              Your screen,
              <br />
              captured <span className="bg-gradient-to-br from-accent to-[#a78bfa] bg-clip-text text-transparent">beautifully.</span>
            </h1>
          </CaptureMarquee>
        </div>

        <p className="sm-rise mt-12 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted [animation-delay:80ms] md:mt-14 md:text-lg">
          Take screenshots and record your screen. Mark it up, hide what&apos;s private, and share it in seconds.
        </p>

        <div className="sm-rise mt-8 flex flex-col items-center gap-3 [animation-delay:140ms] sm:flex-row sm:gap-2">
          <Link
            href={cta.href}
            className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-ink px-6 text-base font-medium text-paper shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_10px_24px_-12px_rgba(23,22,28,0.6)] transition-[background-color,transform] duration-150 ease-out hover:bg-ink/85 active:scale-[0.97]"
          >
            Download free for Mac
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="#editor"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-xl bg-paper-raised px-5 text-base font-medium text-ink ring-1 ring-inset ring-line-strong transition-[background-color,color,transform] duration-150 ease-out hover:bg-paper-sunk active:scale-[0.97]"
          >
            Try the editor
          </Link>
        </div>

        <ul
          className="sm-rise mt-5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[13px] text-ink-faint [animation-delay:200ms]"
          aria-label="Built with"
        >
          {facts.map((fact, i) => (
            <li key={fact} className="flex items-center gap-2.5">
              {i > 0 ? <span className="size-1 rounded-full bg-line-strong" aria-hidden="true" /> : null}
              {fact}
            </li>
          ))}
        </ul>

        <p className="sm-rise mt-5 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 rounded-2xl bg-accent-soft/60 px-4 py-2 text-[12.5px] font-medium text-ink-faint ring-1 ring-inset ring-accent/15 [animation-delay:240ms] sm:rounded-full">
          From the creator of
          {makerApps.map((app, i) => (
            <span key={app.name} className="inline-flex items-center gap-2">
              {i > 0 ? <span aria-hidden="true">&amp;</span> : null}
              <a
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-ink transition-colors hover:bg-accent/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.icon} alt="" width={16} height={16} className="size-4 rounded transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
                <b className="font-semibold">{app.name}</b>
              </a>
            </span>
          ))}
        </p>

        <div className="sm-rise mt-12 [animation-delay:280ms] md:mt-14">
          <CaptureTriggers
            items={[
              { kind: "area", label: "Area", keys: shortcuts.area },
              { kind: "window", label: "Window", keys: shortcuts.window },
              { kind: "full", label: "Full screen", keys: shortcuts.fullScreen },
            ]}
          />
        </div>
      </div>
    </CaptureStage>
  );
}
