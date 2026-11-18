---
title: "How to Screenshot a Window Without the Shadow on Mac"
slug: screenshot-window-without-shadow-mac
description: "Capture a single Mac window without the drop shadow using Shift-Command-4, Space and Option-click, plus how to remove the shadow from a capture you already took."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
feature: tools/screenshot-window-frame
faq:
  - question: "How do I screenshot a window without the shadow on a Mac?"
    answer: "Press Shift-Command-4, then Space so the pointer becomes a camera, then hold Option while you click the window. The saved image contains just the window, with no shadow around it."
  - question: "Can I turn off the window shadow permanently?"
    answer: "Apple's screenshot guides do not document a setting for it. Holding Option while you click is the documented way, and you need to do it for each window capture."
  - question: "Why does my window screenshot have a big transparent border?"
    answer: "That border is the shadow. macOS saves it as soft, partly transparent pixels around the window, which look like a white or grey margin in apps that do not show transparency."
  - question: "Does the Option trick work when copying to the clipboard?"
    answer: "Yes. Press Control-Shift-Command-4, then Space, then Option-click the window. The window goes to the clipboard without its shadow."
  - question: "How do I remove the shadow from a screenshot I already took?"
    answer: "Crop it. In Preview, use Rectangular Selection to select the window itself, then click Crop. The shadow is outside the window edges, so a tight crop removes it."
sources:
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "Apple Preview User Guide: Crop, resize or reduce an image"
    url: "https://support.apple.com/guide/preview/convert-graphics-file-types-prvw2015/mac"
seoTitle: "Mac Screenshot Window Without Shadow: The Option Trick"
seoDescription: "Screenshot a Mac window without its drop shadow: Shift-Command-4, Space, then Option-click. Also how to crop the shadow off a capture you already took."
draft: false
---
To screenshot a window without the shadow on a Mac, press **Shift-Command-4**, then press **Space**, then **hold Option while you click the window**. macOS saves just the window, edge to edge, with no soft shadow around it. The same trick works with Control added if you want the capture on the clipboard instead of in a file.

The rest of this guide covers why the shadow is there at all, how to fix captures you already took, and when you might actually want to keep it.

## How do I capture a window without the shadow?

1. Open the window you want and make sure it is not hidden behind others. A menu that is open counts as a window too.
2. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd>. The pointer turns into a crosshair.
3. Press <kbd>Space</kbd>. The pointer turns into a camera and the window under it is highlighted.
4. Hold <kbd>Option</kbd> and click the window.

The file appears on your desktop (or wherever you set screenshots to save) a moment later. Press **Esc** at any point to cancel. If you would rather paste the window straight into a chat, start with <kbd>Control</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> instead and do the same Space and Option-click.

Do you use the Screenshot app (<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>) instead? Choose **Capture Selected Window** in the toolbar, then hold **Option** as you click the window. Apple documents the Option-click for the keyboard method; it is worth testing once on your Mac with the toolbar to see the result.

## Why do Mac window screenshots have a shadow?

macOS draws a soft shadow under every window to show it is floating above the desktop. When you capture a window, it keeps that look by saving the shadow as part of the image. The shadow is made of partly transparent pixels, so the PNG is larger than the window itself.

That is useful when you drop the image onto a slide or a web page with a colored background: the window looks lifted and natural. It is a nuisance when you:

- Paste into apps that do not show transparency, where the shadow turns into a grey or white margin.
- Put several captures side by side in documentation and need them to line up exactly.
- Want to add your own frame, padding or background later.

## How do I remove the shadow from a screenshot I already took?

The shadow sits outside the window's edges, so cropping removes it.

1. Open the screenshot in Preview.
2. If the Markup toolbar is hidden, click **Show Markup Toolbar**, then choose **Rectangular Selection**.
3. Drag a selection that hugs the window's edges. Zoom in to line it up.
4. Click **Crop** in the Markup toolbar, then save.

Rounded window corners will still have small transparent areas after cropping. If you need a solid background behind them, export as JPG (which fills transparency with a solid color) or place the image on a background with the free [screenshot window frame tool](/tools/screenshot-window-frame).

## Should I keep the shadow or remove it?

| You are making | Shadow? | Why |
| --- | --- | --- |
| Documentation or help articles | Off | Captures line up and stay small |
| Bug reports | Off | Nothing distracting around the window |
| Slides on a colored background | On | Looks natural, already transparent |
| Social posts or a landing page | Off, then add your own frame | You control padding, background and shadow |
| Pasting into chat | Either | Many chat apps show transparency well |

If you take window captures all day and want the shadow choice built into your capture app, [Screenmac](/download) captures windows with its own shortcut (<kbd>Option</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>2</kbd>) and opens each capture in an editor where you can crop, mark it up and add a background.

## What if Option-click does not work?

- **Nothing happens when you press Space.** Another app may be using the shortcut. See the fixes in [Mac screenshot not working](/blog/mac-screenshot-not-working).
- **The capture still has a border.** Check that you were holding Option at the moment you clicked, not before pressing Space.
- **The window comes out blank.** Some apps, such as the Apple TV app, do not allow their windows to be captured.

For every other capture type and shortcut, see the full guide to [taking a screenshot on a Mac](/blog/how-to-screenshot-on-mac), or browse all [screenshot guides](/blog/topics/screenshots).
