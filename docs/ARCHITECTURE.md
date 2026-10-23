# Screenmac Architecture

Companion to `docs/PRD.md`. Describes what exists, where it lives, and the rules each runtime follows.

## 1. System overview

Screenmac is two independently built products that share brand language, not runtime code.

| Runtime | Location | Toolchain | Purpose |
|---|---|---|---|
| Marketing website | `apps/website` | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 4 | Product story, browser editor demo, waitlist, legal pages |
| Native macOS app | `apps/macos` | Swift 5.10+, SwiftUI + AppKit, ScreenCaptureKit, Xcode 16+ | Capture, annotate, record, and store media locally |
| Design tokens | `packages/design-tokens` | CSS custom properties + TS object | Shared color, type, radius, motion values |

```text
Visitor ──► Next.js site ──► Browser editor (client only, no uploads)
                         └─► POST /api/waitlist ──► optional webhook (email only)

User ──► Screenmac.app (menu bar, LSUIElement)
          ├─ HotkeyCenter (Carbon RegisterEventHotKey)
          ├─ CaptureCoordinator ──► SelectionOverlay (AppKit NSPanel per display)
          │                    └─► ScreenCaptureKit (SCScreenshotManager)
          ├─ QuickAccessPanel (non-activating NSPanel)
          ├─ EditorWindow (SwiftUI canvas + Core Image flattening)
          ├─ RecordingSession (SCStream + AVAssetWriter, mic via SCStream audio)
          └─ HistoryStore (JSON metadata in Application Support, media on disk)
```

The website never claims to perform operating-system capture. The Mac app never depends on the website.

## 2. Monorepo conventions

- **pnpm** workspaces: `apps/website`, `packages/*`. The Mac app is not a pnpm package; it is built by Xcode.
- TypeScript is strict. No `any` without a comment.
- Native Swift stays in `apps/macos`. No TypeScript abstraction over native capture.
- No cloud services until the local MVP is shipped (PRD §10).

