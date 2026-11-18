import type { Metadata } from "next";
import Link from "next/link";
import { AppsCallout, Breadcrumbs, PageWrap } from "@/components/content/Blocks";
import { HubIndex } from "@/components/content/HubIndex";
import { JsonLd } from "@/components/seo/StructuredData";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/content/jsonld";
import { formatDate, getPublishedPosts, liveTopics, postPath, readingMinutes, topicPath } from "@/lib/content/posts";
import { SITE_KEY, TOPICS } from "@/lib/content/site";
import "@/components/content/hub.css";

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Mac Screenshot and Screen Recording Guides",
  description:
    "Practical guides to screenshots and screen recording on Mac: shortcuts, fixes, redaction, and app comparisons, updated for macOS in 2027.",
};

const typeLabel: Record<string, string> = {
  "how-to": "How-to",
  alternative: "Alternatives",
  comparison: "Versus",
  roundup: "Best of 2027",
  explainer: "Explainer",
  troubleshooting: "Fix",
};
// "Start here": the roundups and head-to-heads people search for most.
const weight: Record<string, number> = { roundup: 0, comparison: 1, alternative: 2 };

export default function BlogIndex() {
  const posts = getPublishedPosts();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/blog" },
  ];
  const topics = liveTopics().map((key) => ({
    key,
    label: TOPICS[key]!.label,
    href: topicPath(key),
    count: posts.filter((p) => p.tags.includes(key)).length,
  }));
  const featured = [...posts].sort((a, b) => (weight[a.type] ?? 9) - (weight[b.type] ?? 9)).slice(0, 3);
  const latest = posts.reduce((d, p) => {
    const t = p.updatedAt ?? p.publishedAt;
    return t > d ? t : d;
  }, new Date(0));

  return (
    <PageWrap>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={itemListJsonLd("Guides", posts.map((p) => ({ name: p.title, path: postPath(p.slug) })))} />
      <div className="hub">
        <header className="hub-head pt-8 md:pt-12">
          <Breadcrumbs crumbs={crumbs} />
          <div className="hub-head-row">
            <div>
              <p className="hub-kicker">
                <span />
                The Screenmac guides
              </p>
              <h1 className="hub-title">
                Capture it right, <em>first try.</em>
              </h1>
              <p className="hub-lede">
                Screenshots, screen recordings, redaction and head-to-head app comparisons for macOS. Every guide opens with the answer,
                then shows the work.
              </p>
            </div>
            <dl className="hub-stats">
              <div>
                <dt>Guides</dt>
                <dd>{posts.length}</dd>
              </div>
              <div>
                <dt>Topics</dt>
                <dd>{topics.length}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd className="sm">{formatDate(latest)}</dd>
              </div>
            </dl>
          </div>
        </header>

        <section className="hub-feature" aria-labelledby="start-h">
          <h2 id="start-h" className="hub-label">
            Start here
          </h2>
          <div className="hub-feature-grid">
            {featured.map((p, i) => (
              <Link key={p.slug} className={`hub-feat${i === 0 ? " big" : ""}`} href={postPath(p.slug)}>
                <span className="hub-feat-glow" aria-hidden="true" />
                <span className="hub-badge">{typeLabel[p.type]}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <span className="hub-feat-foot">
                  {readingMinutes(p.body)} min read <i aria-hidden="true">→</i>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <HubIndex
          topics={topics}
          rows={posts.map((p) => ({
            slug: p.slug,
            href: postPath(p.slug),
            title: p.title,
            description: p.description,
            tags: p.tags,
            type: p.type,
            typeLabel: typeLabel[p.type] ?? p.type,
            minutes: readingMinutes(p.body),
          }))}
        />
      </div>
      <AppsCallout primary={SITE_KEY} />
    </PageWrap>
  );
}
