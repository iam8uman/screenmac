import { cn } from "@/lib/cn";

/** App mark: a capture selection with one corner handle lit. */
export function LogoMark({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill={dark ? "#ffffff" : "var(--sm-ink)"} />
      <path
        d="M9 13V10a1 1 0 0 1 1-1h3M19 9h3a1 1 0 0 1 1 1v3M23 19v3a1 1 0 0 1-1 1h-3M13 23h-3a1 1 0 0 1-1-1v-3"
        fill="none"
        stroke={dark ? "var(--sm-ink)" : "var(--sm-paper)"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="13" y="13" width="6" height="6" rx="1.5" fill="var(--sm-accent)" />
    </svg>
  );
}

export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 transition-colors", tone === "dark" ? "text-white" : "text-ink", className)}>
      <LogoMark tone={tone} />
      <span className="text-[1.05rem] font-semibold tracking-[-0.02em]">Screenmac</span>
    </span>
  );
}
