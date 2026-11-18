---
title: "What Is the Snipping Tool on Mac?"
slug: snipping-tool-for-mac
description: "The Mac's answer to the Windows Snipping Tool is the Screenshot app, opened with Shift-Command-5. How each Snipping Tool mode maps to a Mac shortcut, and where the Mac differs."
publishedAt: 2026-11-17
type: explainer
tags:
  - screenshots
  - keyboard-shortcuts
primaryApp: screenmac
feature: tools/mac-screenshot-shortcuts
faq:
  - question: "Is there a Snipping Tool on Mac?"
    answer: "Not by that name. The Mac equivalent is the Screenshot app, opened with Shift-Command-5. It captures a selected area, a window or the full screen, records the screen and has a timer."
  - question: "What is the Mac shortcut for the Snipping Tool?"
    answer: "Shift-Command-4 is the closest match to the Windows Snipping Tool shortcut: it lets you drag over part of the screen. Shift-Command-5 opens the full Screenshot toolbar."
  - question: "Where is the Print Screen key on a Mac?"
    answer: "Macs do not have one. Apple lists Shift-Command-3 (full screen) and Shift-Command-4 (selected area) as the equivalents."
  - question: "Can I edit a snip on a Mac like in Snipping Tool?"
    answer: "Yes. Click the thumbnail that appears after a capture to open Markup, where you can draw, add shapes and text, and crop. For blur or pixelate, use a separate editor."
  - question: "Can the Mac copy a snip to the clipboard like Windows does?"
    answer: "Yes. Add Control to any screenshot shortcut, for example Control-Shift-Command-4, and the capture goes to the clipboard instead of a file."
sources:
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "Apple Mac User Guide: Windows keys on a Mac keyboard"
    url: "https://support.apple.com/guide/mac-help/cpmh0152/mac"
seoTitle: "Snipping Tool for Mac: The Built-In Equivalent"
seoDescription: "The Snipping Tool on Mac is the Screenshot app (Shift-Command-5). See how each Windows snip mode maps to a Mac shortcut, plus copy, timer and markup."
draft: false
---
The Mac's equivalent of the Windows Snipping Tool is the **Screenshot** app. Press **Shift-Command-5** to open its toolbar, or press **Shift-Command-4** to drag over part of the screen straight away, which is what most people use the Snipping Tool for. It is built in, free, and also records the screen.

If you have just switched from Windows, here is how your old habits translate.

## What is the Mac version of the Snipping Tool?

macOS has had a screenshot app with a toolbar since macOS Mojave. You can open it three ways:

- Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>.
- Open **Applications → Utilities → Screenshot**.
- Search for "Screenshot" with Spotlight (<kbd>Command</kbd>-<kbd>Space</kbd>).

The toolbar has buttons to capture the entire screen, a selected window or a selected portion, and to record the screen. An **Options** menu sets where captures are saved, a timer, whether the floating thumbnail appears and whether the pointer is included.

## How do Snipping Tool modes map to Mac shortcuts?

| Snipping Tool mode | Mac equivalent |
| --- | --- |
| Rectangle snip | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd>, then drag |
| Window snip | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd>, then <kbd>Space</kbd>, then click the window |
| Full-screen snip | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>3</kbd> |
| Free-form snip | No direct equivalent; capture a rectangle, then use Preview's Lasso Selection |
| Delay | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd> → Options → Timer (5 or 10 seconds) |
| Screen recording | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd> → Record Entire Screen or Record Selected Portion |

When you capture a window, hold <kbd>Option</kbd> as you click to leave out the window's shadow. Windows does not add one, so this keeps captures looking like what you are used to. See [how to screenshot a window without the shadow](/blog/screenshot-window-without-shadow-mac).

## Where is Print Screen on a Mac?

Mac keyboards have no Print Screen key. Apple's table of Windows keys on a Mac maps Print Screen to <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>3</kbd> for the full screen and <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> for a selected area.

One big difference: on Windows, Print Screen copies to the clipboard. On a Mac, these shortcuts **save a file to the desktop**. To copy instead, add <kbd>Control</kbd>:

- <kbd>Control</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>3</kbd> copies the whole screen.
- <kbd>Control</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> copies a selected area.

If you always want the clipboard, set it as the default under **Options → Save to → Clipboard** in the Screenshot toolbar.

## How do I edit a snip on a Mac?

After each capture, a thumbnail floats in the corner of the screen for a few seconds. Click it to open **Markup**, where you can draw, add shapes, text and a signature, rotate and crop. Click **Done** to save, or use the share button to send it.

What Markup cannot do is blur or pixelate. Drawing a shape over private text hides it visually, but a filled shape is the only reliable way to cover something with Markup. For blur and pixelate that are written into the pixels, use the free [browser screenshot editor](/editor), which works on any computer, or a capture app with its own editor.

## What does the Mac do differently from Windows?

- **Files go to the desktop**, named "Screenshot" with the date and time, not to a Screenshots folder in Pictures. Change it under Options → Save to. See [where screenshots go on a Mac](/blog/where-do-screenshots-go-mac).
- **The shortcut uses three or four keys** instead of one. You get used to it within a day, and you can change the keys in **System Settings → Keyboard → Keyboard Shortcuts → Screenshots**.
- **Window captures include a shadow** by default.
- **Retina screens produce larger images**, usually twice the pixel width of what you selected.

## Do I need a third-party snipping app on a Mac?

Most people do not. The built-in tool covers rectangle, window and full-screen captures, the clipboard, a timer and recording. A third-party app becomes worth it when you annotate most captures, need to blur private details, or want scrolling capture.

[Screenmac](/download) is a free native option that adds an editor with arrows, numbered steps, blur and pixelate after every capture, using its own shortcuts (<kbd>Option</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> for an area) so the built-in ones keep working. It does not do scrolling capture; our [best screenshot apps for Mac](/blog/best-screenshot-apps-mac-2027) roundup covers the ones that do.

Forget a shortcut? The [Mac screenshot shortcut finder](/tools/mac-screenshot-shortcuts) gives you the exact keys in two clicks, and [how to take a screenshot on a Mac](/blog/how-to-screenshot-on-mac) walks through every method.
