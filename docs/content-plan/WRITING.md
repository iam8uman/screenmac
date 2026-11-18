# Writing rules for guides, tools and quizzes

Shared by Windowmac, Slidemac and Screenmac. The build enforces the mechanical rules; the rest are on the writer.

## Why these rules exist

Pages are not the goal; people finding and installing the apps is. Google's [scaled content abuse policy](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) penalises many near-identical pages, and a penalty hits the whole domain. AI answer engines (ChatGPT, Perplexity, Google AI Overviews) cite pages that answer a question directly, accurately and fairly. Every rule below serves one of those two facts.

## Accuracy

- **The product.** Only claim what the app does today: the `facts` list in `src/data/site.ts` (Screenmac: `FACTS` in `src/lib/content/site.ts`) and the landing page. If a feature is not there, do not imply it.
- **macOS.** Check every step, menu name and shortcut against an Apple Support page you actually opened. Today is in the macOS 27 era (Apple's guides list macOS 27, Tahoe 26 and Sequoia 15). Say which versions a step applies to when it differs.
- **Other apps.** Price, licence, open source or not, features and platform must come from the app's own site, App Store page or repository, opened with WebFetch while writing. Add each to `sources`. If you cannot verify a fact, leave it out.
- **Never invent** statistics, prices, user counts, benchmarks, quotes, reviews or test results. No "we tested" unless a real test was run.

## Shape of a guide

1. **Direct answer first.** The first paragraph answers the title's question in 2 to 3 sentences that make sense quoted on their own. No preamble, no "In this article".
2. **Question-style H2s** that match how people search ("How do I…", "Why does…", "What is…"). At least 3.
3. **Steps as numbered lists**, options as tables, shortcuts with `<kbd>` tags.
4. **A "which should I use" table or summary** near the end when there is a choice.
5. **FAQ in frontmatter** (3 to 6 entries): real follow-up questions, each answered in 1 to 3 sentences. They become FAQ structured data.
6. **Links:** at least 3 internal links (other guides, a topic hub, a tool or quiz, the home page). A published post may only link to published pages; the build fails otherwise. Draft posts may link to other drafts.
7. **The app, honestly.** Mention the site's app where it genuinely solves the problem, usually once in the body plus the automatic callout. Mention a sister app only when it is on topic.
8. **Length:** 700 to 1,800 words. Long enough to be the best answer, no padding.

## Comparisons and alternatives

- Say plainly when a competitor is the better choice and for whom. Being fair is what gets a page cited.
- Use a comparison table with verified facts only: price, open source, macOS version, key features.
- "X alternative" pages target people leaving X: say why someone would leave, then the options.

## Style

- No em dashes (the build rejects them). Use commas, colons, full stops or brackets.
- Plain words. Short sentences. Second person ("you"). British or American spelling, but consistent within a post.
- No hype words: revolutionary, game-changer, seamless, unleash, supercharge, elevate, delve, robust, cutting-edge, in today's fast-paced world.
- Titles: `title` is the on-page H1. `seoTitle` up to 60 characters, contains the main query. `seoDescription` 70 to 160 characters.
- "2027" belongs only in titles of pages that are genuinely about 2027 (roundups, trends). Do not stamp it on evergreen how-tos.

## Distinct pages only

Each post targets one search query that no other post on the site targets. Before writing, check `docs/content-plan/backlog.csv` and the existing posts. Two posts that would answer the same question become one post. Posts that only swap a name or number into the same template are not allowed.

## Frontmatter

Copy an existing post. Fields: `title`, `slug` (= file name), `description`, `publishedAt`, optional `updatedAt`, `type` (how-to, alternative, comparison, roundup, explainer, troubleshooting), `tags` (topic keys from the site config; the first tag is the main topic), `primaryApp`, optional `feature` (`tools/<slug>` or `quiz/<slug>`), `faq`, `sources`, `seoTitle`, `seoDescription`, `draft`.

## Publishing in waves

New posts start with `draft: true` except the current wave. Drafts are not built, are not in the sitemap or llms.txt, and cannot be linked from published pages. To publish a wave, set `draft: false`, set `publishedAt` to the publish date, and run the build.

## Checks

Run the site's build after every batch. It lints content (length, links, H2s, duplicates, em dashes), builds every page and checks every internal link.
