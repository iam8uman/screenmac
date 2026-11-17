import type { Metadata } from "next";
import { AppsCallout, Breadcrumbs, Card, CardGrid, PageWrap } from "@/components/content/Blocks";
import { JsonLd } from "@/components/seo/StructuredData";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/content/jsonld";
import { publishedQuizzes, quizPath } from "@/lib/content/quizzes";
import { SITE_KEY } from "@/lib/content/site";
import { publishedTools, toolHref } from "@/lib/content/tools";

export const metadata: Metadata = {
  alternates: { canonical: "/tools" },
  title: "Free Screenshot Tools and Quizzes",
  description:
    "Free browser tools for Mac users: a screenshot editor with real redaction, shortcut finders and quizzes. Nothing to install, nothing uploaded.",
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
      <header className="pt-14 md:pt-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="max-w-3xl text-[clamp(2.4rem,5.6vw,4.25rem)] font-semibold leading-[1.0] tracking-[-0.045em] text-ink">Free tools for Mac users</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
          Editors, shortcut finders and quizzes that run in your browser. Nothing to install and nothing leaves your device.
        </p>
      </header>
      <section className="mt-12" aria-labelledby="tools-h">
        <h2 id="tools-h" className="mb-5 text-2xl font-semibold tracking-[-0.02em] text-ink">Tools</h2>
        <CardGrid>
          {tools.map((t) => (
            <Card key={t.slug} href={toolHref(t)} tag="Tool" title={t.name} text={t.card} />
          ))}
        </CardGrid>
      </section>
      {quizzes.length > 0 && (
        <section className="mt-12" aria-labelledby="quiz-h">
          <h2 id="quiz-h" className="mb-5 text-2xl font-semibold tracking-[-0.02em] text-ink">Quizzes</h2>
          <CardGrid>
            {quizzes.map((q) => (
              <Card key={q.slug} href={quizPath(q.slug)} tag="Quiz" title={q.name} text={q.card} />
            ))}
          </CardGrid>
        </section>
      )}
      <AppsCallout primary={SITE_KEY} />
    </PageWrap>
  );
}
