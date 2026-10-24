"use client";

import { BringToFront, Check, CopyPlus, SendToBack, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Annotation, Backdrop, BackdropId, Rect, TextAnnotation, ToolId } from "../model";
import { PALETTE, STROKE_WIDTHS } from "../model";
import { BACKDROPS } from "../render";

export type Strength = 1 | 2 | 3;

interface InspectorProps {
  tool: ToolId;
  selected: Annotation | null;
  color: string;
  strokeWidth: number;
  textStyle: TextAnnotation["style"];
  strength: Strength;
  backdrop: Backdrop;
  pendingCrop: Rect | null;
  imageSize: { width: number; height: number } | null;
  hasCrop: boolean;
  onColor: (color: string) => void;
  onStrokeWidth: (width: number) => void;
  onTextStyle: (style: TextAnnotation["style"]) => void;
  onStrength: (strength: Strength) => void;
  onBackdrop: (backdrop: Backdrop) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onClearCrop: () => void;
  aspect: AspectLabel;
  onAspect: (label: AspectLabel) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReorder: (to: "front" | "back") => void;
}

const COLORED = new Set(["arrow", "line", "rectangle", "ellipse", "pencil", "highlighter", "text", "counter"]);
const STROKED = new Set(["arrow", "line", "rectangle", "ellipse", "pencil", "highlighter", "text", "counter"]);
const EFFECTS = new Set(["blur", "pixelate"]);

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-2.5 border-b border-stage-line pb-3.5 max-lg:last:border-b-0 max-lg:last:pb-0 lg:px-4 lg:py-4",
        className,
      )}
    >
      <h3 className="text-xs font-medium text-stage-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-lg bg-black/25 p-0.5 ring-1 ring-stage-line">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-7 min-w-14 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-xs transition-colors",
              active ? "bg-stage-raised text-stage-ink shadow-sm ring-1 ring-white/10" : "text-stage-ink-muted hover:text-stage-ink",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function strokeDot(width: number) {
  const size = width === 4 ? 4 : width === 7 ? 7 : 10;
  return <span className="rounded-full bg-current" style={{ width: size, height: size }} aria-hidden="true" />;
}

const BACKDROP_SWATCH: Record<BackdropId, string> = Object.fromEntries(
  BACKDROPS.map((b) => [b.id, b.id === "none" ? "transparent" : `linear-gradient(135deg, ${b.stops[0]}, ${b.stops[1]})`]),
) as Record<BackdropId, string>;

export const ASPECTS = [
  { label: "Free", value: null },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
] as const;

export type AspectLabel = (typeof ASPECTS)[number]["label"];

