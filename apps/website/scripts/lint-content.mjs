// Checks every blog post before a build. Fails loudly so weak or broken posts never ship.
// Rules mirror docs/content-plan/WRITING.md (repo root).
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('content/blog');
const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
const errors = [];
const warn = [];
const seen = new Map();
const seenTitles = new Map();

for (const file of files) {
  const raw = readFileSync(path.join(dir, file), 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) { errors.push(`${file}: missing frontmatter`); continue; }
  const [, fm, body] = m;
  const get = (k) => (fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm')) || [])[1];
  const slug = get('slug');
  const draft = /^draft:\s*true/m.test(fm);
  const problems = [];
  const where = `${file}`;
  if (slug !== file.replace(/\.md$/, '')) errors.push(`${where}: slug "${slug}" must match the file name`);
  if (seen.has(slug)) errors.push(`${where}: duplicate slug (also ${seen.get(slug)})`);
  seen.set(slug, file);
  const seoTitle = (get('seoTitle') || '').toLowerCase();
  if (seenTitles.has(seoTitle)) errors.push(`${where}: duplicate seoTitle (also ${seenTitles.get(seoTitle)})`);
  seenTitles.set(seoTitle, file);
  if (/[—]/.test(raw)) problems.push(`${where}: contains an em dash; rewrite the sentence`);
  const words = body.split(/\s+/).filter(Boolean).length;
  if (words < 600) problems.push(`${where}: only ${words} words; guides need at least 600`);
  const firstPara = body.trim().split(/\n\s*\n/)[0] || '';
  if (firstPara.startsWith('#')) problems.push(`${where}: start with a direct-answer paragraph, not a heading`);
  if (firstPara.split(/\s+/).length > 75) warn.push(`${where}: first paragraph is long (${firstPara.split(/\s+/).length} words); keep the answer tight`);
  const h2s = (body.match(/^## /gm) || []).length;
  if (h2s < 3) problems.push(`${where}: needs at least 3 H2 sections`);
  const internal = (body.match(/\]\(\/(?!\/)[^)]*\)/g) || []).length;
  if (internal < 3) problems.push(`${where}: needs at least 3 internal links (found ${internal})`);
  if (/^# /m.test(body)) problems.push(`${where}: do not use an H1 in the body; the title is the H1`);
  if (/lorem ipsum|TODO|TBD|\[citation needed\]/i.test(body)) problems.push(`${where}: placeholder text left in`);
  (draft ? warn : errors).push(...problems.map((m) => (draft ? `${m} [draft]` : m)));
}

for (const w of warn) console.warn(`warn  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error ${e}`);
  console.error(`\n${errors.length} content error(s) in ${files.length} posts.`);
  process.exit(1);
}
console.log(`content ok: ${files.length} posts`);
