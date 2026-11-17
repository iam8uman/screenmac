// After `next build`: every internal href in prerendered pages must point to a built page or a public file.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(".next/server/app");
const pages = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = path.join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html")) pages.push(p);
  }
})(root);

const routes = new Set(pages.map((p) => "/" + path.relative(root, p).replace(/\.html$/, "").replace(/(^|\/)index$/, "")).map((r) => (r === "/" ? "/" : r.replace(/\/$/, ""))));
const extra = ["/robots.txt", "/sitemap.xml", "/icon.png", "/apple-icon.png", "/opengraph-image.png", "/twitter-image.png", "/favicon.ico"];
extra.forEach((r) => routes.add(r));
const broken = new Map();
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const [, raw] of html.matchAll(/href="(\/[^"#?]*)/g)) {
    if (raw.startsWith("//") || raw.startsWith("/_next/") || raw.startsWith("/_vercel/")) continue;
    const url = raw === "/" ? "/" : raw.replace(/\/$/, "");
    if (routes.has(url) || existsSync(path.join("public", url))) continue;
    broken.set(url, [...(broken.get(url) ?? []), path.relative(root, page)]);
  }
}
if (broken.size) {
  for (const [url, from] of broken) console.error(`broken ${url}  <- ${from.slice(0, 3).join(", ")}`);
  process.exit(1);
}
console.log(`links ok: ${pages.length} pages`);
