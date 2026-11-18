---
title: "How to Blur Part of a Screenshot on Mac"
slug: blur-part-of-screenshot-mac
description: "macOS Markup and Preview cannot blur. Here is how to blur or pixelate part of a screenshot on a Mac with a free browser editor or a capture app, and when a solid box is the safer choice."
publishedAt: 2026-11-17
type: how-to
tags:
  - annotation-privacy
  - how-to
primaryApp: screenmac
feature: editor
faq:
  - question: "Can you blur part of a screenshot on a Mac without an app?"
    answer: "Not with the built-in tools. Markup and Preview offer shapes, highlights and a magnifier, but no blur or pixelate. A free browser editor, such as the one on this site, adds blur without installing anything."
  - question: "Is blurring enough to hide a password or token?"
    answer: "For short, predictable text, not always. Light blur and coarse pixelation can sometimes be reversed. For passwords, keys and card numbers, cover them with a solid box that is flattened into the image, or crop them out."
  - question: "How do I blur a screenshot in Preview?"
    answer: "Preview has no blur tool. You can cover an area with a filled shape from the Markup toolbar, which hides it visually, then export a flattened copy as PNG or JPG."
  - question: "Will people be able to remove my blur?"
    answer: "Not if the blur is written into the pixels of the exported image. It can be removed if it sits on a separate layer in an editable file, such as a PDF or a design file."
  - question: "Does Screenmac blur screenshots?"
    answer: "Yes. Its editor has blur, pixelate and redact, and all three are flattened into the exported pixels. The same editor runs free in the browser at /editor."
sources:
  - title: "Apple Preview User Guide: Annotate an image"
    url: "https://support.apple.com/guide/preview/annotate-an-image-prvw1501/mac"
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
seoTitle: "How to Blur Part of a Screenshot on Mac (Free)"
seoDescription: "Markup can't blur on a Mac. Blur or pixelate part of a screenshot free in your browser or in a capture app, and learn when a solid box is the safer choice."
draft: false
---
To blur part of a screenshot on a Mac, open it in an editor that has a real blur tool, drag over the area, and export a new PNG. The built-in **Markup** and **Preview** tools cannot blur or pixelate; they can only draw shapes on top. The free [browser screenshot editor](/editor) on this site blurs, pixelates or blocks out any area and writes the change into the exported pixels, with nothing uploaded.

For passwords, tokens and card numbers, use a solid box rather than blur. The reasons are below.

## Why can't I blur in Markup or Preview?

Apple's Markup toolbar in Preview offers selection tools, sketch, draw, shapes, highlight, a zoom lens, text, signatures, color and size adjustments, rotate and crop. There is no blur or pixelate tool. The Markup window that opens from the screenshot thumbnail has a similar set.

What you can do with them:

1. Open the screenshot in Preview and click **Show Markup Toolbar**.
2. Choose **Shapes**, pick a rectangle, and drag it over the private area.
3. Set **Fill Color** to a solid color so nothing shows through.
4. Choose **File → Export** and save as PNG or JPG, which flattens the shape into the image.

That hides the content, but it is a box, not a blur.

## How do I blur part of a screenshot for free in the browser?

1. Open the free [screenshot editor](/editor).
2. Click **Open image**, drop your screenshot onto the page, or paste it with <kbd>Command</kbd>-<kbd>V</kbd>. It stays in your browser.
3. Choose **Blur** (shortcut <kbd>B</kbd>) and drag over the area. Use **Pixelate** (<kbd>X</kbd>) for a mosaic look, or **Redact** (<kbd>D</kbd>) for a solid block.
4. Add arrows or text if you like.
5. Click **Export PNG**, or copy it to the clipboard.

The exported PNG is a fresh image: blur, pixelate and redact are computed from the image and written into its pixels, so there is no hidden layer underneath to remove.

## How do I blur screenshots right after taking them?

If you blur screenshots several times a day, opening a browser tab each time gets old. A capture app with its own editor saves the step.

[Screenmac](/download) is a free native Mac app that opens each capture in an editor with blur, pixelate and redact (plus arrows, shapes, text and numbered steps), using its own shortcuts so the built-in ones keep working:

| Capture | Screenmac shortcut |
| --- | --- |
| Area | <kbd>Option</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> |
| Window | <kbd>Option</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>2</kbd> |
| Full screen | <kbd>Option</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>3</kbd> |

It requires macOS 14 Sonoma or later. Other capture apps, such as CleanShot X and Shottr, also include blur or pixelate tools; our [best screenshot apps for Mac](/blog/best-screenshot-apps-mac-2027) roundup compares them.

## Should I blur, pixelate or use a black box?

| What you are hiding | Best choice | Why |
| --- | --- | --- |
| Passwords, API keys, card numbers | Solid box (redact) | Nothing of the original survives |
| Names and email addresses in a list | Solid box or strong pixelate | Short, predictable text is the easiest to guess |
| Faces or photos in the background | Blur | Looks natural, and detail is not readable |
| A busy area you want to de-emphasize | Light blur | Keeps context, draws the eye elsewhere |

Blur and pixelate are fine for making something unreadable at a glance, but research tools such as Depix, a proof of concept for recovering text from pixelated screenshots, show that coarse pixelation of plain text can sometimes be undone. Our explainer on [pixelate vs blur vs black box](/blog/pixelate-vs-blur-vs-black-box) goes through when each one is safe.

## How do I check the blur actually worked?

- **Zoom in** on the exported file to 200% or more. If you can read any characters, blur harder or switch to a solid box.
- **Check the format.** Share PNG or JPG. Avoid sending editable files (PDFs with annotations, design files with layers) unless you have flattened them.
- **Look at the rest of the image.** Browser tabs, the menu bar, notification banners and file names often show more than the part you blurred.

If you want a full checklist before sharing, read [how to redact sensitive information in a screenshot](/blog/redact-sensitive-info-screenshot), or take the [screenshot privacy check](/quiz/screenshot-privacy-check) to spot gaps in your habits.
