---
title: "How to Record a Single Window on Mac"
slug: record-window-mac
description: "Record just one window on a Mac with Record Selected Window on macOS Tahoe 26 or later, or a selected portion on older versions. What a window recording includes, and apps that record windows too."
publishedAt: 2026-11-17
type: how-to
tags:
  - screen-recording
  - how-to
primaryApp: screenmac
feature: quiz/which-mac-screen-recorder
faq:
  - question: "Can I record only one window on a Mac?"
    answer: "Yes, on macOS Tahoe 26 or later. Press Shift-Command-5, choose Record Selected Window, click Record, then click the window."
  - question: "How do I record one window on macOS Sequoia or earlier?"
    answer: "The built-in recorder has no window mode before macOS Tahoe 26. Use Record Selected Portion and draw the frame around the window, and keep the window still while you record."
  - question: "Does a window recording include other windows on top of it?"
    answer: "A recording of a selected portion includes whatever is on screen in that area, including windows and notifications on top. Record Selected Window on macOS Tahoe 26 records the one window you click instead of an area of the screen."
  - question: "Which apps record a single window?"
    answer: "CleanShot X lists window recording, and Screenmac records a display, an area or a window to MP4. OBS Studio can use a window capture as a scene source."
sources:
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "CleanShot X: features"
    url: "https://cleanshot.com/features"
  - title: "OBS Studio"
    url: "https://obsproject.com/"
seoTitle: "Record One Window on Mac (Tahoe 26 and Older macOS)"
seoDescription: "Record a single window on Mac with Record Selected Window on macOS Tahoe 26, or a portion on older versions. What's included, and apps that record windows."
draft: true
---
To record a single window on a Mac running **macOS Tahoe 26 or later**, press **Shift-Command-5**, choose **Record Selected Window**, click **Record**, then click the window you want. Only that window is recorded. On **macOS Sequoia 15 and earlier**, the built-in recorder has no window mode, so use **Record Selected Portion** and draw the frame around the window, or use a capture app that records windows.

## How do I record a window on macOS Tahoe 26 or later?

1. Open the window you want to record and size it the way you want viewers to see it.
2. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>.
3. Click **Record Selected Window**.
4. Click **Options** to choose a microphone, turn on **Show Mouse Clicks**, or set a timer.
5. Click **Record**, then click the window.
6. Stop with the **Stop** button in the menu bar or <kbd>Command</kbd>-<kbd>Control</kbd>-<kbd>Esc</kbd>.

Apple lists Record Selected Window as requiring macOS Tahoe 26 or later. The recording saves to your desktop as a .mov file unless you changed Save to.

## How do I record a window on older macOS versions?

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd> and click **Record Selected Portion**.
2. Drag the frame's edges so it matches the window's edges. Line up the corners carefully; a few pixels of desktop at the edge is easy to crop later in an editor but not in QuickTime.
3. Click **Record**.

Two things to watch with this method:

- **The frame does not follow the window.** If you move the window, it moves out of the recording. Keep it still.
- **Anything on top is recorded.** Notifications, other windows and menus that pass over the area appear in the video. Turn on Do Not Disturb first.

Turning on **Remember Last Selection** in Options keeps the frame in place for the next take.

## Why record one window instead of the whole screen?

| Benefit | Why it matters |
| --- | --- |
| Privacy | Other apps, the menu bar, tabs and notifications stay out of the video |
| Focus | Viewers see only what you are explaining |
| Smaller files | Fewer pixels to encode than a full Retina display |
| Clean framing | No desktop clutter around the edges |

It is the easiest way to keep private material out of a recording. For a full checklist, see [how to redact sensitive information](/blog/redact-sensitive-info-screenshot); the same thinking applies to video.

## Which apps record a single window?

| App | Window recording | Notes |
| --- | --- | --- |
| Built-in (Tahoe 26+) | Record Selected Window | Free, .mov |
| CleanShot X | Window, fullscreen or custom area, MP4 or GIF | Paid, $35 one-time Basic |
| OBS Studio | Window capture as a scene source | Free, more setup |
| Screenmac | Display, area or window to MP4 | Free, optional microphone, nothing uploaded |

Screenmac is made by this site; it needs macOS 14 Sonoma or later, so it is one way to get window recording on Sonoma and Sequoia, where the built-in recorder has no window mode. [Download Screenmac](/download) to try it, or compare more options in the [best free screen recorders for Mac](/blog/best-free-screen-recorders-mac-2027).

## How do I show which window is being recorded?

Viewers only see the window, so give them context at the start:

- **Say what app you are in** in the first sentence of your narration.
- **Show the window title** by keeping the title bar inside the frame when you use a selected portion.
- **Turn on Show Mouse Clicks** in Options so each click is visible, since the pointer may move outside the window between steps.
- **Avoid switching apps** mid-recording. If the task needs two apps, record two short clips or record the whole screen instead.

If you need to show two windows side by side, arrange them first and record a portion that covers both. A window manager helps here: [Windowmac](https://www.windowmac.app/), a free app from the same developer, snaps windows into halves and thirds with a flick while you hold Option.

## What should I do before recording a window?

- **Resize the window** to a sensible size, such as 1280 × 800 points, so text is readable when viewers watch at a smaller size.
- **Close unrelated tabs and sidebars** inside the window.
- **Increase the font size** in apps such as Terminal or a code editor.
- **Do a short test** and play it back.

Afterwards, trim the start and end ([how to trim a screen recording](/blog/trim-screen-recording-mac)) and shrink it if needed ([make a recording smaller](/blog/reduce-screen-recording-file-size-mac)). For the full set of recording options, see [how to record your screen on a Mac](/blog/record-screen-mac).
