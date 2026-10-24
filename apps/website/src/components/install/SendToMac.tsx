"use client";

import { Check, Send } from "lucide-react";
import { useState } from "react";
import { product } from "@/lib/product";

/**
 * Phone and tablet visitors can't install a Mac app where they are. Hand them the link
 * with the system share sheet (AirDrop, Messages, Mail, Notes), or copy it.
 */
export function SendToMac() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const url = `${product.siteUrl}/#install`;

  const send = async () => {
    const share = {
      title: "Screenmac for Mac",
      text: "Install Screenmac on my Mac",
      url,
    };
    try {
      if (typeof navigator.share === "function") {
        await navigator.share(share);
        return;
      }
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch (error) {
      // The person closed the share sheet: nothing to report.
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setState("copied");
      } catch {
        setState("failed");
      }
    }
  };

  return (
    <div
      className="rounded-[20px] bg-accent-soft p-5 ring-1 ring-inset ring-accent/20 md:hidden"
      data-testid="send-to-mac"
    >
      <p className="font-medium text-ink">On your phone right now?</p>
      <p className="mt-1 text-sm leading-6 text-ink-muted">
        Send the link to your Mac and install it there.
      </p>
      <button
        type="button"
        onClick={send}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink font-medium text-paper transition-[background-color,transform] duration-150 ease-out hover:bg-ink/85 active:scale-[0.97]"
      >
        {state === "copied" ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {state === "copied" ? "Link copied" : "Send the link to my Mac"}
      </button>
      <p
        className="mt-2 min-h-[1lh] text-xs text-ink-muted"
        role="status"
        aria-live="polite"
      >
        {state === "failed" ? `Couldn't open sharing. The link is ${url}` : ""}
      </p>
    </div>
  );
}
