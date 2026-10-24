# Screenmac

[![CI](https://github.com/iam8uman/screenmac/actions/workflows/ci.yml/badge.svg)](https://github.com/iam8uman/screenmac/actions/workflows/ci.yml)

A native macOS app for screenshots and screen recordings, plus its website with a working in-browser annotation editor.

**Website:** https://screenmac.vercel.app · **Download:** [latest release](https://github.com/iam8uman/screenmac/releases/latest)

## Install

Paste this into Terminal. It downloads the latest release, checks its checksum, puts Screenmac in Applications and opens it:

```bash
curl -fsSL https://screenmac.vercel.app/install.sh | bash
```

Or download [`Screenmac.zip`](https://github.com/iam8uman/screenmac/releases/latest/download/Screenmac.zip), unzip it and drag Screenmac into Applications. It needs macOS 14 or later and runs natively on Apple silicon and Intel. Builds aren't notarized yet, so the first launch of a downloaded copy needs **System Settings → Privacy & Security → Open Anyway** (macOS 15) or right-click → **Open** (macOS 14). Then allow Screen Recording, reopen Screenmac, and press **⌥⇧⌘4**.

If captures fail after an update, choose **Fix Screen Recording Permission…** from the menu bar icon, or run `tccutil reset ScreenCapture app.screenmac.Screenmac` and reopen Screenmac.

## Continuous integration and releases

`.github/workflows/ci.yml` runs on every push and pull request:

- **Website** (Ubuntu): lint, typecheck, Vitest, production build, Playwright e2e on desktop and phone.
- **Mac app** (macOS 15): XCTest, a universal Release build (`apps/macos/scripts/build-app.sh`), a smoke test that checks the bundle, architectures, signature and entitlements and launches the app for 10 seconds, then `Screenmac.zip` + SHA-256 as a build artifact.
- **Release:** when `main` carries a `MARKETING_VERSION` that has no GitHub release yet (or a `v*` tag is pushed), the zip is published as the latest release. To ship a new version, bump `MARKETING_VERSION` in `apps/macos/scripts/generate_xcodeproj.py`, regenerate the project, update `version` in `apps/website/src/lib/product.ts` (a unit test checks they match), and push.

The website deploys to Vercel from `main` (project root directory: `apps/website`).

```text
screenmac/
├── apps/
│   ├── website/        Next.js 16 site + browser editor (TypeScript, Tailwind 4)
│   └── macos/          SwiftUI + AppKit menu bar app (ScreenCaptureKit)
├── packages/
│   └── design-tokens/  Shared color, type, and motion tokens
└── docs/               PRD, architecture, roadmap, checklist
```

The website and the Mac app build independently and share no runtime code.

## Requirements

| For | Needs |
|---|---|
| Website | Node.js 22+, pnpm 10+ |
| Mac app | macOS 14+, Xcode 16+ |

## Website

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm build` | Production build |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm test` | Vitest unit + component tests |
| `pnpm test:e2e` | Playwright (desktop + mobile Chromium) against a production build |
| `pnpm check` | lint, typecheck, unit tests, build |

Run `npx playwright install chromium` once before the first e2e run, or set `PLAYWRIGHT_CHROMIUM_PATH` to an existing Chromium.

### The browser editor

`apps/website/src/features/editor` is a self-contained editor:

- 14 tools: select, crop, arrow, line, rectangle, filled rectangle, ellipse, text, counter, highlighter, pencil, blur, pixelate, redact
- Select, move, resize, duplicate, reorder, delete; arrow-key nudging
- Undo/redo for every change, including sample switches and Reset
- Open, paste, or drop your own image (decoded locally, never uploaded)
- Crop with aspect presets, zoom/fit, background presets with padding and shadow
- Export a flattened PNG, or copy it to the clipboard with an honest fallback

Redact, blur, and pixelate rewrite the exported pixels. The e2e suite checks the redacted pixels in the downloaded PNG.

### Waitlist

`POST /api/waitlist` forwards a validated email to `WAITLIST_WEBHOOK_URL`. Without that variable the API returns 503 and the form says signup isn't configured. It never claims success it didn't get.

## Mac app

See `apps/macos/README.md`.

## Docs

- `docs/PRD.md` — product requirements
- `docs/ARCHITECTURE.md` — structure and rules for each runtime
- `docs/ROADMAP.md` — phases and their verified status
- `docs/CHECKLIST.md` — task checklist and verification log
