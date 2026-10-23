import {
  Circle,
  Crop,
  Droplets,
  Grid3x3,
  Highlighter,
  MousePointer2,
  MoveUpRight,
  Pencil,
  Slash,
  Square,
  Type,
  type LucideProps,
} from "lucide-react";
import type { ToolId } from "../model";

function CounterIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" width={props.size ?? 24} height={props.size ?? 24} className={props.className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} />
      <path d="M10.5 9.2 12.6 8v8" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilledSquare(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" width={props.size ?? 24} height={props.size ?? 24} className={props.className} aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" />
    </svg>
  );
}

function RedactIcon(props: LucideProps) {
  return (
    <svg viewBox="0 0 24 24" width={props.size ?? 24} height={props.size ?? 24} className={props.className} aria-hidden="true">
      <rect x="3" y="8" width="18" height="8" rx="2" fill="currentColor" />
      <path d="M5 5h6M13 19h6" stroke="currentColor" strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<ToolId, (props: LucideProps) => React.ReactNode> = {
  select: MousePointer2,
  crop: Crop,
  arrow: MoveUpRight,
  line: Slash,
  rectangle: Square,
  "filled-rectangle": FilledSquare,
  ellipse: Circle,
  text: Type,
  counter: CounterIcon,
  highlighter: Highlighter,
  pencil: Pencil,
  blur: Droplets,
  pixelate: Grid3x3,
  redact: RedactIcon,
};

export function ToolIcon({ tool, ...props }: { tool: ToolId } & LucideProps) {
  const Icon = ICONS[tool];
  return <Icon size={18} strokeWidth={1.8} {...props} />;
}
