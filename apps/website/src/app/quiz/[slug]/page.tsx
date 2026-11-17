import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppsCallout, Breadcrumbs, FaqList, InstallCta, PageWrap } from "@/components/content/Blocks";
import { QuizRunner } from "@/components/content/QuizRunner";
import { JsonLd } from "@/components/seo/StructuredData";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/content/jsonld";
import { publishedQuizzes, quizPath } from "@/lib/content/quizzes";
import { SITE_KEY } from "@/lib/content/site";
import { shareOpenGraph } from "@/lib/share";

export function generateStaticParams() {
  return publishedQuizzes().map((q) => ({ slug: q.slug }));
}

const find = (slug: string) => publishedQuizzes().find((q) => q.slug === slug);

export async function generateMetadata({ params }: PageProps<"/quiz/[slug]">): Promise<Metadata> {
  const quiz = find((await params).slug);
  if (!quiz) return {};
  return {
    alternates: { canonical: quizPath(quiz.slug) },
    title: { absolute: quiz.seoTitle },
    description: quiz.seoDescription,
    openGraph: { ...shareOpenGraph, title: quiz.seoTitle, description: quiz.seoDescription, url: quizPath(quiz.slug) },
  };
}

export default async function QuizPage({ params }: PageProps<"/quiz/[slug]">) {
  const quiz = find((await params).slug);
  if (!quiz) notFound();
  const path = quizPath(quiz.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Free tools", path: "/tools" },
    { name: quiz.name, path },
  ];
  return (
    <PageWrap narrow>
      <JsonLd data={webAppJsonLd({ name: quiz.name, description: quiz.seoDescription, path })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(quiz.faq)} />
      <header className="pt-14 md:pt-20">
        <Breadcrumbs crumbs={crumbs} />
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Free quiz · {quiz.questions.length} questions</p>
        <h1 className="mt-3 text-[clamp(2.1rem,4.8vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink">{quiz.name}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">{quiz.intro}</p>
      </header>
      <div className="mt-8">
        <QuizRunner questions={quiz.questions} outcomes={quiz.outcomes} />
      </div>
      <section className="article mt-12" aria-labelledby="outcomes-h">
        <h2 id="outcomes-h">The possible results</h2>
        <ul>
          {quiz.outcomes.map((o) => (
            <li key={o.id}>
              <strong>{o.name}:</strong> {o.what}
            </li>
          ))}
        </ul>
      </section>
      <FaqList faq={quiz.faq} />
      <AppsCallout primary={SITE_KEY} />
      <InstallCta />
    </PageWrap>
  );
}
