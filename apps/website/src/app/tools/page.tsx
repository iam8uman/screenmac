import type { Metadata } from "next";
import Link from "next/link";
import { AppsCallout, Breadcrumbs, PageWrap } from "@/components/content/Blocks";
import { JsonLd } from "@/components/seo/StructuredData";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/content/jsonld";
import { publishedQuizzes, quizPath } from "@/lib/content/quizzes";
import { SITE_KEY } from "@/lib/content/site";
import { publishedTools, toolHref } from "@/lib/content/tools";
import "@/components/content/hub.css";

export const metadata: Metadata = {
  alternates: { canonical: "/tools" },
  title: "Free Screenshot Tools and Quizzes",
  description:
    "Free browser tools for Mac users: a screenshot editor with real redaction, shortcut finders and quizzes. Nothing to install, nothing uploaded.",
};

// One glyph per kind of tool, read from the slug so new tools pick one up automatically.
type Kind = "edit" | "sheet" | "calc" | "convert" | "frame";
const kindOf = (slug: string): Kind =>
  slug === "editor"
    ? "edit"
    : /shortcuts|cheat-sheet/.test(slug)
      ? "sheet"
      : /converter/.test(slug)
        ? "convert"
        : /frame/.test(slug)
          ? "frame"
          : "calc";
const kindLabel: Record<Kind, string> = { edit: "Editor", sheet: "Cheat sheet", calc: "Calculator", convert: "Converter", frame: "Framer" };
const glyph: Record<Kind, React.ReactNode> = {
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  sheet: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M7 9h2M11 9h2M15 9h2M7 13h10M7 16h6" />
    </>
  ),
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8 7h8M8.5 12h1M14.5 12h1M8.5 16h1M14.5 16h1M12 15v2" />
    </>
  ),
  convert: (
    <>
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </>
  ),
  frame: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 8.5h18" />
      <circle cx="6" cy="6.3" r=".4" />
      <circle cx="8" cy="6.3" r=".4" />
    </>
  ),
};

export default function ToolsHub() {
  const tools = publishedTools();
  const quizzes = publishedQuizzes();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Free tools", path: "/tools" },
  ];
  return (
    <PageWrap>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd
        data={itemListJsonLd("Free tools", [
          ...tools.map((t) => ({ name: t.name, path: toolHref(t) })),
          ...quizzes.map((q) => ({ name: q.name, path: quizPath(q.slug) })),
        ])}
      />
      <div className="hub">
        <header className="hub-head pt-8 md:pt-12">
          <Breadcrumbs crumbs={crumbs} />
          <div className="hub-head-row">
            <div>
              <p className="hub-kicker">
                <span />
                Free tools from Screenmac
              </p>
              <h1 className="hub-title">
                Small tools, <em>straight answers.</em>
              </h1>
              <p className="hub-lede">
                An editor with real redaction, shortcut finders, converters and quizzes that run right here in your browser. Nothing to
                install, no sign-up, and nothing you open leaves your device.
              </p>
            </div>
            <dl className="hub-stats">
              <div>
                <dt>Tools</dt>
                <dd>{tools.length}</dd>
              </div>
              <div>
                <dt>Quizzes</dt>
                <dd>{quizzes.length}</dd>
              </div>
              <div>
                <dt>Sign-up</dt>
                <dd>None</dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="pt-9" aria-labelledby="tools-h">
          <h2 id="tools-h" className="hub-label">
            Tools
          </h2>
          <div className="hub-bento">
            {tools.map((t, i) => {
              const k = kindOf(t.slug);
              return (
                <Link key={t.slug} className={`hub-tool${i === 0 ? " wide" : ""}`} href={toolHref(t)} data-kind={k}>
                  <span className="hub-tool-top">
                    <span className="hub-glyph">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        {glyph[k]}
                      </svg>
                    </span>
                    <span className="hub-n">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="hub-badge">{kindLabel[k]}</span>
                  <h3>{t.name}</h3>
                  <p>{t.card}</p>
                  <span className="hub-open">
                    Open tool <i aria-hidden="true">→</i>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {quizzes.length > 0 && (
          <section className="hub-quizzes" aria-labelledby="quiz-h">
            <h2 id="quiz-h" className="hub-label">
              Quizzes
            </h2>
            <div className="hub-quiz-grid">
              {quizzes.map((q) => (
                <Link key={q.slug} className="hub-quiz" href={quizPath(q.slug)}>
                  <span className="hub-quiz-q" aria-hidden="true">
                    ?
                  </span>
                  <div className="hub-quiz-body">
                    <span className="hub-badge">Quiz · {q.questions.length} questions</span>
                    <h3>{q.name}</h3>
                    <p>{q.card}</p>
                  </div>
                  <span className="hub-quiz-go" aria-hidden="true">
                    Start →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <AppsCallout primary={SITE_KEY} />
    </PageWrap>
  );
}
