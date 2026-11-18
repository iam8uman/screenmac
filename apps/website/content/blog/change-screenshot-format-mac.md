---
title: "How to Change the Screenshot File Format on Mac"
slug: change-screenshot-format-mac
description: "Mac screenshots save as PNG. On macOS Tahoe 26 or later you can switch to HDR (HEIF) in Options; for JPG or other formats, use the screencapture command or convert after capture. What each method does."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
feature: tools/image-format-converter
faq:
  - question: "What format are Mac screenshots saved in?"
    answer: "PNG by default. On supported Macs with macOS Tahoe 26 or later, choosing the HDR capture format in the Screenshot app's Options saves screenshots as HEIF instead."
  - question: "Can I make Mac screenshots save as JPG?"
    answer: "Not from the Options menu. For a single capture, run screencapture with -t jpg in Terminal. Otherwise take a PNG and convert it in Preview with File, Export, or in the free browser converter."
  - question: "What is the HDR capture format on Mac?"
    answer: "On supported Macs with macOS Tahoe 26 or later, HDR captures more brightness and color and saves screenshots as HEIF. It needs an HDR display to show the difference; SDR saves PNG and is the most compatible."
  - question: "Which format is best for screenshots?"
    answer: "PNG for text, code and interfaces, because it is lossless and keeps edges sharp. JPG or WebP when file size matters more, such as screenshots of photos."
  - question: "Can I change the format of screen recordings?"
    answer: "On macOS Tahoe 26 or later, recordings can be SDR (H.264) or HDR (HEVC). Recordings are saved as MOV files."
sources:
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
  - title: "Apple Preview User Guide: Convert image file types"
    url: "https://support.apple.com/guide/preview/convert-image-file-types-prvw1012/mac"
seoTitle: "Change Screenshot Format on Mac: PNG, HEIF or JPG"
seoDescription: "Mac screenshots save as PNG. Switch to HDR (HEIF) on macOS Tahoe 26, capture JPG with the screencapture command, or convert after. Steps for each."
draft: true
---
Mac screenshots save as **PNG** by default. On supported Macs running **macOS Tahoe 26 or later**, you can switch to **HDR**, which saves screenshots as **HEIF**, under **Shift-Command-5 → Options → Capture Format**. There is no Options setting for JPG: for a one-off JPG, use the `screencapture -t jpg` command in Terminal, and for everything else take a PNG and convert it afterwards.

## What formats can the built-in Screenshot tool save?

| macOS version | Screenshot format | Recording format |
| --- | --- | --- |
| Sequoia 15 and earlier | PNG | MOV |
| Tahoe 26 or later, SDR | PNG (most compatible) | MOV, H.264 |
| Tahoe 26 or later, HDR (supported Macs) | HEIF | MOV, HEVC |

Apple describes SDR as standard for most displays. HDR captures more brightness and color but needs an HDR display to show the difference; HDR screenshots appear as SDR on standard displays.

## How do I switch between PNG and HEIF?

On macOS Tahoe 26 or later, on supported Macs:

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>.
2. Click **Options**.
3. Under **Capture Format**, choose **SDR** for PNG or **HDR** for HEIF.
4. Press **Esc**.

The choice applies to the keyboard shortcuts too. If you do not see Capture Format, your Mac or macOS version does not support it, and screenshots are PNG.

For screenshots you share, SDR (PNG) is the safer choice: HEIF files open on Apple devices but not everywhere, and the extra range is invisible on most people's screens.

## How do I take a JPG screenshot?

The `screencapture` command, which is built into macOS, can save other formats. Its manual page lists `-t` for the image format, with PNG as the default and options including PDF, JPG and TIFF.

1. Open **Terminal**.
2. Type `screencapture -i -t jpg ~/Desktop/capture.jpg` and press Return.
3. Drag over an area, or press Space and click a window, just like Shift-Command-4.

The JPG lands on your desktop. `-i` makes it interactive; leave it out to capture the whole screen. Run `man screencapture` to see every option. This is handy in scripts, but for daily use it is easier to capture normally and convert.

## How do I convert a screenshot to JPG after taking it?

- **Preview:** open the PNG, choose **File → Export**, pick **JPEG** in the Format menu, adjust quality and save. Full steps are in [how to convert a screenshot from PNG to JPG](/blog/convert-screenshot-png-to-jpg-mac).
- **In your browser:** the free [screenshot format converter](/tools/image-format-converter) turns PNG into JPG or WebP (or back), lets you scale it down, and strips the original's metadata. Nothing is uploaded.

## Which format should I use?

| Screenshot of | Best format | Why |
| --- | --- | --- |
| Text, code, menus, interfaces | PNG | Lossless, sharp edges |
| Photos, video frames, gradients | JPG or WebP | Much smaller, artifacts are hard to see |
| HDR content on an HDR display | HEIF (HDR) | Keeps the extra brightness |
| Anything for a website | PNG or WebP | Small and sharp |
| Anything for a wide audience | PNG or JPG | Opens everywhere |

The [PNG vs JPG for screenshots](/blog/png-vs-jpg-screenshots) explainer goes into the trade-offs.

## Why are my screenshots so large as PNG?

Retina displays have a lot of pixels, and PNG stores every one of them without loss. A full-screen capture on a large Retina display can be several megabytes, especially when the screen shows photos or gradients, which PNG compresses poorly.

Before changing the format, try these:

- **Capture less.** An area or window capture is often a fraction of the full screen.
- **Resize.** Halving the width and height of a Retina screenshot cuts the pixel count to a quarter and still looks sharp on most screens. Use **Tools → Adjust Size** in Preview, or the 50% option in the [format converter](/tools/image-format-converter).
- **Convert only photo-heavy screenshots.** For screens full of text and flat colors, JPG is often not much smaller and blurs the text.

## Do capture apps let you choose the format?

Many do; check the app's settings. The free browser [screenshot editor](/editor) exports PNG with any redaction flattened into the pixels, and [Screenmac](/download) lets you copy, save or drag each capture from its Quick Access preview. If you need a different format afterwards, run the PNG through the converter.

For the basics of capturing, see [how to take a screenshot on a Mac](/blog/how-to-screenshot-on-mac).
