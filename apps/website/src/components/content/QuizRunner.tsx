"use client";

import Link from "next/link";
import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import type { QuizOutcome, QuizQuestion } from "@/lib/content/quizzes";

export function QuizRunner({ questions, outcomes }: { questions: QuizQuestion[]; outcomes: QuizOutcome[] }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const done = step >= questions.length;

  function choose(to: Record<string, number>) {
    setScores((s) => {
      const next = { ...s };
      for (const [k, v] of Object.entries(to)) next[k] = (next[k] ?? 0) + v;
      return next;
    });
    setStep((n) => n + 1);
  }

  const ranked = [...outcomes].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const [top, second] = ranked;

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5 md:p-7">
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-paper-sunk" aria-hidden="true">
        <i className="block h-full bg-accent transition-[width]" style={{ width: `${(step / questions.length) * 100}%` }} />
      </div>
      {!done ? (
        <div>
          <p className="text-xl font-semibold tracking-[-0.02em] text-ink">
            {step + 1}. {questions[step]!.question}
          </p>
          <div className="mt-4 grid gap-2.5">
            {questions[step]!.options.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => choose(o.to)}
                className="rounded-xl border border-line-strong bg-paper px-4 py-3 text-left text-ink transition-colors hover:border-accent hover:bg-accent-soft"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div aria-live="polite">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Your result</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{top!.name}</h2>
          <p className="mt-2 leading-7 text-ink-muted">{top!.what}</p>
          <Link href={top!.href} className={buttonClass("primary", "md", "mt-4")}>
            {top!.hrefLabel}
          </Link>
          {second && (
            <p className="mt-4 text-sm text-ink-muted">
              <strong className="text-ink">Close second:</strong> {second.name}.
            </p>
          )}
          <button
            type="button"
            className={buttonClass("secondary", "sm", "mt-4")}
            onClick={() => {
              setStep(0);
              setScores({});
            }}
          >
            Take it again
          </button>
        </div>
      )}
    </div>
  );
}
