import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";
import { TOPICS } from "./site";

const DIR = path.join(process.cwd(), "content/blog");
const topicKeys = Object.keys(TOPICS) as [string, ...string[]];

const faq = z.object({ question: z.string(), answer: z.string() });

export const postSchema = z.object({
  title: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(220),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  type: z.enum(["how-to", "alternative", "comparison", "roundup", "explainer", "troubleshooting"]),
  tags: z.array(z.enum(topicKeys)).min(1),
  primaryApp: z.enum(["windowmac", "slidemac", "screenmac"]),
  /** "tools/<slug>", "quiz/<slug>" or "editor": a free tool to feature. */
  feature: z.string().optional(),
  faq: z.array(faq).min(3).max(8),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
  seoTitle: z.string().max(60),
  seoDescription: z.string().min(70).max(160),
  draft: z.boolean().default(false),
});

export type PostMeta = z.infer<typeof postSchema>;
export interface Post extends PostMeta {
  body: string;
  html: string;
}

let cache: Post[] | null = null;

function load(): Post[] {
  if (cache) return cache;
  const files = readdirSync(DIR).filter((f) => f.endsWith(".md"));
  cache = files.map((file) => {
    const { data, content } = matter(readFileSync(path.join(DIR, file), "utf8"));
    const parsed = postSchema.safeParse(data);
    if (!parsed.success) throw new Error(`${file}: ${parsed.error.message}`);
    return { ...parsed.data, body: content, html: marked.parse(content, { async: false }) };
  });
  return cache;
}

/** Published posts, newest first. Drafts never reach pages, the sitemap or llms.txt. */
export function getPublishedPosts(): Post[] {
  return load()
    .filter((p) => !p.draft)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function getPost(slug: string): Post | undefined {
  return getPublishedPosts().find((p) => p.slug === slug);
}

export const postPath = (slug: string) => `/blog/${slug}`;
export const topicPath = (topic: string) => `/blog/topics/${topic}`;
export const readingMinutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 220));

export function relatedPosts(post: Post, count = 4): Post[] {
  const tags = new Set(post.tags);
  return getPublishedPosts()
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      p,
      score: p.tags.filter((t) => tags.has(t)).length * 2 + (p.type === post.type ? 1 : 0) + (p.primaryApp === post.primaryApp ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.p.publishedAt.getTime() - a.p.publishedAt.getTime())
    .slice(0, count)
    .map(({ p }) => p);
}

export const liveTopics = () => Object.keys(TOPICS).filter((k) => getPublishedPosts().some((p) => p.tags.includes(k)));

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
