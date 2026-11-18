"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export interface HubRow {
  slug: string;
  href: string;
  title: string;
  description: string;
  tags: string[];
  type: string;
  typeLabel: string;
  minutes: number;
}

export interface HubTopic {
  key: string;
  label: string;
  href: string;
  count: number;
}

/** The numbered guide index with search and topic chips. Chips stay real links for crawlers and no-JS. */
export function HubIndex({ rows, topics }: { rows: HubRow[]; topics: HubTopic[] }) {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return rows.filter(
      (r) =>
        (!topic || r.tags.includes(topic)) &&
        words.every((w) => `${r.title} ${r.description}`.toLowerCase().includes(w)),
    );
  }, [rows, q, topic]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const chip = (key: string, label: React.ReactNode, href: string) => (
    <li key={key || "all"}>
      <Link
        href={href}
        className={topic === key ? "on" : undefined}
        aria-current={topic === key ? "true" : undefined}
        onClick={(e) => {
          e.preventDefault();
          setTopic(key);
        }}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <section className="hub-index" aria-labelledby="all-h">
      <div className="hub-index-bar">
        <h2 id="all-h" className="hub-label">
          Every guide <span>{shown.length}</span>
        </h2>
        <label className="hub-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="sr">Search guides</span>
          <input ref={input} type="search" placeholder="Search guides…" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
          <kbd aria-hidden="true">/</kbd>
        </label>
      </div>
      <ul className="hub-chips" aria-label="Topics">
        {chip("", "All", "/blog")}
        {topics.map((t) =>
          chip(
            t.key,
            <>
              {t.label} <b>{t.count}</b>
            </>,
            t.href,
          ),
        )}
      </ul>
      <ol className="hub-list">
        {shown.map((r) => (
          <li key={r.slug}>
            <Link href={r.href}>
              <span className="hub-n">{String(rows.indexOf(r) + 1).padStart(2, "0")}</span>
              <span className="hub-row-main">
                <span className="hub-row-title">{r.title}</span>
                <span className="hub-row-desc">{r.description}</span>
              </span>
              <span className="hub-row-meta">
                <span className="hub-type" data-type={r.type}>
                  {r.typeLabel}
                </span>
                {r.minutes} min
              </span>
              <i className="hub-arrow" aria-hidden="true">
                →
              </i>
            </Link>
          </li>
        ))}
      </ol>
      {shown.length === 0 && (
        <p className="hub-empty">
          No guide matches that yet. Try a shorter word, or <Link href="/tools">browse the free tools</Link>.
        </p>
      )}
    </section>
  );
}
