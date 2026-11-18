---
title: "How to Crop a Screenshot on Mac"
slug: crop-screenshot-mac
description: "Crop a Mac screenshot from the floating thumbnail, in Preview with Rectangular Selection and Crop, or to an exact size or aspect ratio. Plus how to avoid cropping by capturing less."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
feature: tools/aspect-ratio-calculator
faq:
  - question: "How do I crop a screenshot on a Mac?"
    answer: "Open it in Preview, click Show Markup Toolbar, choose Rectangular Selection, drag over the part to keep and click Crop. Then save."
  - question: "Can I crop a screenshot right after taking it?"
    answer: "Yes. Click the floating thumbnail that appears after the capture and use the crop tool in the Markup window, then click Done."
  - question: "How do I crop to an exact size in Preview?"
    answer: "While selecting, choose Tools, Show Inspector and open the crop pane to see the selection's size in pixels. Adjust the selection until it matches, then click Crop."
  - question: "How do I undo a crop in Preview?"
    answer: "Choose Edit, Undo Crop straight away. Later, choose File, Revert To, Browse All Versions to restore an earlier version."
  - question: "Is cropping a safe way to remove private information?"
    answer: "Yes, for anything at the edges. Cropped pixels are removed from the exported image, which makes it the safest form of redaction."
sources:
  - title: "Apple Preview User Guide: Crop, resize or reduce an image"
    url: "https://support.apple.com/guide/preview/convert-graphics-file-types-prvw2015/mac"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
seoTitle: "How to Crop a Screenshot on Mac (Preview and Thumbnail)"
seoDescription: "Crop a Mac screenshot from the thumbnail or in Preview with Rectangular Selection and Crop. Crop to an exact pixel size or aspect ratio, and undo a crop."
draft: true
---
To crop a screenshot on a Mac, open it in **Preview**, click **Show Markup Toolbar**, choose **Rectangular Selection**, drag over the part you want to keep and click **Crop**. If you have just taken the screenshot, click the floating thumbnail instead and crop in the Markup window. For an exact pixel size, open **Tools → Show Inspector** while you select.

## How do I crop a screenshot in Preview?

1. Double-click the screenshot to open it in Preview.
2. If the Markup toolbar is not showing, click **Show Markup Toolbar**.
3. Click **Rectangular Selection**.
4. Drag over the area you want to keep. Drag the edges to adjust.
5. Click **Crop** in the Markup toolbar.
6. Choose **File → Save**, or **File → Export** to keep the original and save a cropped copy.

To undo straight away, choose **Edit → Undo Crop**. Apple's guide also notes you can go back later with **File → Revert To → Browse All Versions**.

## How do I crop right after taking a screenshot?

1. Take the screenshot as usual.
2. Click the thumbnail that floats in the corner before it disappears.
3. In the Markup window, choose the crop tool and drag the handles around the part you want.
4. Click **Done**.

The cropped version is what gets saved.

## How do I crop to an exact size or aspect ratio?

Preview shows the selection's dimensions in its Inspector:

1. Start a Rectangular Selection.
2. Choose **Tools → Show Inspector** and open the crop pane. Pick pixels as the unit.
3. Adjust the selection until the width and height match what you need.
4. Click **Crop**.

To work out the numbers, the free [aspect ratio and crop size calculator](/tools/aspect-ratio-calculator) gives the largest crop of your screenshot at 16:9, 4:5, 1:1 and other ratios, including where it starts. The free [screenshot editor](/editor) crops with fixed aspect ratios and shows the pixel size as you drag, then exports a PNG.

## Why is my cropped screenshot still so large in pixels?

On a Retina display, screenshots are saved at the display's full pixel resolution, usually twice the width and height of what you see in points. A crop that looks 600 wide on screen may be 1,200 pixels wide in the file. To make it smaller, resize it after cropping with **Tools → Adjust Size** in Preview.

## How do I crop several screenshots to the same size?

Documentation and slide decks look tidier when screenshots share one size. Preview has no batch crop, but you can keep crops consistent:

1. Decide on a target size or ratio first, for example 1600 × 1000 pixels or 16:10. The [aspect ratio calculator](/tools/aspect-ratio-calculator) shows the largest crop of each screenshot at that ratio.
2. For each screenshot, start a Rectangular Selection, open **Tools → Show Inspector**, and drag until the crop pane shows your target width and height.
3. Click **Crop**, then use **Tools → Adjust Size** if the screenshots came from different displays and need scaling to match.

Even simpler: capture at the same size from the start. In the Screenshot toolbar, turn on **Options → Remember Last Selection** and use **Capture Selected Portion**; the frame stays where you left it for the next capture, so every screenshot has the same dimensions.

## How do I avoid cropping in the first place?

Capture only what you need:

| Instead of | Use |
| --- | --- |
| Full screen, then crop | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> and drag over the area |
| Cropping a window out of the screen | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd>, <kbd>Space</kbd>, click the window |
| Recropping the same area every time | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>, Options, Remember Last Selection |

Window captures include a shadow unless you hold Option when you click; see [how to screenshot a window without the shadow](/blog/screenshot-window-without-shadow-mac).

## Is cropping enough to hide private information?

For anything at the edge of the image, yes. Cropping removes those pixels from the saved file, so nothing remains to recover. For private details in the middle, cover them with a solid box instead; see [how to redact sensitive information in a screenshot](/blog/redact-sensitive-info-screenshot).

[Screenmac](/download) opens each capture in an editor where crop sits next to arrows, numbered steps and redaction, so tidying a screenshot is one step rather than a trip through Preview.
