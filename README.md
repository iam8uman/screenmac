# Screenmac

A native macOS app for screenshots and screen recordings, plus its website with a working in-browser annotation editor.

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
