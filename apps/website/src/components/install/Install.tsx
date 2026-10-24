import { ArrowDownToLine, Check, FileCheck2, ShieldCheck } from "lucide-react";
import { Kbd } from "@/components/ui/Badge";
import { product, shortcuts } from "@/lib/product";
import { CopyCommand } from "./CopyCommand";
import { GitHubMark } from "./GitHubMark";
import { SendToMac } from "./SendToMac";

const strong = "font-medium text-ink";

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Unzip and move it to Applications",
    body: (
      <>
        Open <strong className={strong}>Screenmac.zip</strong> from Downloads
        and drag <strong className={strong}>Screenmac</strong> into
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
        <strong className={strong}>
          System Settings → Privacy &amp; Security → Open Anyway
        </strong>
        . On macOS 14, right-click it and choose{" "}
        <strong className={strong}>Open</strong>.
      </>
    ),
  },
  {
    title: "Allow Screen Recording",
    body: (
      <>
        Turn Screenmac on in{" "}
        <strong className={strong}>
          Privacy &amp; Security → Screen &amp; System Audio Recording
        </strong>
        , then choose <strong className={strong}>Quit &amp; Reopen</strong>.
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

/**
 * Install section, directly under the live editor:
 * the one-liner, the manual download, and what to expect the first time.
 */
export function Install({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section
      id="install"
      aria-labelledby="install-title"
      className="scroll-mt-20 px-4 pb-24 pt-16 text-ink md:px-6 md:pb-32 md:pt-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Heading
            id="install-title"
            className="text-balance text-[clamp(2.3rem,5.4vw,3.9rem)] font-medium leading-[1.02] tracking-[-0.04em] text-ink"
          >
            Install in a minute.
          </Heading>
          <p className="mt-4 text-pretty text-lg leading-8 text-ink-muted">
            One line in Terminal is the quickest. Prefer to click? Download the
            app and follow four short steps.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:mt-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <SendToMac />
          <div className="relative overflow-hidden rounded-[24px] bg-paper-raised p-6 ring-1 ring-inset ring-line md:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-accent-soft blur-3xl"
            />
            <div className="relative">
              <h3 className="text-xl font-medium tracking-[-0.01em] md:text-2xl">
                Quickest: one line in Terminal
              </h3>
              <p className="mt-2 max-w-lg leading-7 text-ink-muted">
                Paste it into Terminal and press Return. It downloads the latest
                release, checks its checksum, puts Screenmac in Applications and
                opens it, with no security popup.
              </p>
              <div className="mt-6">
                <CopyCommand command={product.installCommand} />
              </div>
              <ul className="mt-6 grid gap-2.5 text-sm text-ink-muted sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <FileCheck2
                    className="size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span>
                    Want to check it first?{" "}
                    <a
                      href="/install.sh"
                      className="text-ink underline decoration-ink/30 underline-offset-2 hover:decoration-ink"
                    >
                      Read the script
                    </a>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck
                    className="size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  Only touches Screenmac&apos;s own files and permission
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col rounded-[24px] bg-paper-raised p-6 ring-1 ring-inset ring-line md:p-8">
            <h3 className="text-xl font-medium tracking-[-0.01em] md:text-2xl">
              Or download the app
            </h3>
            <p className="mt-2 leading-7 text-ink-muted">
              Version {product.version} for macOS {product.minimumMacOS} or
              later. One build runs natively on Apple silicon and Intel.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={product.downloadUrl ?? product.releasesUrl}
                className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ink px-6 font-medium text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink/85 active:scale-[0.97]"
              >
                <ArrowDownToLine className="size-4" aria-hidden="true" />
                Download Screenmac.zip
              </a>
              <a
                href={product.releasesUrl}
                className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 font-medium text-ink ring-1 ring-inset ring-line-strong transition-[background-color,color,transform] duration-150 hover:bg-paper-sunk active:scale-[0.97]"
              >
                <GitHubMark className="size-4" />
                All releases
              </a>
            </div>
            <ul
              className="mt-6 space-y-2 text-sm text-ink-muted"
              aria-label="What you can count on"
            >
              {[
                "Free, with no account to create",
                "Captures stay on your Mac; nothing is uploaded",
                "Every line of code is on GitHub",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  {line}
                </li>
              ))}
            </ul>
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
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="First launch, after downloading"
        >
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-[20px] bg-paper-raised p-6 ring-1 ring-inset ring-line"
            >
              <span
                className="grid size-8 place-items-center rounded-full bg-ink font-mono text-sm text-paper"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h4 className="mt-5 font-medium text-ink">{step.title}</h4>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-ink-muted">
          After an update, macOS may ask for Screen Recording again because
          builds aren&apos;t notarized yet. If captures stop working, choose{" "}
          <strong className={strong}>Fix Screen Recording Permission…</strong>{" "}
          from the menu bar icon.
        </p>
      </div>
    </section>
  );
}
