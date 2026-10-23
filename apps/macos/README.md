# Screenmac for Mac

A native menu bar app (SwiftUI + AppKit) for screenshots and screen recordings. Capture uses ScreenCaptureKit, recording writes H.264/AAC MP4 with AVAssetWriter, and global shortcuts use Carbon hot keys. Nothing is uploaded.

## Build and run

Requires macOS 14+ and Xcode 16+.

```bash
open apps/macos/Screenmac.xcodeproj      # then ⌘R
# or
xcodebuild -project apps/macos/Screenmac.xcodeproj -scheme Screenmac -configuration Debug build
xcodebuild -project apps/macos/Screenmac.xcodeproj -scheme Screenmac -destination 'platform=macOS' test
```

The project is signed to run locally ("-" identity), so no Apple developer team is needed to build. The first capture asks for **Screen Recording** permission. macOS applies it after you quit and reopen Screenmac. Each rebuild of a locally signed app can make macOS ask again. For a stable identity, set your team under Signing & Capabilities.

The project uses Xcode 16 folder-synchronized groups: any file added under `Screenmac/` or `ScreenmacTests/` is built automatically. `scripts/generate_xcodeproj.py` regenerates the project if build settings change.

## What it does

| Area | Behavior |
|---|---|
| Menu bar | Capture area, window, or full screen. Record area, window, or full screen. Open image, history, settings, quit. While recording it shows the elapsed time, with pause, resume, and stop. |
| Area capture | Freezes every display, then shows a selection overlay with a crosshair, loupe, pixel readout, and resize handles. Arrow keys nudge (Shift ×10, Option resizes). Return or double-click captures. Space switches to window mode. Esc cancels. |
| Window capture | Hover highlights a window and click captures its own content, with its shadow. |
| Full screen | Captures the display under the pointer at native pixels. |
| Quick Access | Non-activating floating preview stack. Annotate, copy, save, show in Finder, delete, dismiss, or drag the file into another app. Auto-dismiss pauses while you hover. |
| Editor | 14 tools (select, crop, arrow, line, rectangle, filled rectangle, ellipse, text, counter, highlighter, pencil, blur, pixelate, redact). Move, resize, nudge, duplicate, reorder, delete. Undo/redo. Zoom/fit. Copy, Save, Save As. Asks before discarding unsaved marks. |
| Redaction | Blur and pixelate are computed from the source pixels with Core Image. Redact fills with solid color. All three are flattened into the exported bitmap. Unit tests check the pixels. |
| Recording | ScreenCaptureKit stream to MP4. Microphone via ScreenCaptureKit on macOS 15, or AVCaptureSession on macOS 14. Optional system audio as a second track. Pause and resume are removed from the timeline. After saving, it says if microphone audio was requested but none arrived. |
| History | JSON metadata in `~/Library/Application Support/Screenmac`, with media files beside it. Grid and list views, search, and filter. Delete moves files to the Trash. Missing files are flagged and can be removed. |
| Settings | Quick Access position and dismiss time, auto-copy, auto-save folder, PNG/JPEG, pointer, delay, sound, hide desktop icons, remember selection, shortcut recorder with conflict checks, frame rate, microphone device, system audio, open at login. |

### Default shortcuts

They add ⌥ to the macOS ones, so the built-in screenshot shortcuts keep working:

| Action | Shortcut |
|---|---|
| Capture Area | ⌥⇧⌘4 |
| Capture Window | ⌥⇧⌘2 |
| Capture Full Screen | ⌥⇧⌘3 |
| Start / stop recording | ⌥⇧⌘5 |

## Source layout

```text
Screenmac/
├── App/          entry point, AppModel (routes every action), windows, HUDs
├── Capture/      ScreenCapturer (ScreenCaptureKit), SelectionOverlay
├── Core/         geometry, file naming, image encoding, storage paths
├── Editor/       model, geometry, undo history, shared renderer, canvas, SwiftUI chrome
├── History/      store + window
├── Hotkeys/      shortcut model + Carbon registration
├── QuickAccess/  floating preview
├── Recording/    RecordingSession, RecordingClock
├── Settings/     preferences, settings, onboarding
└── Resources/    asset catalog
ScreenmacTests/   XCTest: geometry, annotations, undo, flattening, history, shortcuts, naming, recording clock
Config/           Info.plist, entitlements
```

## Known limits

- Minimized windows and content an app protects from capture (for example DRM video) can't be captured. macOS decides this.
- Scrolling capture and on-device text recognition aren't built yet.
- The build is not notarized. Distribution needs a Developer ID team.