export function Inspector(props: InspectorProps) {
  const { tool, selected } = props;
  const subject: string = selected
    ? selected.kind === "rectangle" && selected.filled
      ? "rectangle"
      : selected.kind
    : tool === "filled-rectangle"
      ? "rectangle"
      : tool;

  const showColor = COLORED.has(subject);
  const showStroke = STROKED.has(subject);
  const showTextStyle = subject === "text";
  const showStrength = EFFECTS.has(subject);
  const isRedact = subject === "redact";
  const cropMode = tool === "crop";

  return (
    <aside
      aria-label="Inspector"
      className="flex shrink-0 flex-col gap-3.5 border-t border-stage-line px-4 py-3 lg:w-[248px] lg:gap-0 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-0"
    >
      {cropMode ? (
        <Section title="Crop">
          <p className="font-mono text-xs text-stage-ink">
            {props.pendingCrop ? `${Math.round(props.pendingCrop.width)} × ${Math.round(props.pendingCrop.height)}` : "—"} px
          </p>
          <Segmented
            label="Aspect ratio"
            value={props.aspect}
            options={ASPECTS.map((a) => ({ value: a.label, label: a.label }))}
            onChange={props.onAspect}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={props.onApplyCrop}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-white hover:bg-accent-hover"
            >
              <Check className="size-3.5" aria-hidden="true" /> Apply crop
            </button>
            <button
              type="button"
              onClick={props.onCancelCrop}
              className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs text-stage-ink-muted ring-1 ring-stage-line hover:text-stage-ink"
            >
              Cancel
            </button>
          </div>
          {props.hasCrop ? (
            <button type="button" onClick={props.onClearCrop} className="self-start text-xs text-[#a99fff] hover:text-white">
              Remove crop
            </button>
          ) : null}
          <p className="text-xs leading-5 text-stage-ink-muted">Drag on the image. Return applies, Esc cancels.</p>
        </Section>
      ) : null}

      {!cropMode && showColor ? (
        <Section title="Color">
          <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-1.5">
            {PALETTE.map((swatch) => {
              const active = swatch.value.toLowerCase() === props.color.toLowerCase();
              return (
                <button
                  key={swatch.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={swatch.name}
                  onClick={() => props.onColor(swatch.value)}
                  className={cn(
                    "relative size-6 rounded-full ring-offset-2 ring-offset-stage transition-transform duration-150 hover:scale-110",
                    active ? "ring-2 ring-white" : "ring-1 ring-white/15",
                  )}
                  style={{ background: swatch.value }}
                />
              );
            })}
          </div>
        </Section>
      ) : null}

      {!cropMode && showStroke ? (
        <Section title={showTextStyle ? "Text size" : subject === "counter" ? "Marker size" : "Stroke"}>
          <Segmented
            label="Size"
            value={props.strokeWidth}
            options={STROKE_WIDTHS.map((w) => ({ value: w.value, label: w.name, icon: strokeDot(w.value) }))}
            onChange={props.onStrokeWidth}
          />
        </Section>
      ) : null}

      {!cropMode && showTextStyle ? (
        <Section title="Text style">
          <Segmented
            label="Text style"
            value={props.textStyle}
            options={[
              { value: "label", label: "Label" },
              { value: "plain", label: "Plain" },
            ]}
            onChange={props.onTextStyle}
          />
        </Section>
      ) : null}

      {!cropMode && showStrength ? (
        <Section title={subject === "blur" ? "Blur strength" : "Block size"}>
          <Segmented
            label="Strength"
            value={props.strength}
            options={[
              { value: 1, label: "Light" },
              { value: 2, label: "Medium" },
              { value: 3, label: "Strong" },
            ]}
            onChange={(v) => props.onStrength(v as Strength)}
          />
          <p className="max-w-56 text-xs leading-5 text-stage-ink-muted">
            Applied to the exported pixels. For passwords and card numbers, use Redact.
          </p>
        </Section>
      ) : null}

      {!cropMode && isRedact ? (
        <Section title="Redact">
          <p className="max-w-56 text-xs leading-5 text-stage-ink-muted">
            Replaces the pixels with solid black in the export. Nothing underneath survives.
          </p>
        </Section>
      ) : null}

      {!cropMode && selected ? (
        <Section title="Selection">
          <div className="flex gap-1">
            <IconAction label="Duplicate" shortcut="⌘D" onClick={props.onDuplicate}>
              <CopyPlus className="size-4" />
            </IconAction>
            <IconAction label="Bring to front" onClick={() => props.onReorder("front")}>
              <BringToFront className="size-4" />
            </IconAction>
            <IconAction label="Send to back" onClick={() => props.onReorder("back")}>
              <SendToBack className="size-4" />
            </IconAction>
            <IconAction label="Delete" shortcut="⌫" onClick={props.onDelete} danger>
              <Trash2 className="size-4" />
            </IconAction>
          </div>
        </Section>
      ) : null}

      {!cropMode ? (
        <Section title="Background" className="order-first lg:order-none lg:border-b-0">
          <div role="radiogroup" aria-label="Background" className="flex flex-wrap gap-1.5">
            {BACKDROPS.map((preset) => {
              const active = props.backdrop.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={preset.id === "none" ? "No background" : `${preset.label} background`}
                  onClick={() => props.onBackdrop({ ...props.backdrop, id: preset.id })}
                  className={cn(
                    "relative size-8 overflow-hidden rounded-lg transition-transform duration-150 hover:scale-105",
                    active ? "ring-2 ring-white ring-offset-2 ring-offset-stage" : "ring-1 ring-white/15",
                  )}
                  style={{ background: BACKDROP_SWATCH[preset.id] }}
                >
                  {preset.id === "none" ? (
                    <span className="absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white/40" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
          {props.backdrop.id !== "none" ? (
            <div className="flex w-full min-w-0 flex-col gap-2">
              <label className="flex items-center justify-between text-xs text-stage-ink-muted">
                Padding
                <span className="font-mono text-stage-ink">{props.backdrop.padding}%</span>
              </label>
              <input
                type="range"
                aria-label="Background padding"
                min={2}
                max={16}
                step={1}
                value={props.backdrop.padding}
                onChange={(event) => props.onBackdrop({ ...props.backdrop, padding: Number(event.target.value) })}
                className="h-1.5 w-full cursor-pointer accent-[#8C80FF]"
              />
              <label className="flex cursor-pointer items-center justify-between gap-3 text-xs text-stage-ink-muted">
                Shadow
                <input
                  type="checkbox"
                  checked={props.backdrop.shadow}
                  onChange={(event) => props.onBackdrop({ ...props.backdrop, shadow: event.target.checked })}
                  className="size-4 cursor-pointer accent-[#8C80FF]"
                />
              </label>
            </div>
          ) : null}
        </Section>
      ) : null}
    </aside>
  );
}

function IconAction({
  label,
  shortcut,
  onClick,
  danger,
  children,
}: {
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-stage-ink-muted ring-1 ring-stage-line transition-colors hover:text-stage-ink",
        danger && "hover:bg-[#F0443A]/15 hover:text-[#ff8a80]",
      )}
    >
      {children}
    </button>
  );
}
