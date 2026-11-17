// Writes public/llms.txt from the product facts, tools, quizzes and published guides.
// Runs before `next build` so the file always lists every live page.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SITE = "https://www.screenmac.app";
const posts = readdirSync("content/blog")
  .filter((f) => f.endsWith(".md"))
  .map((f) => matter(readFileSync(path.join("content/blog", f), "utf8")).data)
  .filter((d) => !d.draft)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const src = readFileSync("src/lib/content/site.ts", "utf8");
const topics = [...src.matchAll(/^\s*"?([a-z0-9-]+)"?: \{ label: "([^"]+)"/gm)].map((m) => ({ key: m[1], label: m[2] }));
const toolsSrc = readFileSync("src/lib/content/tools.ts", "utf8");
const tools = [...toolsSrc.matchAll(/slug: "([^"]+)",(?:\s*href: "([^"]+)",)?\s*name: "([^"]+)",\s*card:\s*"([^"]+)"/g)].map((m) => ({ path: m[2] ?? `/tools/${m[1]}`, name: m[3], card: m[4] }));
const quizSrc = readFileSync("src/lib/content/quizzes.ts", "utf8");
const quizzes = [...quizSrc.matchAll(/slug: "([^"]+)",\s*name: "([^"]+)",\s*card:\s*"([^"]+)"/g)].map((m) => ({ path: `/quiz/${m[1]}`, name: m[2], card: m[3] }));

const head = readFileSync("scripts/llms-head.md", "utf8").trim();
const lines = [head, "", "## Free tools", "", ...tools.map((t) => `- [${t.name}](${SITE}${t.path}): ${t.card}`), ...quizzes.map((q) => `- [${q.name}](${SITE}${q.path}): ${q.card}`), ""];
for (const t of topics) {
  const inTopic = posts.filter((p) => p.tags?.[0] === t.key);
  if (!inTopic.length) continue;
  lines.push(`## ${t.label}`, "", ...inTopic.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.description}`), "");
}
lines.push(
  "## Related apps by the same developer",
  "",
  "- [Windowmac](https://www.windowmac.app/): Free, open-source window manager for macOS. Hold Option and flick a window into place.",
  "- [Slidemac](https://www.slidemac.app/): Turns the edges of a Mac trackpad into sliders for volume, brightness, app switching and keyboard light.",
  "",
);
writeFileSync("public/llms.txt", lines.join("\n"));
console.log(`llms.txt: ${tools.length} tools, ${quizzes.length} quizzes, ${posts.length} guides`);
