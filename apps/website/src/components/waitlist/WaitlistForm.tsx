"use client";

import { LoaderCircle } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { product } from "@/lib/product";
import { waitlistSchema, type WaitlistResult } from "@/lib/waitlist";

type Tone = "paper" | "accent";

export function WaitlistForm({ tone = "paper", id }: { tone?: Tone; id?: string }) {
  const autoId = useId();
  const inputId = id ?? `waitlist-${autoId}`;
  const messageId = `${inputId}-message`;
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<WaitlistResult | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setResult(null);
    const parsed = waitlistSchema.safeParse({ email });
    if (!parsed.success) {
      setResult({ ok: false, code: "invalid", message: parsed.error.issues[0]?.message ?? "Enter a valid email address." });
      return;
    }
    setPending(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => null)) as WaitlistResult | null;
      setResult(
        data ?? { ok: false, code: "upstream_failed", message: `The server sent an unexpected reply. Email ${product.email} instead.` },
      );
      if (data?.ok) setEmail("");
    } catch {
      setResult({
        ok: false,
        code: "upstream_failed",
        message: `The request didn't reach the server. Check your connection, or email ${product.email}.`,
      });
    } finally {
      window.clearTimeout(timeout);
      setPending(false);
    }
  }

  const accent = tone === "accent";
  const invalid = result && !result.ok && result.code === "invalid";

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={result ? messageId : undefined}>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label className="sr-only" htmlFor={inputId}>
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          required
          aria-invalid={invalid ? true : undefined}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className={cn(
            "h-12 min-w-0 flex-1 rounded-full px-5 text-base outline-none transition-shadow",
            accent
              ? "bg-white/12 text-white placeholder:text-white/55 ring-1 ring-white/25 focus:ring-2 focus:ring-white"
              : "bg-paper-raised text-ink placeholder:text-ink-faint ring-1 ring-line-strong focus:ring-2 focus:ring-accent",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-medium transition-colors disabled:opacity-70",
            accent ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-paper hover:bg-[#2b2a33]",
          )}
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
          {pending ? "Joining…" : "Join the beta list"}
        </button>
      </div>
      <p
        id={messageId}
        role="status"
        aria-live="polite"
        className={cn(
          "mt-3 min-h-6 text-sm",
          !result ? "" : result.ok ? (accent ? "text-white" : "text-success") : accent ? "text-[#ffe1de]" : "text-danger",
        )}
      >
        {result ? (result.ok ? "You're on the list. We'll email you once, when the beta build is ready." : result.message) : null}
      </p>
    </form>
  );
}
