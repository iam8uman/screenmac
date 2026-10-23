# Implementation checklist

Tick an item only after it was verified. The log at the bottom records what was run and where.

## Phase 1 — Foundation
- [x] P1-1 Docs: PRD, ARCHITECTURE, ROADMAP, CHECKLIST
- [x] P1-2 pnpm workspace, root scripts, `@screenmac/design-tokens`
- [x] P1-3 Website: strict TS, ESLint, Vitest, Playwright
- [ ] P1-4 Xcode project builds with `xcodebuild` (needs a Mac)

## Phase 2 — Website + browser editor
- [x] P2-1 Visual system (tokens, Geist, primitives)
- [x] P2-2 Editor core: model, reducer, geometry, renderer, export
- [x] P2-3 Editor UI: canvas, toolbar, inspector, selection handles, inline text
- [x] P2-4 Undo/redo, samples, open/paste/drop image, reset, zoom, crop + aspect, backgrounds, export, copy
- [x] P2-5 Keyboard shortcuts, accessible labels, reduced motion
- [x] P2-6 Landing page incl. 3D scroll showcase
- [x] P2-7 Subpages + 404
- [x] P2-8 Waitlist API honesty
- [x] P2-9 Unit, component, and e2e tests
- [x] P2-10 Browser verification (desktop 1440 and phone widths)

## Phase 3 — Native screenshot MVP (code complete, not yet compiled)
- [ ] P3-1 App shell: menu bar, windows, activation policy
- [ ] P3-2 ScreenCapturer (display / area / window)
- [ ] P3-3 Selection overlay
- [ ] P3-4 Global shortcuts
- [ ] P3-5 Quick Access
- [ ] P3-6 Editor + flattening
- [ ] P3-7 History
- [ ] P3-8 Settings, onboarding, permissions
- [ ] P3-9 XCTest suite passes
- [ ] P3-10 Manual run on a Mac

## Phase 4 — Recording (code complete, not yet compiled)
- [ ] P4-1 RecordingSession → MP4
- [ ] P4-2 Microphone + system audio + honest audio status
- [ ] P4-3 HUD, pause/resume, menu bar timer

## Verification log

| Date | Where | Command | Result |
|---|---|---|---|
| 2026-10-23 | Linux CI container | `pnpm lint` | pass, 0 problems |
| 2026-10-23 | Linux CI container | `pnpm typecheck` | pass |
| 2026-10-23 | Linux CI container | `pnpm test` (Vitest) | 9 files, 45 tests passed |
| 2026-10-23 | Linux CI container | `pnpm build` (Next 16.4.2) | pass; 11 routes, all static except `/api/waitlist` |
| 2026-10-23 | Linux CI container | `playwright test --retries=0 --repeat-each=2` against `next start` | 70/70 passed (35 tests × 2; desktop + Pixel 7) |
| 2026-10-23 | Linux CI container | tree-sitter Swift parse of 35 Swift files | 0 syntax errors (type checking needs Xcode) |
| — | Mac | `xcodebuild build` / `test` | not run yet |
