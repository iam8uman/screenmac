import { cn } from "@/lib/cn";
import { AVAILABILITY_DESCRIPTION, AVAILABILITY_LABEL, type Availability } from "@/lib/features";

const STYLES: Record<Availability, string> = {
  editor: "bg-accent-soft text-accent-ink ring-accent/20",
  building: "bg-[#e7f3ec] text-success ring-success/20",
  planned: "bg-paper-sunk text-ink-muted ring-line-strong",
};

const DOTS: Record<Availability, string> = {
  editor: "bg-accent",
  building: "bg-success",
  planned: "border border-ink-faint bg-transparent",
};

export function AvailabilityBadge({ status, className }: { status: Availability; className?: string }) {
  return (
    <span
      title={AVAILABILITY_DESCRIPTION[status]}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOTS[status])} aria-hidden="true" />
      {AVAILABILITY_LABEL[status]}
    </span>
  );
}

export function Kbd({ children, className, tone = "light" }: { children: React.ReactNode; className?: string; tone?: "light" | "dark" }) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-[1.75em] items-center justify-center rounded-md px-1.5 font-mono text-[0.8em] font-medium leading-[1.9]",
        tone === "light"
          ? "bg-paper-raised text-ink shadow-[0_0_0_1px_var(--sm-line-strong),0_1.5px_0_var(--sm-line-strong)]"
          : "bg-white/10 text-stage-ink shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_1.5px_0_rgba(255,255,255,0.12)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
