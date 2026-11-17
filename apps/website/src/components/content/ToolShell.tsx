import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/StructuredData";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/content/jsonld";
import { getPost } from "@/lib/content/posts";
import { SITE_KEY } from "@/lib/content/site";
import { getTool, toolHref } from "@/lib/content/tools";
import { AppsCallout, Breadcrumbs, CardGrid, FaqList, InstallCta, PageWrap, PostCard } from "./Blocks";

export function ToolShell({ slug, children, explain }: { slug: string; children: ReactNode; explain?: ReactNode }) {
  const tool = getTool(slug);
  const path = toolHref(tool);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Free tools", path: "/tools" },
    { name: tool.name, path },
  ];
  const related = tool.related.map(getPost).filter((p) => p !== undefined);
  return (
    <PageWrap narrow>
      <JsonLd data={webAppJsonLd({ name: tool.name, description: tool.seoDescription, path })} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(tool.faq)} />
      <header className="pt-14 md:pt-20">
        <Breadcrumbs crumbs={crumbs} />
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-accent">Free tool · runs in your browser</p>
        <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-ink">{tool.name}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">{tool.intro}</p>
      </header>
      <div className="mt-8 rounded-2xl border border-line bg-paper-raised p-5 md:p-7">{children}</div>
      {explain && <div className="article mt-10">{explain}</div>}
      <FaqList faq={tool.faq} />
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-[-0.02em] text-ink">Related guides</h2>
          <CardGrid>
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </CardGrid>
        </section>
      )}
      <AppsCallout primary={SITE_KEY} />
      <InstallCta />
    </PageWrap>
  );
}
