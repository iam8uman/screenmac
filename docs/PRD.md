# Screenmac — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Ready for implementation with Cursor  
**Product type:** Native macOS productivity application + marketing website  
**Working name:** Screenmac  
**Primary goal:** Build a polished, fast, privacy-conscious Mac screenshot and screen-recording toolkit with a beautiful, interactive landing page.

---

# 1. Product vision

Screenmac is a native macOS application that makes capturing, editing, explaining, and sharing anything on your screen effortless.

Users should be able to capture a screen or window, annotate the result, hide sensitive information, copy or save it, and share it without breaking their workflow.

The product must feel like a premium Mac application: minimal, precise, responsive, keyboard-first, and integrated naturally with macOS.

The website must communicate the product's value immediately and allow visitors to experience a functional demo before downloading the application.

## Product principles

1. **Native first:** Use native macOS APIs and SwiftUI for the desktop application.
2. **Instant workflow:** Common capture actions should require as few interactions as possible.
3. **Privacy by default:** Local capture, editing, OCR, and file storage should not require an account.
4. **Beautiful output:** Screenshots should be presentation-ready without requiring another design tool.
5. **Honest functionality:** Never display a fake success message for an action that did not happen.
6. **Progressive development:** Ship a reliable core application before advanced features and cloud infrastructure.
7. **Distinct identity:** Take inspiration from the quality and utility of existing Mac tools, but create original branding, copy, layout, and visual assets.

# 2. Target audience

### Primary users

- Software engineers capturing bugs, UI states, and code examples.
- Designers sharing design feedback and visual references.
- Founders and product managers creating product demos.
- Technical writers and educators preparing tutorials.
- Remote teams communicating through annotated screenshots.
- Content creators producing quick screen recordings.

### Core user problems

- The default screenshot workflow involves too many steps.
- Screenshots often need arrows, text, highlights, cropping, or redaction.
- Long pages and conversations do not fit into one screenshot.
- Screen recordings need trimming and cleaner presentation.
- Users repeatedly search for recently captured files.
- Sharing screenshots through files and messaging apps creates friction.

### Positioning

**Capture anything. Make it clear. Share it instantly.**

Screenmac should be positioned as a modern, native Mac workspace for visual communication, not merely another screenshot utility.

# 3. Product scope

## MVP — Must ship

1. Native menu bar application.
2. Capture selected screen region.
3. Capture full screen.
4. Capture a selected window where supported.
5. Global keyboard shortcuts.
6. Quick Access floating capture preview.
7. Screenshot annotation editor.
8. Crop, arrows, shapes, text, and highlighting.
9. Blur, pixelation, and solid redaction.
10. Save, copy, export, and drag-and-drop.
11. Local capture history.
12. Screen recording with microphone support.
13. Local preferences and shortcut configuration.
14. Website with functional interactive demo.
15. Responsive marketing pages, download section, and pricing presentation.

## Phase 2 — Advanced capabilities

- Full-page scrolling capture and stitching.
- On-device OCR and text extraction.
- Floating, always-on-top screenshots.
- Screenshot backgrounds, padding, shadows, and presets.
- Video trimming and GIF export.
- Recording system audio where supported and permitted.
- Click and keystroke visualization.
- Camera overlay during recordings.
- Improved capture history search and filtering.

## Phase 3 — Cloud and collaboration

- Account registration and authentication.
- Image and video uploads.
- Shareable links.
- Password-protected links and expiration.
- Comments and feedback.
- Custom domains and branding.
- Team workspaces and access controls.
- Subscription billing and storage limits.

Cloud features must be presented as upcoming or unavailable until they actually work end-to-end.

# 4. Technology stack

Use a monorepo with separate native application and web application projects.

## Native macOS app

| Area | Technology |
|---|---|
| Language | Swift |
| UI | SwiftUI |
| Minimum OS | macOS 14.0 |
| Screen capture | ScreenCaptureKit and supported macOS capture APIs |
| Screen recording | ScreenCaptureKit |
| Image processing | Core Image, Core Graphics |
| OCR | Vision framework |
| Local storage | Application Support directory + SQLite or SwiftData |
| Preferences | UserDefaults |
| Clipboard | NSPasteboard |
| Global shortcuts | Carbon hotkey APIs or a maintained Swift package |
| Packaging | Xcode project and signed `.app` bundle |

Use native APIs wherever possible. Do not use Electron for the macOS application.

Important implementation constraints:

- Screen Recording permissions must be requested and explained appropriately.
- Microphone access requires authorization.
- Global shortcuts must be configurable and avoid conflicting with existing macOS shortcuts.
- Capture APIs and window selection must be tested on the minimum supported macOS version.
- Do not promise unrestricted capture of protected content.
- Use appropriate accessibility descriptions and keyboard navigation.

