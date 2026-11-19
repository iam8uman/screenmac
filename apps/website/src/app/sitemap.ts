import type { MetadataRoute } from "next";
import { getPublishedPosts, liveTopics, postPath, topicPath } from "@/lib/content/posts";
import { publishedQuizzes, quizPath } from "@/lib/content/quizzes";
import { publishedTools, toolHref } from "@/lib/content/tools";
import { product } from "@/lib/product";

const ROUTES = ["", "/download", "/editor", "/features", "/changelog", "/support", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => `${product.siteUrl}${p}`;
  const posts = getPublishedPosts();
  const newest = posts[0] ? (posts[0].updatedAt ?? posts[0].publishedAt) : undefined;
  return [
    ...ROUTES.map((route) => ({
      url: url(route),
      changeFrequency: route === "" || route === "/changelog" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/download" ? 0.9 : 0.6,
    })),
    { url: url("/blog"), lastModified: newest, priority: 0.8 },
    { url: url("/tools"), priority: 0.8 },
    ...liveTopics().map((t) => ({ url: url(topicPath(t)), lastModified: newest, priority: 0.6 })),
    ...publishedTools()
      .filter((t) => !t.href)
      .map((t) => ({ url: url(toolHref(t)), priority: 0.8 })),
    ...publishedQuizzes().map((q) => ({ url: url(quizPath(q.slug)), priority: 0.7 })),
    ...posts.map((p) => ({ url: url(postPath(p.slug)), lastModified: p.updatedAt ?? p.publishedAt, priority: 0.7 })),
  ];
}
