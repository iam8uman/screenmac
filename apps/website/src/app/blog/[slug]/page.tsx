import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppsCallout, Breadcrumbs, Card, CardGrid, FaqList, InstallCta, PageWrap, PostCard } from "@/components/content/Blocks";
import { JsonLd } from "@/components/seo/StructuredData";
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/content/jsonld";
import { formatDate, getPost, getPublishedPosts, postPath, readingMinutes, relatedPosts, topicPath } from "@/lib/content/posts";
import { publishedQuizzes, quizPath } from "@/lib/content/quizzes";
import { AUTHOR, TOPICS } from "@/lib/content/site";
import { publishedTools, toolHref } from "@/lib/content/tools";

export function generateStaticParams() {
  return getPublishedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    alternates: { canonical: postPath(post.slug) },
    title: { absolute: post.seoTitle },
    description: post.seoDescription,
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    openGraph: {
      type: "article",
      title: post.seoTitle,
      description: post.seoDescription,
      url: postPath(post.slug),
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: (post.updatedAt ?? post.publishedAt).toISOString(),
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.seoTitle, description: post.seoDescription, images: ["/twitter-image.png"] },
  };
}

function featureFor(feature?: string) {
  if (!feature) return undefined;
  const [kind, slug] = feature.split("/");
  if (kind === "quiz") {
    const q = publishedQuizzes().find((x) => x.slug === slug);
    if (!q) throw new Error(`Unknown quiz feature ${feature}`);
    return { name: q.name, card: q.card, href: quizPath(q.slug), tag: "Free quiz" };
  }
  const key = kind === "editor" ? "editor" : slug;
  const t = publishedTools().find((x) => x.slug === key);
  if (!t) throw new Error(`Unknown tool feature ${feature}`);
  return { name: t.name, card: t.card, href: toolHref(t), tag: "Free tool" };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const path = postPath(post.slug);
  const topic = post.tags[0]!;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/blog" },
    { name: TOPICS[topic]!.label, path: topicPath(topic) },
    { name: post.title, path },
  ];
  const feature = featureFor(post.feature);
  const related = relatedPosts(post);
  const updated = post.updatedAt && post.updatedAt.getTime() !== post.publishedAt.getTime() ? post.updatedAt : undefined;
  return (
    <PageWrap narrow>
      <JsonLd data={articleJsonLd({ title: post.title, description: post.description, path, publishedAt: post.publishedAt, updatedAt: post.updatedAt, type: post.type })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(post.faq)} />
      <article>
        <header className="pt-14 md:pt-20">
          <Breadcrumbs crumbs={crumbs} />
          <h1 className="text-[clamp(2.1rem,4.8vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink">{post.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">{post.description}</p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-faint">
            <span>
              By{" "}
              <a href={AUTHOR.url} rel="author" className="text-ink-muted underline underline-offset-2">
                {AUTHOR.name}
              </a>
            </span>
            <time dateTime={(updated ?? post.publishedAt).toISOString()}>{updated ? `Updated ${formatDate(updated)}` : formatDate(post.publishedAt)}</time>
            <span>{readingMinutes(post.body)} min read</span>
          </p>
        </header>
        <div className="article mt-10" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      {feature && (
        <div className="mt-10">
          <Card href={feature.href} tag={feature.tag} title={feature.name} text={feature.card} />
        </div>
      )}
      <FaqList faq={post.faq} />
      <AppsCallout primary={post.primaryApp} />
      {post.sources.length > 0 && (
        <section className="article mt-12">
          <h2 className="!mt-0 !text-lg">Sources</h2>
          <ul>
            {post.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} rel="nofollow noopener">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-[-0.02em] text-ink">Keep reading</h2>
          <CardGrid>
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </CardGrid>
          <p className="mt-5">
            <Link href="/blog" className="text-ink underline underline-offset-2">
              All guides →
            </Link>
          </p>
        </section>
      )}
      <InstallCta />
    </PageWrap>
  );
}
