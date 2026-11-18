---
title: "How to Convert a Screenshot From PNG to JPG on Mac"
slug: convert-screenshot-png-to-jpg-mac
description: "Convert a PNG screenshot to JPG on a Mac with Preview's Export, convert many at once, or use a browser converter. Plus a real test showing when JPG does not make screenshots smaller."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
feature: tools/image-format-converter
faq:
  - question: "How do I convert a PNG screenshot to JPG on a Mac?"
    answer: "Open it in Preview, choose File, Export, pick JPEG from the Format menu, set the quality and click Save."
  - question: "How do I convert several screenshots to JPG at once?"
    answer: "Open them all in one Preview window, select them in the sidebar, then choose File, Export and pick JPEG as the format."
  - question: "Will converting to JPG make my screenshot smaller?"
    answer: "Not always. In our test on three interface screenshots, JPEG at quality 80 was larger than the PNG every time. JPG helps most with photos and gradients, less with flat interfaces and text."
  - question: "Does converting to JPG lose quality?"
    answer: "Yes, a little. JPEG is lossy, so sharp text and edges can show faint artifacts, more so at lower quality. Keep the original PNG if you might need it."
  - question: "What happens to transparency when converting to JPG?"
    answer: "JPEG has no transparency. Transparent areas, such as a window screenshot's shadow, are filled with a solid color."
sources:
  - title: "Apple Preview User Guide: Convert image file types"
    url: "https://support.apple.com/guide/preview/convert-image-file-types-prvw1012/mac"
  - title: "Apple Preview User Guide: Crop, resize or reduce an image"
    url: "https://support.apple.com/guide/preview/convert-graphics-file-types-prvw2015/mac"
seoTitle: "Convert a PNG Screenshot to JPG on Mac (Preview Steps)"
seoDescription: "Convert a Mac screenshot from PNG to JPG with Preview's Export, batch convert several at once, or use a browser tool. Plus when JPG isn't actually smaller."
draft: true
---
To convert a screenshot from PNG to JPG on a Mac, open it in **Preview**, choose **File → Export**, pick **JPEG** from the **Format** menu, set the quality and click **Save**. To convert several at once, open them together in Preview, select them all in the sidebar and export. Before you do, know that JPG does not always make a screenshot smaller: for flat interfaces and text, a PNG is often the same size or smaller.

## How do I convert one screenshot in Preview?

1. Double-click the screenshot to open it in Preview.
2. Choose **File → Export** (on some macOS versions the item is called **Export As**).
3. Click the **Format** menu and choose **JPEG**.
4. Drag the **Quality** slider. Lower means a smaller file with more visible artifacts.
5. Change the name or folder if you like, then click **Save**.

Preview leaves the original PNG untouched and writes a new `.jpg` file. Apple's guide lists HEIC, JPEG, JPEG-2000, OpenEXR, PDF, PNG and TIFF in the Format menu, with more formats if you hold Option while clicking it.

## How do I convert many screenshots at once?

1. Select the screenshots in Finder and open them together (press <kbd>Command</kbd>-<kbd>O</kbd>). They open in one Preview window.
2. If the sidebar is hidden, choose **View → Thumbnails**.
3. Click in the sidebar and press <kbd>Command</kbd>-<kbd>A</kbd> to select every image.
4. Choose **File → Export**, pick **JPEG** as the format and a folder, and save. Apple's guide says the export applies to all the images you selected.

## Will JPG actually make my screenshot smaller?

We tested it. We took three 1600 × 1000 PNG screenshots of app interfaces (a code editor, a design tool and a metrics dashboard) and converted each with macOS's built-in `sips` tool at two JPEG quality settings:

| Screenshot | PNG | JPEG quality 80 | JPEG quality 60 |
| --- | --- | --- | --- |
| Code editor | 169 KB | 178 KB (5% larger) | 134 KB (21% smaller) |
| Design tool | 125 KB | 133 KB (7% larger) | 104 KB (17% smaller) |
| Metrics dashboard | 98 KB | 135 KB (38% larger) | 104 KB (7% larger) |

At quality 80, every JPEG was **larger** than the PNG. At quality 60, two were smaller and one was still larger, and fine text started to soften. Interfaces have large flat areas and sharp edges, which PNG compresses well and JPEG does not.

JPG pays off with **photos, video frames and gradients**, where it is usually much smaller. So convert when:

- The screenshot is mostly a photo or video.
- A site or form only accepts JPG.
- You checked the result and it really is smaller.

For a flat UI screenshot that is too big, it is usually better to **reduce the dimensions** than to change the format.

## How do I convert in a browser instead?

The free [screenshot format converter](/tools/image-format-converter) converts PNG to JPG or WebP (and back) in your browser. It shows the new size next to the original, so you can see straight away whether the conversion helped, and lets you scale to 75%, 50% or 25%. The new file is built from the pixels only, so it does not carry the original's metadata. Nothing is uploaded.

## What happens to transparency and quality?

- **Transparency:** JPEG cannot store it. Transparent areas, such as the shadow around a window screenshot, are filled with a solid color. Capture windows without the shadow (hold Option as you click) or keep them as PNG. See [how to screenshot a window without the shadow](/blog/screenshot-window-without-shadow-mac).
- **Quality:** every JPEG save loses a little detail. Do not convert back and forth; keep the PNG as the master copy.
- **Text:** small text in JPEGs can get faint halos. Zoom in before sending a screenshot of code or a form.

## Should I change the default format instead?

If you want every screenshot in a different format from the start, see [how to change the screenshot file format](/blog/change-screenshot-format-mac). For the reasoning behind each format, read [PNG vs JPG for screenshots](/blog/png-vs-jpg-screenshots). And if you are converting to strip metadata before sharing publicly, the [metadata guide](/blog/remove-metadata-from-screenshot-mac) explains what is in a Mac screenshot file.