| Command (repo root) | Action |
|---|---|
| `pnpm dev` | Website dev server on :3000 |
| `pnpm build` | Production website build |
| `pnpm test` | Vitest unit + component tests |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm macos:build` / `pnpm macos:test` | `xcodebuild` build / test (macOS only) |

## 3. Website

### 3.1 Source layout

```text
apps/website/src
├── app/                    routes (App Router) + /api/waitlist
├── components/
│   ├── brand/              Logo, app icon mark
│   ├── layout/             SiteHeader, SiteFooter, Section primitives
│   ├── landing/            Hero, Showcase, Features, HowItWorks, Comparison, Pricing, FAQ, FinalCTA
│   ├── ui/                 Button, Badge, small primitives
│   └── waitlist/           WaitlistForm
├── features/editor/        the browser editor (framework-free core + React UI)
│   ├── model.ts            document types, palette, defaults
│   ├── history.ts          reducer: commits, gestures, undo/redo, sample switching, reset
│   ├── geometry.ts         hit testing, handles, resize, snapping, bounds
│   ├── render.ts           one canvas renderer for both view and export
│   ├── export.ts           PNG flattening, download, clipboard with honest failure
│   ├── samples.ts          bundled sample metadata
│   ├── tools.ts            tool registry + shortcuts
│   └── ui/                 Editor, Canvas, Toolbar, Inspector, hooks
└── lib/                    product truth, pricing config, waitlist schema, analytics
```

### 3.2 Routes

| Route | Role |
|---|---|
| `/` | Landing page with the live editor |
| `/features` | Capability list with availability labels from `lib/features.ts` |
| `/pricing` | Plans from `lib/pricing.ts` |
| `/download` | Waitlist until `product.downloadUrl` is set |
| `/editor` | Full-viewport editor |
| `/privacy`, `/terms`, `/support`, `/changelog` | Content pages |
| `/api/waitlist` | Zod-validated email signup |

### 3.3 Browser editor

The editor is a client-only feature with a pure core:

- **Document** (`EditorDocument`): sample id, ordered annotations, crop, backdrop. All geometry is in *source image pixels*; zoom, crop, and padding never alter stored coordinates.
- **History** (`editorReducer`): every committed change pushes the previous document onto `past` (capped at 100). Pointer gestures (drag, resize, draw) preview live via `gestureStart → gesturePreview* → gestureEnd`, producing exactly one undo step. Escape cancels a gesture. Switching samples and Reset are undoable.
- **View**: a `<canvas>` sized to the output resolution and scaled with CSS. Pointer events are mapped `CSS px → output px → image px` using the canvas' bounding rect, so the math is correct at any zoom or device pixel ratio. A DOM overlay draws selection handles and the inline text editor.
- **Rendering** (`renderDocument`): the same function draws the view and the export. Blur, pixelate and redact rewrite pixels in place (down-sample / fill), so the PNG never contains the original pixels beneath them.
- **Export**: renders to an off-screen canvas at full resolution, encodes PNG via `toBlob`, downloads with a Mac-style filename. Copy uses `ClipboardItem` with a promise (Safari-safe) and reports failure instead of pretending.
- **Images**: bundled samples are immutable files in `public/samples/` (rendered from fictional HTML mockups by `scripts/render-samples.mjs`). Visitors may open their own image; it is decoded locally with `createImageBitmap` and never uploaded.

### 3.4 Product truth

- `lib/product.ts` – release facts: download URL (null until a signed build exists), minimum macOS, whether billing/cloud are live.
- `lib/pricing.ts` – the only source of plan names, prices, feature lists.
- `lib/features.ts` – each capability with an availability status: `web-demo`, `in-app`, `building`, `planned`. Marketing copy reads from here so labels stay honest.

### 3.5 Waitlist

`POST /api/waitlist` validates `{ email }` with Zod. If `WAITLIST_WEBHOOK_URL` is set it forwards the address and returns success only after a 2xx. Without it the API returns `503` with a clear message and the UI shows that message. No other data is accepted.

### 3.6 Analytics

None are installed. If added, events are limited to: page view, demo started, tool used, export, download click, waitlist submit. Never image content, annotation text, or clipboard data.

## 4. Native macOS app

### 4.1 Process model

`LSUIElement` menu bar app. Launch shows only the status item. Windows (editor, history, settings, recording HUD) open on demand.

### 4.2 Modules

| Folder | Responsibility |
|---|---|
| `App/` | `@main`, `AppDelegate`, `AppModel` (state + routing), menu bar content, window management |
| `Capture/` | `CaptureCoordinator`, `ScreenCapturer` (ScreenCaptureKit), `SelectionOverlay` (area + window pick), display geometry |
| `QuickAccess/` | Floating non-activating post-capture panel with drag-out |
| `Editor/` | `AnnotationDocument`, undo stack, SwiftUI canvas, Core Image flattening (`Flattener`) |
| `Recording/` | `RecordingSession` (`SCStream` → `AVAssetWriter`), HUD, mic permissions |
| `History/` | `HistoryStore` (JSON metadata), grid/list window |
| `Settings/` | `PreferencesStore` (UserDefaults), shortcuts, permissions |
| `Hotkeys/` | Carbon `RegisterEventHotKey` wrapper + shortcut model |
| `Storage/` | Application Support paths, file naming, thumbnails |

Pure logic (geometry, undo, flattening math, history persistence, shortcut parsing) has no AppKit dependency where possible so it is unit-testable with XCTest.

### 4.3 Storage

- Media: `~/Library/Application Support/Screenmac/Captures/`
- Thumbnails: `.../Thumbnails/`
- Metadata: `.../history.json` (id, type, created, path, thumbnail, format, size, duration). Blobs are never stored in metadata. Missing files are flagged, not fatal.
- Exports go to the user-chosen folder (default `~/Desktop`).

### 4.4 Permissions

| Permission | Requested | Failure behavior |
|---|---|---|
| Screen Recording | First capture/recording (`CGRequestScreenCaptureAccess`) | Explains and links to System Settings; no fake capture |
| Microphone | First mic-enabled recording (`AVCaptureDevice.requestAccess`) | Recording proceeds only after telling the user audio is off |

### 4.5 Redaction guarantee

Export renders a new bitmap. Redact fills pixels with a solid color; pixelate and blur are computed from the source with Core Image and composited into the output before encoding. The exported file contains no layer with the original pixels.

### 4.6 Platform limits (documented, not hidden)

- Window capture covers windows ScreenCaptureKit lists as on-screen; minimized and DRM-protected windows are not capturable.
- Scrolling capture has no universal API; not shipped until a tested support matrix exists.
- System audio requires macOS 13+ ScreenCaptureKit audio and permission; the UI reports whether audio was actually recorded.

## 5. Testing

| Layer | Tool | Focus |
|---|---|---|
| Editor core | Vitest | reducer, geometry, layout, export naming |
| Website components | Vitest + Testing Library (jsdom) | toolbar, inspector, waitlist form, pricing |
| Website e2e | Playwright (Chromium) | navigation, drawing, undo/redo, sample switch, reset, PNG download, copy fallback, keyboard, mobile |
| Native unit | XCTest | geometry, undo, flattening (redaction pixels), history persistence, missing files, hotkey parsing |
| Native manual | Real Mac | permissions, multi-display, Retina, window selection, recording |

## 6. Deployment

- Website: Vercel, project root `apps/website`.
- Mac app: signed + notarized `.dmg`. `product.downloadUrl` is set only once that artifact exists.