## Marketing website

| Area | Technology |
|---|---|
| Framework | Next.js with App Router |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS |
| UI components | shadcn/ui where useful |
| Icons | Lucide |
| Animation | Motion for React |
| Validation | Zod for forms and structured inputs |
| Testing | Vitest + React Testing Library + Playwright |
| Package manager | pnpm |
| Deployment | Vercel |

Avoid adding libraries without a clear purpose. Use CSS for simple transitions and reserve animation libraries for meaningful interactions.

## Repository structure

```text
screenmac/
├── apps/
│   ├── website/
│   └── macos/
├── packages/
│   └── design-tokens/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
├── pnpm-workspace.yaml
├── README.md
└── .gitignore
```

Keep native Swift code separate from the TypeScript website. Share design tokens and product concepts where appropriate, but do not force cross-platform abstractions onto native macOS functionality.

# 5. Native application requirements

## 5.1 Menu bar application

Screenmac must launch as a background productivity application with a menu bar icon.

The menu should include:

- Capture area.
- Capture window.
- Capture full screen.
- Start screen recording.
- Open capture history.
- Open settings.
- Quit Screenmac.

The application should be able to launch without opening a large main window.

## 5.2 Screenshot capture

### Capture area

1. User invokes a keyboard shortcut or menu action.
2. The capture overlay appears over the appropriate display.
3. A crosshair and selection rectangle follow the cursor.
4. User drags to select an area.
5. The selection can be adjusted before confirmation.
6. The screenshot is captured at the correct display resolution.
7. A Quick Access preview appears.
8. User can annotate, copy, save, or discard.

Escape cancels the current operation.

### Full-screen capture

Capture the selected display or the intended display according to user settings. Support multiple displays and Retina scaling.

### Window capture

Allow users to select an eligible window and capture its visible content. Account for window shadows, transparent windows, minimized windows, and macOS capture limitations.

### Capture settings

- Default output folder.
- Image format: PNG and JPEG.
- Optional screenshot cursor.
- Capture delay.
- Sound and notification preferences.
- Show or hide desktop clutter where technically feasible.
- Remember previous selection.
- Configurable keyboard shortcuts.

## 5.3 Quick Access overlay

After a capture, display a compact floating preview near the configured screen corner.

Actions: Preview, Annotate, Copy to clipboard, Save, Reveal in Finder, Drag to another application, Delete, Dismiss.

Requirements:

- Must not unnecessarily steal keyboard focus.
- Must support multiple displays.
- Must dismiss automatically according to user settings.
- Must handle multiple captures without losing data.
- Must remain usable with VoiceOver and keyboard navigation.

## 5.4 Annotation editor

Create a dedicated editor window with a central canvas, a compact toolbar, and an optional inspector panel.

### Tools

Select, Crop, Arrow, Rectangle, Filled rectangle, Ellipse, Line, Text, Highlighter, Pencil, Blur, Pixelate, Redact, Counter.

### Editor behavior

- Undo and redo.
- Select, move, resize, and delete annotations.
- Configure colors and stroke widths.
- Zoom in and out.
- Fit image to canvas.
- Keyboard shortcuts for common operations.
- Confirm before discarding unsaved work.
- Preserve annotation positions when zooming.
- Export to PNG or JPEG.
- Copy the final image to the clipboard.

### Security requirement

Redaction must not be merely a visual overlay in the final exported image. Flatten redaction into the output and ensure the original pixels beneath the redaction are not recoverable from the exported file.

Blur and pixelation must also be applied to the actual exported pixels. Do not describe a reversible blur as secure redaction.

The original image may remain available in the local editing session if the user chooses to preserve it.

## 5.5 Screen recording

The recording flow must support:

- Full-display recording.
- Selected-region recording.
- Window recording where supported.
- Microphone selection.
- Start, pause, resume, and stop.
- Visible recording duration.
- Recording status in the menu bar.
- MP4 export.
- Recording permissions and error handling.
- Recording history.

Where technically supported, add system-audio recording, cursor visibility, and configurable frame rate.

Do not silently claim audio was recorded if the relevant permission or capture stream was unavailable.

The first release does not require a sophisticated video editor. A basic trim interface can be added after stable recording and export work.

## 5.6 Local history

Every completed capture should be recorded locally.

History fields: Unique ID, Capture type, Creation timestamp, File path, Thumbnail path, File format, File size, Optional duration for videos.

Features: Grid and list views, Search by filename, Filter by screenshots and recordings, Preview, Copy, Reveal in Finder, Delete, Open in editor.

