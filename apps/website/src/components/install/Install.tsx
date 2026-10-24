import { ArrowDownToLine, FileCheck2, ShieldCheck } from "lucide-react";
import { Kbd } from "@/components/ui/Badge";
import { product, shortcuts } from "@/lib/product";
import { CopyCommand } from "./CopyCommand";
import { GitHubMark } from "./GitHubMark";

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Unzip and move it to Applications",
    body: (
      <>
        Open <strong className="font-medium text-ink">Screenmac.zip</strong>{" "}
        from Downloads and drag{" "}
        <strong className="font-medium text-ink">Screenmac</strong> into
        Applications.
      </>
    ),
  },
  {
    title: "Open it the first time",
    body: (
      <>
        It isn&apos;t notarized yet, so macOS asks first. On macOS 15, open it
        once, then choose{" "}
        <strong className="font-medium text-ink">
          System Settings → Privacy &amp; Security → Open Anyway
        </strong>
        . On macOS 14, right-click Screenmac and choose{" "}
        <strong className="font-medium text-ink">Open</strong>.
      </>
    ),
  },
  {
    title: "Allow Screen Recording",
    body: (
      <>
        Turn Screenmac on in{" "}
        <strong className="font-medium text-ink">
          Privacy &amp; Security → Screen &amp; System Audio Recording
        </strong>
        , then choose{" "}
        <strong className="font-medium text-ink">Quit &amp; Reopen</strong>.
        macOS needs this before any app can see the screen.
      </>
    ),
  },
  {
    title: "Capture something",
    body: (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        Press
        <span className="inline-flex gap-1">
          {shortcuts.area.map((key) => (
            <Kbd key={key}>{key}</Kbd>
          ))}
        </span>
        and drag. Screenmac lives in your menu bar.
      </span>
    ),
  },
];

/** The install section: the one-liner, the manual download, and what to expect the first time. */
export function Install({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section
      id="install"
      aria-labelledby="install-title"
      className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-accent-ink">
            Version {product.version} · free while in beta
          </p>
          <Heading
            id="install-title"
            className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink"
          >
            Install in a minute.
          </Heading>
          <p className="mt-4 text-lg leading-8 text-ink-muted">
            One line in Terminal is the quickest. Prefer to click? Download the
            app and follow four short steps.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="relative overflow-hidden rounded-[28px] bg-[#15141b] p-6 text-white shadow-[0_40px_80px_-40px_rgba(30,24,90,0.65)] ring-1 ring-white/5 md:p-9">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#6d5cff]/30 blur-3xl"
            />
            <div className="relative">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-xs text-white/40">
                  Terminal — zsh
                </span>
              </div>
              <h3 className="mt-7 text-xl font-semibold tracking-[-0.01em] md:text-2xl">
                Quickest: one line in Terminal
              </h3>
              <p className="mt-2 max-w-lg leading-7 text-white/65">
                Paste it into Terminal and press Return. It downloads the latest
                release, checks its checksum, puts Screenmac in Applications and
                opens it, with no security popup.
              </p>
              <div className="mt-6">
                <CopyCommand command={product.installCommand} />
              </div>
              <ul className="mt-6 grid gap-2.5 text-sm text-white/60 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <FileCheck2
                    className="size-4 text-[#8c80ff]"
                    aria-hidden="true"
                  />
                  <span>
                    Want to check it first?{" "}
                    <a
                      href="/install.sh"
                      className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
                    >
                      Read the script
                    </a>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck
                    className="size-4 text-[#8c80ff]"
                    aria-hidden="true"
                  />
                  Only touches Screenmac&apos;s own files and permission
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col rounded-[28px] bg-paper-raised p-6 ring-1 ring-line md:p-9">
            <h3 className="text-xl font-semibold tracking-[-0.01em] text-ink md:text-2xl">
              Or download the app
            </h3>
            <p className="mt-2 leading-7 text-ink-muted">
              macOS {product.minimumMacOS} or later. One universal build for
              Apple silicon and Intel.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={product.downloadUrl ?? product.releasesUrl}
                className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_10px_24px_-10px_rgba(58,47,184,0.7)] transition-[background-color,transform] hover:bg-accent-hover active:scale-[0.98]"
              >
                <ArrowDownToLine className="size-4" aria-hidden="true" />
                Download Screenmac.zip
              </a>
              <a
                href={product.releasesUrl}
                className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line-strong bg-paper px-5 font-medium text-ink transition-colors hover:border-ink/40"
              >
                <GitHubMark className="size-4" />
                All releases
              </a>
            </div>
            <p className="mt-auto pt-5 text-xs leading-5 text-ink-faint">
              Built from source by GitHub Actions on every release.{" "}
              <a
                href={product.checksumUrl}
                className="underline underline-offset-2 hover:text-ink"
              >
                SHA-256 checksum
              </a>
              .
            </p>
          </div>
        </div>

        <ol
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="First launch, after downloading"
        >
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-[22px] bg-paper-raised p-6 ring-1 ring-line"
            >
              <span
                className="grid size-8 place-items-center rounded-full bg-ink font-mono text-sm text-paper"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h4 className="mt-5 font-semibold text-ink">{step.title}</h4>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm leading-6 text-ink-muted">
          After an update, macOS may ask for Screen Recording again because the
          build isn&apos;t notarized yet. If captures stop working, choose{" "}
          <strong className="font-medium text-ink">
            Fix Screen Recording Permission…
          </strong>{" "}
          from the menu bar icon.
        </p>
      </div>
    </section>
  );
}
