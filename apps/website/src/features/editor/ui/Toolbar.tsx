"use client";

import { Fragment } from "react";
import { cn } from "@/lib/cn";
import type { ToolId } from "../model";
import { toolInfo } from "../tools";
import { ToolIcon } from "./ToolIcon";

const GROUPS: ToolId[][] = [
  ["select", "crop"],
  ["arrow", "line", "rectangle", "filled-rectangle", "ellipse"],
  ["text", "counter", "highlighter", "pencil"],
  ["blur", "pixelate", "redact"],
];

export function Tooltip({ label, shortcut, side = "bottom" }: { label: string; shortcut?: string; side?: "top" | "bottom" }) {
  return (
    <span
      role="presentation"
      className={cn(
        "pointer-events-none absolute left-1/2 z-30 hidden",
        side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
      )+"  -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md bg-[#0d0c12] px-2 py-1 text-xs text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity delay-300 duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:hover)]:flex"}
    >
      {label}
      {shortcut ? <kbd className="rounded bg-white/12 px-1 text-[10.5px] uppercase text-white/75">{shortcut}</kbd> : null}
    </span>
  );
}

export function Toolbar({ tool, onToolChange }: { tool: ToolId; onToolChange: (tool: ToolId) => void }) {
  return (
    <div role="toolbar" aria-label="Annotation tools" className="flex items-center gap-1">
      {GROUPS.map((group, index) => (
        <Fragment key={group[0]}>
          {index > 0 ? <span className="mx-1 h-5 w-px shrink-0 bg-stage-line" aria-hidden="true" /> : null}
          {group.map((id) => {
            const info = toolInfo(id);
            const active = tool === id;
            return (
              <button
                key={id}
                type="button"
                aria-label={info.label}
                aria-pressed={active}
                aria-keyshortcuts={info.key.toUpperCase()}
                data-tool={id}
                onClick={() => onToolChange(id)}
                className={cn(
                  "group relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,box-shadow] duration-150",
                  active
                    ? "bg-accent text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_2px_8px_-2px_rgba(91,76,245,0.7)]"
                    : "text-stage-ink-muted hover:bg-white/8 hover:text-stage-ink",
                )}
              >
                <ToolIcon tool={id} />
                <Tooltip label={info.label} shortcut={info.key} />
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
