import type { Metadata } from "next";
import Link from "next/link";
import { AppsCallout, Breadcrumbs, CardGrid, InstallCta, PageWrap, PostCard } from "@/components/content/Blocks";
import { JsonLd } from "@/components/seo/StructuredData";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/content/jsonld";
import { getPublishedPosts, liveTopics, postPath, topicPath } from "@/lib/content/posts";
import { SITE_KEY, TOPICS } from "@/lib/content/site";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Mac Screenshot and Screen Recording Guides",
  description:
    "Practical guides to screenshots and screen recording on Mac: shortcuts, fixes, redaction, and honest app comparisons, updated for macOS in 2027.",
};

export default function BlogIndex() {
  const posts = getPublishedPosts();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/blog" },
  ];
  const topics = liveTopics().map((key) => ({ key, ...TOPICS[key]!, posts: posts.filter((p) => p.tags.includes(key)) }));
  return (
    <PageWrap>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={itemListJsonLd("Guides", posts.map((p) => ({ name: p.title, path: postPath(p.slug) })))} />
      <header className="pt-14 md:pt-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="max-w-3xl text-[clamp(2.4rem,5.6vw,4.25rem)] font-semibold leading-[1.0] tracking-[-0.045em] text-ink">
          Mac screenshot and recording guides
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
          Step-by-step answers, shortcuts, fixes and honest comparisons. Each one starts with the answer.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {topics.map((t) => (
            <li key={t.key}>
              <Link href={topicPath(t.key)} className="inline-block rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted hover:border-line-strong hover:text-ink">
                {t.label} ({t.posts.length})
              </Link>
            </li>
          ))}
        </ul>
      </header>
      {topics.map((t) => (
        <section key={t.key} className="mt-14" aria-labelledby={`t-${t.key}`}>
          <h2 id={`t-${t.key}`} className="mb-5 text-2xl font-semibold tracking-[-0.02em] text-ink">
            <Link href={topicPath(t.key)}>{t.label}</Link>
          </h2>
          <CardGrid>
            {t.posts.slice(0, 6).map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </CardGrid>
          {t.posts.length > 6 && (
            <p className="mt-4">
              <Link href={topicPath(t.key)} className="text-ink underline underline-offset-2">
                All {t.posts.length} {t.label.toLowerCase()} →
              </Link>
            </p>
          )}
        </section>
      ))}
      <AppsCallout primary={SITE_KEY} />
      <InstallCta />
    </PageWrap>
  );
}