Use a local database for metadata and store actual media files separately. Avoid keeping large image and video blobs inside the metadata database.

If a stored file is moved or deleted externally, the UI must handle the missing file gracefully.

## 5.7 Floating screenshots

Treat as a post-MVP enhancement if implementing it properly would delay the core capture workflow.

## 5.8 OCR

Use the Vision framework for on-device text recognition. Do not upload screenshots to a server for OCR.

## 5.9 Scrolling capture

Implement scrolling capture as an advanced feature with a clearly defined support matrix. Native macOS does not provide a universal, reliable API for capturing every arbitrary scrollable window. Do not fake this capability by simply taking a normal screenshot.

# 6. Native application visual design

- Native macOS interaction patterns.
- Neutral backgrounds and clear typography.
- Restrained use of a distinctive blue-violet accent.
- Rounded panels and subtle borders.
- Smooth, fast animations.
- Compact controls and generous canvas space.
- Consistent light and dark appearance.
- Use SF Symbols where appropriate.

Screens: Menu bar menu, Capture selection overlay, Quick Access overlay, Annotation editor, Capture history, Recording controls, Preferences.

# 7. Marketing website requirements

The website must explain Screenmac within seconds, show the application visually, let visitors interact with a demo, explain key capabilities, build trust around privacy, convert visitors into download or waitlist signups, and work on desktop, tablet, and mobile.

Landing page structure:

- Sticky navigation with Features, How it works, Pricing, and Download / beta CTA.
- Hero: "Your screen, captured beautifully."
- Interactive product showcase with a real browser editor.
- Feature overview with honest availability labels.
- How it works (three steps).
- Factual comparison with the built-in macOS screenshot workflow.
- Configurable pricing (Free Beta / Pro upcoming).
- FAQ matching the privacy policy.
- Final CTA and footer with real routes.

Until a distributable app is available, show an honest beta or waitlist CTA instead of a fake download.

# 8. Website visual system

- Clean, light-first interface with a deep charcoal product showcase.
- Large but restrained headline typography.
- Warm off-white page backgrounds.
- Dark ink-colored text.
- A distinctive blue-violet accent.
- Fine borders and subtle shadows.
- Rounded screenshot frames.
- Small, purposeful motion.

Avoid generic SaaS templates, excessive gradients, glowing cards, random decorative blobs, and unnecessary glassmorphism.

# 9. Architecture for the interactive demo

Implement the demo as an isolated client-side feature with a defined state model. Source images stay separate from annotations. Export flattens both layers. Never modify bundled original sample assets.

# 10. Backend and cloud architecture

The MVP should not require a backend for local screenshot editing or the website demo. Do not build a fake cloud-sharing flow that generates a URL for a file that was never uploaded.

# 11. Accessibility and quality

Semantic HTML, keyboard navigation, visible focus indicators, appropriate contrast, accessible labels, reduced-motion support, and meaningful alternative text.

Website engineering targets: Lighthouse Performance 90+, Accessibility 95+. These are not marketing claims.

# 12. Error handling

Implement clear, actionable error states. Never leave a spinner running indefinitely. Never display a fake success message.

# 13. Testing requirements

Native: capture state transitions, annotation math, undo/redo, redaction export, history persistence, missing files, shortcuts, recording lifecycle.

Website: Vitest and Playwright covering navigation, demo tools, undo/redo, sample switching, reset, PNG export, clipboard fallback, pricing/FAQ, CTA honesty, keyboard access, reduced motion, and form validation.

Do not mark a test as passing without running it.

# 14. Analytics and privacy

Use privacy-conscious, minimal analytics. Do not collect screenshot content, annotation text, clipboard contents, or screen recordings.

# 15. Development roadmap

Phase 1 Foundation → Phase 2 Website and demo → Phase 3 Native screenshot MVP → Phase 4 Recording and polish → Phase 5 Advanced features → Phase 6 Release readiness.

# 16. Definition of done

A feature is complete only when its UI and behavior are implemented, success and error states are handled, relevant automated tests pass, documentation is updated, the website does not claim unavailable functionality, and no primary action is a dead button.

# 17. Execution rules

- Work in small, verifiable increments.
- Build and test after each meaningful milestone.
- Use strict TypeScript.
- Do not introduce cloud dependencies before the local MVP works.
- Do not claim native macOS capture is working based only on a browser simulation.
- Do not create a fake Xcode project.
- Never commit secrets.
- Do not claim builds or tests passed unless they were actually run.

# 18. Product success criterion

A user can discover Screenmac on the website, try the interactive editor, understand the benefits, download the native application, and complete a screenshot-to-annotation-to-export workflow without encountering a dead end.
