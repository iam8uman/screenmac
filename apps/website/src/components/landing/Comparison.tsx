import { Check, Minus } from "lucide-react";

type Cell = { yes: boolean; note: string };

const ROWS: { capability: string; system: Cell; screenmac: Cell }[] = [
  {
    capability: "Area, window, and full-screen capture",
    system: { yes: true, note: "⇧⌘3, ⇧⌘4, ⇧⌘5" },
    screenmac: { yes: true, note: "Frozen screen, loupe, pixel readout" },
  },
  {
    capability: "Screen recording with microphone",
    system: { yes: true, note: "From the ⇧⌘5 toolbar" },
    screenmac: { yes: true, note: "Pause, resume, and audio status" },
  },
  {
    capability: "Preview after capture",
    system: { yes: true, note: "Floating thumbnail" },
    screenmac: { yes: true, note: "Copy, save, drag, or annotate from it" },
  },
  {
    capability: "Arrows, shapes, and text",
    system: { yes: true, note: "Markup, after opening the file" },
    screenmac: { yes: true, note: "Fourteen tools, styled by default" },
  },
  {
    capability: "Numbered steps",
    system: { yes: false, note: "Not available" },
    screenmac: { yes: true, note: "Auto-numbering counters" },
  },
  {
    capability: "Blur and pixelate",
    system: { yes: false, note: "Not available" },
    screenmac: { yes: true, note: "Flattened into the export" },
  },
  {
    capability: "Redaction",
    system: { yes: false, note: "Draw a filled shape by hand" },
    screenmac: { yes: true, note: "Pixels replaced in the export" },
  },
  {
    capability: "Backgrounds and padding",
    system: { yes: false, note: "Not available" },
    screenmac: { yes: true, note: "Presets with shadow and corners" },
  },
  {
    capability: "Searchable history",
    system: { yes: false, note: "Files land on the Desktop" },
    screenmac: { yes: true, note: "Local, with missing-file handling" },
  },
];

function CellView({ cell }: { cell: Cell }) {
  return (
    <div className="flex items-start gap-2.5">
      {cell.yes ? (
        <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-label="Yes" />
      ) : (
        <Minus className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-label="No" />
      )}
      <span className={cell.yes ? "text-ink" : "text-ink-muted"}>{cell.note}</span>
    </div>
  );
}

export function Comparison() {
  return (
    <section aria-labelledby="compare-title" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
          <h2 id="compare-title" className="text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink">
            What the built-in tool leaves to you.
          </h2>
          <p className="max-w-xl text-lg leading-8 text-ink-muted md:pt-2">
            macOS screenshots are good at capturing. Screenmac starts where they stop: explaining, hiding, and finding
            things again. The Screenmac column describes the Mac app in development.
          </p>
        </div>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left text-[0.9375rem]">
            <caption className="sr-only">Built-in macOS screenshots compared with Screenmac</caption>
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="w-[38%] pb-3 pr-4 text-sm font-medium text-ink-muted">
                  Capability
                </th>
                <th scope="col" className="w-[31%] pb-3 pr-4 text-sm font-medium text-ink-muted">
                  macOS Screenshot
                </th>
                <th scope="col" className="w-[31%] pb-3 text-sm font-semibold text-ink">
                  Screenmac
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.capability} className="border-b border-line">
                  <th scope="row" className="py-4 pr-4 font-medium text-ink">
                    {row.capability}
                  </th>
                  <td className="py-4 pr-4">
                    <CellView cell={row.system} />
                  </td>
                  <td className="py-4">
                    <CellView cell={row.screenmac} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
