import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, CardGrid, InstallCta, PageWrap, PostCard } from "@/components/content/Blocks";
import { JsonLd } from "@/components/seo/StructuredData";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/content/jsonld";
import { getPublishedPosts, liveTopics, postPath, topicPath } from "@/lib/content/posts";
import { TOPICS } from "@/lib/content/site";

export function generateStaticParams() {
  return liveTopics().map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: PageProps<"/blog/topics/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  const info = TOPICS[topic];
  if (!info) return {};
  return { alternates: { canonical: topicPath(topic) }, title: `${info.label}: Mac Guides`, description: info.description };
}

export default async function TopicPage({ params }: PageProps<"/blog/topics/[topic]">) {
  const { topic } = await params;
  const info = TOPICS[topic];
  if (!info) notFound();
  const posts = getPublishedPosts().filter((p) => p.tags.includes(topic));
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/blog" },
    { name: info.label, path: topicPath(topic) },
  ];
  return (
    <PageWrap>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={itemListJsonLd(info.label, posts.map((p) => ({ name: p.title, path: postPath(p.slug) })))} />
      <header className="pt-14 md:pt-20">
        <Breadcrumbs crumbs={crumbs} />
        <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink">{info.label}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">{info.description}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {liveTopics().map((k) => (
            <li key={k}>
              <Link
                href={topicPath(k)}
                aria-current={k === topic ? "page" : undefined}
                className="inline-block rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted hover:text-ink aria-[current=page]:border-accent aria-[current=page]:text-ink"
              >
                {TOPICS[k]!.label}
              </Link>
            </li>
          ))}
        </ul>
      </header>
      <div className="mt-10">
        <CardGrid>
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </CardGrid>
      </div>
      <InstallCta />
    </PageWrap>
  );
}
