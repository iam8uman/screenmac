---
title: "How to Redact Sensitive Information in a Screenshot"
slug: redact-sensitive-info-screenshot
description: "A before-you-share routine for screenshots: capture less, crop, cover secrets with flattened boxes, check the edges of the frame and the file itself. With steps for Mac and a free browser editor."
publishedAt: 2026-11-17
type: how-to
tags:
  - annotation-privacy
  - how-to
primaryApp: screenmac
feature: editor
faq:
  - question: "How do I redact a screenshot before sharing it?"
    answer: "Crop out what you do not need, cover any secrets with a solid box that is flattened into the image, check the browser tabs, menu bar and notifications, then export a PNG and zoom in to check."
  - question: "What counts as sensitive information in a screenshot?"
    answer: "Passwords, API keys and tokens, card and account numbers, email addresses, phone numbers, customer names, internal URLs, and anything in notification banners or open tabs that you did not mean to include."
  - question: "Can I redact a screenshot on a Mac without installing anything?"
    answer: "Yes. Preview can cover areas with filled shapes and export a flat PNG. For blur, pixelate and one-click solid redaction, the free browser editor on this site works without an install and uploads nothing."
  - question: "Is it enough to crop the screenshot?"
    answer: "Cropping is the safest redaction when the private part is at the edge, because the pixels are removed. For things in the middle of the image, cover them with a solid box."
  - question: "How do I stop notifications appearing in screenshots?"
    answer: "Turn on Do Not Disturb from Control Center before you capture or record. Notifications stay quiet until you turn it off."
sources:
  - title: "Apple Preview User Guide: Annotate an image"
    url: "https://support.apple.com/guide/preview/annotate-an-image-prvw1501/mac"
  - title: "Apple Mac User Guide: Turn a Focus on or off"
    url: "https://support.apple.com/guide/mac-help/turn-a-focus-on-or-off-mchl999b7c1a/mac"
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
seoTitle: "Redact a Screenshot Before Sharing: A Safe Routine"
seoDescription: "Redact sensitive information in a screenshot the safe way: capture less, crop, cover secrets with flattened boxes, check tabs and notifications, then export."
draft: false
---
To redact sensitive information in a screenshot, **capture only what you need**, **crop** away the edges, cover anything secret with a **solid box that is flattened into the image**, then **export a PNG** and zoom in to check it. Blur and pixelate are fine for faces and background clutter, but not for passwords, keys or numbers.

On a Mac, Preview can do a basic version of this; the free [browser screenshot editor](/editor) adds one-click redact, blur and pixelate without uploading anything.

Most leaks are not in the part you meant to hide. They are in the parts you did not notice.

## What should I look for before sharing a screenshot?

Run your eye over the whole image, not just the middle:

| Where | What leaks |
| --- | --- |
| Browser tabs and bookmarks bar | Other sites you have open, internal tools, account names |
| Address bar | URLs with tokens, IDs or search terms |
| Menu bar | Your name, other apps, Wi-Fi network, VPN status |
| Notification banners | Message previews, sender names, codes |
| Sidebars and lists | Customer names, email addresses, file names |
| Code and terminals | API keys, environment variables, hostnames |
| Reflections and photos | Faces, whiteboards, screens in the background |

The easiest fix for most of these is to never capture them: use a **window** or **area** capture instead of the full screen.

## How do I redact a screenshot step by step?

1. **Turn on Do Not Disturb** before capturing, from **Control Center → Focus**, so no banner appears mid-capture.
2. **Capture the smallest useful area.** <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> to drag over an area, or add <kbd>Space</kbd> to capture one window.
3. **Crop** anything at the edges you do not need. Cropped pixels are gone.
4. **Cover secrets with a solid box.** Passwords, tokens, card and account numbers, recovery codes.
5. **Blur or pixelate** things that are private but not secret, such as faces or unrelated windows.
6. **Export a flat PNG or JPG.** Do not share an editable project, a PDF with annotations or a layered design file.
7. **Zoom in to 200%** on the exported file and check every redacted area and every edge.

Why step 4 says a solid box rather than blur is explained in [pixelate vs blur vs black box](/blog/pixelate-vs-blur-vs-black-box).

## How do I redact a screenshot on a Mac with Preview?

Preview cannot blur, but it can cover:

1. Open the screenshot in Preview and click **Show Markup Toolbar**.
2. Click **Shapes**, choose a rectangle, and drag it over the private area.
3. Click **Fill Color** and pick black or any solid color. Also set **Border Color** to match.
4. Repeat for each area.
5. Choose **File → Export**, pick **PNG**, and save a new file. The export is a flat image.

Do not rely on the **Highlight** tool for redaction: it is designed to be see-through.

## How do I redact faster with the free editor?

1. Open the [screenshot editor](/editor) and drop in, open or paste your screenshot.
2. Press <kbd>D</kbd> for **Redact** and drag over each secret. Press <kbd>B</kbd> for **Blur** or <kbd>X</kbd> for **Pixelate** on less sensitive areas.
3. Press <kbd>C</kbd> to **Crop**.
4. Click **Export PNG**.

The editor runs entirely in your browser. Redactions are written into the exported pixels, so the PNG has nothing underneath to recover. On your own Mac, [Screenmac](/download) opens the same editor straight after every capture, with no account and no uploads.

## What about the file itself?

A redacted image can still carry information in the file:

- **The file name** may include a customer, project or ticket name. Rename it before sending.
- **Metadata** in the file. Mac screenshots carry some, such as a "Screenshot" comment in the EXIF data and Finder attributes. Our guide to [removing metadata from a screenshot](/blog/remove-metadata-from-screenshot-mac) shows what is there and how to strip it.
- **Thumbnails and previews.** If you edited a copy, make sure you attach the redacted one.

## How do I make redaction a habit?

Redaction fails when it is rushed. A few habits help:

- Keep **Do Not Disturb** on while you work on anything you will share.
- Use **separate browser profiles** for work and personal accounts, so captures do not mix them.
- Use **test data** in demos and tutorials instead of real customer records.
- Before sending, **look at the whole image once more**, edges first.

To see where your own habits are weakest, take the [screenshot privacy check](/quiz/screenshot-privacy-check). For blurring specifically, read [how to blur part of a screenshot on Mac](/blog/blur-part-of-screenshot-mac).
