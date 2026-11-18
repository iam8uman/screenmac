---
title: "How to Remove Metadata From a Screenshot on Mac"
slug: remove-metadata-from-screenshot-mac
description: "What metadata a Mac screenshot actually carries (no location, but a Screenshot comment, display details and Finder attributes) and how to strip it with a browser re-encode or Terminal."
publishedAt: 2026-11-17
type: how-to
tags:
  - annotation-privacy
  - screenshots
primaryApp: screenmac
feature: tools/image-format-converter
faq:
  - question: "Do Mac screenshots contain metadata?"
    answer: "Yes, a little. A screenshot we saved on macOS Tahoe 26.6 had an EXIF and XMP comment reading Screenshot, the pixel size, a color profile and a resolution value, plus Finder attributes marking it as a screen capture and recording where on screen it was taken."
  - question: "Do Mac screenshots include my location?"
    answer: "The screenshot we inspected had no GPS or location data. Screenshots are not photos from a camera, so there is no location to record."
  - question: "How do I remove all metadata from a screenshot?"
    answer: "Re-encode it from its pixels. The free screenshot format converter on this site redraws the image in your browser and saves a new PNG, JPG or WebP without the original's EXIF and XMP fields."
  - question: "Does converting in Preview remove the metadata?"
    answer: "Not necessarily. When we converted a screenshot to JPG with macOS's sips tool, the Screenshot comment came along. A pixel-only re-encode is the reliable way."
  - question: "What are extended attributes on a screenshot?"
    answer: "Finder and Spotlight notes stored by the Mac's file system next to the file, such as whether it is a screen capture. Clear them in Terminal with xattr -c followed by the file name."
sources:
  - title: "Apple Preview User Guide: Crop, resize or reduce an image (Show Inspector)"
    url: "https://support.apple.com/guide/preview/convert-graphics-file-types-prvw2015/mac"
  - title: "Apple Preview User Guide: Convert image file types"
    url: "https://support.apple.com/guide/preview/convert-image-file-types-prvw1012/mac"
seoTitle: "Remove Metadata From a Screenshot on Mac (What's in It)"
seoDescription: "See what metadata a Mac screenshot carries (no GPS, but a Screenshot tag, display info and Finder attributes) and strip it with a browser re-encode or Terminal."
draft: false
---
A Mac screenshot carries a small amount of metadata: **no location**, but an EXIF and XMP comment that says **"Screenshot"**, its pixel size, a color profile and a resolution value inside the file, plus **Finder attributes** next to it that mark it as a screen capture and record where on screen it was taken.

To remove the embedded fields, re-encode the image from its pixels, for example with the free [screenshot format converter](/tools/image-format-converter). To clear the Finder attributes, run `xattr -c` on the file in Terminal.

## What metadata is in a Mac screenshot?

We took a small area screenshot on macOS Tahoe 26.6 with Apple's own `screencapture` tool and inspected the PNG. Here is what it held:

| Where | Field | What it contained |
| --- | --- | --- |
| Inside the file (EXIF) | UserComment | `Screenshot` |
| Inside the file (XMP) | UserComment, pixel width and height | `Screenshot`, the image size |
| Inside the file | ICC color profile | Display P3 |
| Inside the file | Resolution (pHYs) | 144 pixels per inch (a Retina display) |
| Finder attribute | kMDItemIsScreenCapture | Marks the file as a screen capture |
| Finder attribute | kMDItemScreenCaptureType | `selection` (an area capture) |
| Finder attribute | kMDItemScreenCaptureGlobalRect | The capture's position and size on screen |
| Finder attribute | com.apple.provenance | A macOS file-origin marker |

There was **no GPS data, no user name and no device serial number**. The file name (`Screenshot` plus the date and time) also tells people when you took it.

Other Macs and macOS versions may differ slightly, so check your own files with the methods below.

## Why would I remove screenshot metadata?

For most screenshots, the metadata is harmless. It is worth stripping when:

- You post screenshots **publicly** and do not want them tagged as screenshots or dated.
- You are sharing images in a **sensitive context**, such as evidence, journalism or a security report, where every detail matters.
- You want **smaller files**; the color profile alone is a few kilobytes.
- You are publishing to a site that keeps original files and want them clean.

What metadata will not tell anyone is what was on your screen outside the capture. The pixels themselves are the bigger risk, so [redact the image](/blog/redact-sensitive-info-screenshot) first.

## How do I see a screenshot's metadata on a Mac?

- **Preview:** open the screenshot and choose **Tools → Show Inspector** to see general information about the image, such as its size and color model.
- **Finder:** select the file and choose **File → Get Info**. The **More Info** section shows some of the same details.
- **Terminal, for the full list:**
  - `mdls "Screenshot.png"` lists the Spotlight metadata macOS keeps for the file.
  - `xattr -l "Screenshot.png"` lists the extended attributes.

## How do I remove the metadata inside the file?

The reliable way is to **re-encode from pixels**: draw the image onto a blank canvas and save a new file. Only the picture comes across.

1. Open the free [screenshot format converter](/tools/image-format-converter).
2. Open, drop or paste the screenshot. It stays in your browser.
3. Choose **PNG** to keep it lossless, or JPG or WebP for a smaller file.
4. Download the new file.

The download has none of the original's EXIF or XMP fields. Exports from the [browser screenshot editor](/editor) work the same way, since it also builds a fresh PNG from the canvas.

Be careful with ordinary conversions. When we converted the same screenshot to JPG with macOS's built-in `sips` tool, the "Screenshot" comment was still in the JPG. Converting in Preview with **File → Export** may also carry fields over, so check the result if it matters.

## How do I remove the Finder attributes?

Extended attributes are stored by the Mac's file system alongside the file, not in the image data. To clear them:

1. Open **Terminal**.
2. Type `xattr -c ` (with a space), drag the screenshot onto the Terminal window to paste its path, and press Return.
3. Run `xattr -l` on the file again to confirm nothing is listed.

A file you downloaded from the converter is a new file, so it does not have the screen capture attributes in the first place.

## Which method should I use?

| You want to | Do this |
| --- | --- |
| Strip everything before posting publicly | Re-encode with the format converter, then rename the file |
| Keep the original but share a clean copy | Same, and keep the original locally |
| Clear only the "screen capture" Finder tags | `xattr -c` in Terminal |
| Hide what is in the picture | Redact first, then export |

Screenmac, our free Mac capture app, keeps captures and history in a folder on your Mac and has no upload feature. If you share screenshots often, its editor lets you redact and export in one place; [download it here](/download). To check the rest of your screenshot habits, take the [screenshot privacy check](/quiz/screenshot-privacy-check).
