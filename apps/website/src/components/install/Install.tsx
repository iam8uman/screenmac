import { ArrowDownToLine, FileCheck2, ShieldCheck } from "lucide-react";
import { Kbd } from "@/components/ui/Badge";
import { product, shortcuts } from "@/lib/product";
import { CopyCommand } from "./CopyCommand";
import { GitHubMark } from "./GitHubMark";

const strong = "font-medium text-white";

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Unzip and move it to Applications",
    body: (
      <>
        Open <strong className={strong}>Screenmac.zip</strong> from Downloads and drag{" "}
        <strong className={strong}>Screenmac</strong> into Applications.
      </>
    ),
  },
  {
    title: "Open it the first time",
    body: (
      <>
        It isn&apos;t notarized yet, so macOS asks first. On macOS 15, open it once, then choose{" "}
        <strong className={strong}>System Settings → Privacy &amp; Security → Open Anyway</strong>. On macOS 14, right-click
        it and choose <strong className={strong}>Open</strong>.
      </>
    ),
  },
  {
    title: "Allow Screen Recording",
    body: (
      <>
        Turn Screenmac on in{" "}
        <strong className={strong}>Privacy &amp; Security → Screen &amp; System Audio Recording</strong>, then choose{" "}
        <strong className={strong}>Quit &amp; Reopen</strong>.
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
            <Kbd key={key} tone="dark">
              {key}
            </Kbd>
          ))}
        </span>
        and drag. Screenmac lives in your menu bar.
      </span>
    ),
  },
];

/**
 * Install section on the night stage, directly under the live editor:
 * the one-liner, the manual download, and what to expect the first time.
 */
export function Install({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section id="install" aria-labelledby="install-title" className="scroll-mt-20 px-4 pb-24 pt-16 text-white md:px-6 md:pb-32 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-[#a99fff]">Version {product.version} · free while in beta</p>
          <Heading
            id="install-title"
            className="mt-3 text-balance text-[clamp(2.3rem,5.4vw,3.9rem)] font-medium leading-[1.02] tracking-[-0.04em] text-white"
          >
            Install in a minute.
          </Heading>
          <p className="mt-4 text-pretty text-lg leading-8 text-white/60">
            One line in Terminal is the quickest. Prefer to click? Download the app and follow four short steps.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:mt-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="relative overflow-hidden rounded-[24px] bg-white/[0.04] p-6 ring-1 ring-inset ring-white/10 md:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[#6d5cff]/25 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 font-mono text-xs text-white/40">Terminal — zsh</span>
              </div>
              <h3 className="mt-7 text-xl font-medium tracking-[-0.01em] md:text-2xl">Quickest: one line in Terminal</h3>
              <p className="mt-2 max-w-lg leading-7 text-white/60">
                Paste it into Terminal and press Return. It downloads the latest release, checks its checksum, puts Screenmac in
                Applications and opens it, with no security popup.
              </p>
              <div className="mt-6">
                <CopyCommand command={product.installCommand} />
              </div>
              <ul className="mt-6 grid gap-2.5 text-sm text-white/55 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <FileCheck2 className="size-4 shrink-0 text-[#a99fff]" aria-hidden="true" />
                  <span>
                    Want to check it first?{" "}
                    <a href="/install.sh" className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white">
                      Read the script
                    </a>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-[#a99fff]" aria-hidden="true" />
                  Only touches Screenmac&apos;s own files and permission
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col rounded-[24px] bg-white/[0.04] p-6 ring-1 ring-inset ring-white/10 md:p-8">
            <h3 className="text-xl font-medium tracking-[-0.01em] md:text-2xl">Or download the app</h3>
            <p className="mt-2 leading-7 text-white/60">
              macOS {product.minimumMacOS} or later. One universal build for Apple silicon and Intel.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={product.downloadUrl ?? product.releasesUrl}
                className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-6 font-medium text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-white/90 active:scale-[0.97]"
              >
                <ArrowDownToLine className="size-4" aria-hidden="true" />
                Download Screenmac.zip
              </a>
              <a
                href={product.releasesUrl}
                className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 font-medium text-white/85 ring-1 ring-inset ring-white/15 transition-[background-color,color] duration-150 hover:bg-white/[0.06] hover:text-white active:scale-[0.97]"
              >
                <GitHubMark className="size-4" />
                All releases
              </a>
            </div>
            <p className="mt-auto pt-5 text-xs leading-5 text-white/45">
              Built from source by GitHub Actions on every release.{" "}
              <a href={product.checksumUrl} className="underline underline-offset-2 hover:text-white">
                SHA-256 checksum
              </a>
              .
            </p>
          </div>
        </div>

        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="First launch, after downloading">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-[20px] bg-white/[0.03] p-6 ring-1 ring-inset ring-white/[0.08]">
              <span className="grid size-8 place-items-center rounded-full bg-white font-mono text-sm text-ink" aria-hidden="true">
                {index + 1}
              </span>
              <h4 className="mt-5 font-medium text-white">{step.title}</h4>
              <p className="mt-2 text-sm leading-6 text-white/60">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-white/50">
          After an update, macOS may ask for Screen Recording again because builds aren&apos;t notarized yet. If captures stop
          working, choose <strong className={strong}>Fix Screen Recording Permission…</strong> from the menu bar icon.
        </p>
      </div>
    </section>
  );
}
