import { Kbd } from "@/components/ui/Badge";
import { shortcuts } from "@/lib/product";

function SelectArt() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#24232b]" aria-hidden="true">
      <div className="absolute inset-x-4 top-4 h-2 w-24 rounded bg-white/10" />
      <div className="absolute inset-x-4 top-9 space-y-2">
        {[80, 64, 72, 50, 68].map((w, i) => (
          <div key={i} className="h-1.5 rounded bg-white/[0.07]" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="absolute left-[18%] top-[30%] h-[46%] w-[58%] bg-accent/10 outline-[1.5px] outline-dashed outline-[#8c80ff]">
        {["-left-1 -top-1", "-right-1 -top-1", "-left-1 -bottom-1", "-right-1 -bottom-1"].map((p) => (
          <span key={p} className={`absolute size-2 rounded-[2px] border border-[#8c80ff] bg-white ${p}`} />
        ))}
        <span className="absolute -bottom-6 right-0 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">1280 × 720</span>
      </div>
      <svg className="absolute bottom-[19%] right-[19%] size-4 text-white" viewBox="0 0 16 16">
        <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    </div>
  );
}

function QuickAccessArt() {
  return (
    <div className="relative grid h-full w-full place-items-end overflow-hidden rounded-lg bg-[#e9e7e0] p-3" aria-hidden="true">
      <div className="w-[62%] rounded-xl bg-[#1c1b22] p-1.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gradient-to-br from-[#6d6bff] to-[#c3b5ff] p-2">
          <div className="h-full rounded bg-[#15141a]">
            <div className="absolute left-[30%] top-[38%] h-[24%] w-[34%] rounded-sm border-2 border-[#f0443a]" />
          </div>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-1">
          {["Annotate", "Copy", "Save"].map((label) => (
            <span key={label} className="rounded-md bg-white/10 py-1 text-center text-[9.5px] text-white/85">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PasteArt() {
  return (
    <div className="flex h-full w-full flex-col justify-end gap-2 overflow-hidden rounded-lg bg-paper-raised p-3 ring-1 ring-line" aria-hidden="true">
      <div className="max-w-[70%] rounded-2xl rounded-bl-md bg-paper-sunk px-3 py-2 text-[11px] text-ink-muted">Where does the export go wrong?</div>
      <div className="ml-auto w-[64%] rounded-2xl rounded-br-md bg-accent p-1.5">
        <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-[#2a2932] to-[#15141a] p-2">
          <div className="flex h-full items-center justify-center">
            <span className="grid size-5 place-items-center rounded-full bg-[#5b4cf5] text-[10px] font-bold text-white ring-2 ring-white/90">1</span>
          </div>
        </div>
        <p className="px-1.5 pb-0.5 pt-1.5 text-[11px] text-white">Step 1 is the clamp.</p>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Press a shortcut and drag",
    body: "The screen freezes so nothing moves while you drag. A loupe and live size readout keep it pixel-exact. Press Space to grab a window instead.",
    keys: shortcuts.area,
    art: <SelectArt />,
  },
  {
    title: "Mark it up from the preview",
    body: "A small preview appears in the corner. Open it to add arrows, labels, and steps, or blur what shouldn't be seen.",
    keys: ["A", "T", "N"] as const,
    art: <QuickAccessArt />,
  },
  {
    title: "Paste it where it's going",
    body: "Copy the flattened image and paste it into a ticket, a chat, or a doc. Or drag the preview straight in.",
    keys: ["⌘", "C"] as const,
    art: <PasteArt />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 id="how-title" className="mx-auto max-w-2xl text-balance text-center text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink">
          Three steps. Usually under ten seconds.
        </h2>
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col">
              <div className="aspect-[4/3] w-full">{step.art}</div>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-ink text-sm font-semibold text-paper" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="flex gap-1 text-sm" aria-label={`Shortcut ${step.keys.join(" ")}`}>
                  {step.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </div>
              </div>
              <h3 className="mt-4 text-lg font-semibold tracking-[-0.015em] text-ink">{step.title}</h3>
              <p className="mt-2 leading-7 text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
