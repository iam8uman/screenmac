import { EyeOff, FolderLock, History, Keyboard, Layers, PenTool } from "lucide-react";
import { Kbd } from "@/components/ui/Badge";
import { shortcuts } from "@/lib/product";

function ScreenshotArt() {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#24232b] ring-1 ring-white/10" aria-hidden="true">
      <div className="absolute inset-x-5 top-5 h-2 w-28 rounded bg-white/10" />
      <div className="absolute inset-x-5 top-10 space-y-2">
        {[82, 64, 74, 52, 70, 60].map((w, i) => (
          <div key={i} className="h-1.5 rounded bg-white/[0.07]" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute left-[22%] top-[28%] h-[44%] w-[50%] overflow-hidden bg-[#24232b] outline outline-1 outline-white">
        <div className="absolute inset-x-3 top-3 space-y-2">
          {[70, 88, 56].map((w, i) => (
            <div key={i} className="h-1.5 rounded bg-white/[0.09]" style={{ width: `${w}%` }} />
          ))}
        </div>
        {["-left-[3px] -top-[3px]", "-right-[3px] -top-[3px]", "-left-[3px] -bottom-[3px]", "-right-[3px] -bottom-[3px]"].map((p) => (
          <span key={p} className={`absolute size-1.5 rounded-[1px] bg-white ${p}`} />
        ))}
      </div>
      <span className="absolute left-[22%] top-[74%] mt-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
        1440 × 900
      </span>
      <div className="absolute bottom-3 right-3 flex gap-1">
        {["Area", "Window", "Full screen"].map((label, i) => (
          <span
            key={label}
            className={`rounded-md px-2 py-1 text-[10px] font-medium ${i === 0 ? "bg-accent text-white" : "bg-white/10 text-white/70"}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecordingArt() {
  const bars = [30, 55, 80, 45, 95, 60, 35, 70, 50, 85, 40, 65, 30, 75, 55];
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#24232b] ring-1 ring-white/10" aria-hidden="true">
      <div className="absolute inset-[12%] rounded-lg bg-gradient-to-br from-[#5b4cf5]/50 to-[#a78bfa]/30 ring-1 ring-white/15">
        <div className="absolute inset-x-4 top-4 space-y-2">
          {[60, 80, 45].map((w, i) => (
            <div key={i} className="h-1.5 rounded bg-white/20" style={{ width: `${w}%` }} />
          ))}
        </div>
        <svg className="absolute left-[58%] top-[52%] size-4 text-white drop-shadow" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 1l11 6.5-5 1.2L5.5 14z" />
        </svg>
      </div>
      <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/75 py-1 pl-2.5 pr-1 text-white ring-1 ring-white/10">
        <span className="size-2 animate-pulse rounded-full bg-[#ff453a] motion-reduce:animate-none" />
        <span className="font-mono text-[11px] tabular-nums">00:42</span>
        <span className="grid size-5 place-items-center rounded-full bg-white/10">
          <span className="flex gap-[2px]">
            <span className="h-2 w-[2px] rounded-sm bg-white" />
            <span className="h-2 w-[2px] rounded-sm bg-white" />
          </span>
        </span>
        <span className="grid size-5 place-items-center rounded-full bg-white/10">
          <span className="size-2 rounded-[2px] bg-white" />
        </span>
      </div>
      <div className="absolute inset-x-3 bottom-3 flex items-end gap-3 rounded-lg bg-black/60 px-3 py-2 ring-1 ring-white/10">
        <span className="shrink-0 font-mono text-[10px] text-white/70">MIC</span>
        <div className="flex h-5 flex-1 items-end gap-[3px]">
          {bars.map((h, i) => (
            <span key={i} className="flex-1 rounded-sm bg-[#8c80ff]" style={{ height: `${h}%` }} />
          ))}
        </div>
        <span className="shrink-0 font-mono text-[10px] text-white/70">60 FPS · MP4</span>
      </div>
    </div>
  );
}

const PILLARS = [
  {
    id: "screenshots",
    eyebrow: "Screenshots",
    title: "Drag, let go, it's captured.",
    body: "Pick an area and the shot is taken the moment you release. Or click a window, or grab the whole display.",
    points: [
      "Area, window or full screen at full Retina resolution",
      "The screen freezes while you choose, with a loupe and live pixel size",
      "Self-timer of 3, 5 or 10 seconds for menus and tooltips",
      "PNG or JPEG, with or without the pointer and desktop icons",
    ],
    keys: shortcuts.area,
    keysLabel: "Capture an area",
    art: <ScreenshotArt />,
  },
  {
    id: "recording",
    eyebrow: "Screen recording",
    title: "Record the screen, with your voice.",
    body: "Record a display, an area or a single window to MP4. Pause when you need a moment and pick up where you left off.",
    points: [
      "30 or 60 fps, saved as an MP4 that plays anywhere",
      "Microphone narration, from whichever mic you choose",
      "System audio on its own track",
      "Pause, resume and stop from a small recording bar",
    ],
    keys: shortcuts.record,
    keysLabel: "Start or stop recording",
    art: <RecordingArt />,
  },
] as const;

const TILES = [
  {
    icon: PenTool,
    title: "Mark it up",
    body: "Fourteen tools: arrows, shapes, text, numbered steps, highlighter, crop and backgrounds.",
  },
  {
    icon: EyeOff,
    title: "Redaction that holds",
    body: "Redact, blur and pixelate rewrite the pixels in the exported file. Nothing hides underneath.",
  },
  {
    icon: Layers,
    title: "Quick Access stack",
    body: "Each capture lands in a corner stack. Hover to fan them all out, then copy, save or drag one into a chat.",
  },
  {
    icon: History,
    title: "Capture history",
    body: "Every screenshot and recording in one list. Search it, reopen a shot in the editor, or show it in Finder.",
  },
  {
    icon: Keyboard,
    title: "Shortcuts you choose",
    body: "Global shortcuts for every action, checked against the ones macOS already uses.",
  },
  {
    icon: FolderLock,
    title: "Stays on your Mac",
    body: "No account and no uploads. Screenshots and recordings are plain files in a folder on your Mac.",
  },
];

/** Everything the Mac app does, with screenshots and recording given equal weight. */
export function Capabilities() {
  return (
    <section id="capabilities" aria-labelledby="capabilities-title" className="scroll-mt-20 border-t border-line px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="capabilities-title"
            className="text-balance text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink"
          >
            Screenshots and screen recordings. One app.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-ink-muted">
            The same shortcuts, preview and history for both. Grab a still when a picture says it, and record when it
            takes a minute to show.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              aria-labelledby={`${pillar.id}-title`}
              className="flex flex-col rounded-[22px] bg-stage p-5 text-stage-ink ring-1 ring-stage-line sm:p-7"
            >
              {pillar.art}
              <p className="mt-7 text-sm font-medium text-[#a99fff]">{pillar.eyebrow}</p>
              <h3 id={`${pillar.id}-title`} className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                {pillar.title}
              </h3>
              <p className="mt-3 leading-7 text-stage-ink-muted">{pillar.body}</p>
              <ul className="mt-5 space-y-2.5 text-[0.9375rem] leading-6 text-stage-ink-muted">
                {pillar.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-[#8c80ff]" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-7 text-sm text-stage-ink-muted">
                <span className="flex gap-1" aria-label={`${pillar.keysLabel}: ${pillar.keys.join(" ")}`}>
                  {pillar.keys.map((key) => (
                    <Kbd key={key} tone="dark">
                      {key}
                    </Kbd>
                  ))}
                </span>
                <span aria-hidden="true">{pillar.keysLabel}</span>
              </div>
            </article>
          ))}
        </div>

        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-[18px] bg-paper-raised p-6 ring-1 ring-inset ring-line">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-ink" aria-hidden="true">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold tracking-[-0.01em] text-ink">{title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-6 text-ink-muted">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
