"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** A Terminal command with a copy button that confirms, and falls back to selecting the text. */
export function CopyCommand({ command }: { command: string }) {
  const [state, setState] = useState<"idle" | "copied" | "select">("idle");
  const codeRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const selectText = () => {
    const node = codeRef.current;
    if (!node) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setState("copied");
    } catch {
      selectText();
      setState("select");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  };

  return (
    <div className="group flex flex-col gap-2 rounded-2xl bg-black/40 p-2 pl-4 ring-1 ring-white/10 focus-within:ring-white/25 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden="true"
          className="select-none py-2 font-mono text-sm leading-6 text-night-accent"
        >
          $
        </span>
        <code
          ref={codeRef}
          data-testid="install-command"
          translate="no"
          className="min-w-0 flex-1 py-2 font-mono text-[0.8rem] leading-6 text-white/90 [overflow-wrap:anywhere] sm:text-[0.84rem]"
        >
          {command}
        </code>
      </div>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 sm:h-9 rounded-xl bg-white px-3.5 text-sm font-medium text-ink transition-[background-color,transform] hover:bg-white/90 active:scale-[0.97]"
        aria-label={state === "copied" ? "Copied" : "Copy install command"}
      >
        {state === "copied" ? (
          <Check className="size-4 text-success" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        <span>
          {state === "copied"
            ? "Copied"
            : state === "select"
              ? "Press ⌘C"
              : "Copy"}
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied"
          ? "Install command copied to the clipboard."
          : state === "select"
            ? "Command selected. Press Command C to copy."
            : ""}
      </span>
    </div>
  );
}
