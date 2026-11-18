---
title: "Pixelate, Blur or Black Box: Which Redaction Is Safe?"
slug: pixelate-vs-blur-vs-black-box
description: "A solid box flattened into the image is the only redaction that leaves nothing of the original. When blur and pixelate are fine, when they can be reversed, and why a black box in a layered file can leak."
publishedAt: 2026-11-17
type: explainer
tags:
  - annotation-privacy
primaryApp: screenmac
feature: quiz/screenshot-privacy-check
faq:
  - question: "Is pixelating text safe?"
    answer: "Not for short or predictable text. Pixelation keeps an average of the original pixels, and tools such as Depix show that plain pixelated text can sometimes be recovered. Use a solid box for passwords, keys and numbers."
  - question: "Can blurred text be unblurred?"
    answer: "A light blur keeps enough information that text can sometimes be guessed or partly restored, especially when the font and likely words are known. A heavy blur over a large area is much harder to reverse, but a solid box is safer still."
  - question: "Why did my black box not hide the text?"
    answer: "The box was probably a separate object on top of the image, in a PDF or layered file. Anyone can move or delete it. Flatten the image to a PNG or JPG before sharing."
  - question: "What is the safest way to redact a screenshot?"
    answer: "Crop the private part out if you can. If not, cover it with a solid box that is written into the pixels, export a flat PNG, and zoom in on the result to check."
  - question: "Does Screenmac flatten redactions?"
    answer: "Yes. In the Screenmac app and the free browser editor, redact, blur and pixelate are written into the exported pixels rather than kept as removable layers."
sources:
  - title: "Depix: recovering plaintext from pixelized screenshots (proof of concept)"
    url: "https://github.com/spipm/Depix"
  - title: "Apple Preview User Guide: Annotate an image"
    url: "https://support.apple.com/guide/preview/annotate-an-image-prvw1501/mac"
seoTitle: "Pixelate vs Blur vs Black Box: Safe Screenshot Redaction"
seoDescription: "Is blurring or pixelating text safe? Why a solid box flattened into the pixels is the only sure redaction, and how layered files can leak what you hid."
draft: false
---
The only redaction that leaves nothing of the original is a **solid box written into the image's pixels**, or cropping the content out. **Blur** and **pixelate** make text unreadable at a glance, but they keep an average of what was there, and short, predictable text such as a PIN, a name or an email can sometimes be recovered.

A black box is only safe if it is **flattened**: a box drawn as a separate object in a PDF or layered file can simply be moved or deleted.

## What is the difference between blur, pixelate and a black box?

| Method | What happens to the pixels | Safe for |
| --- | --- | --- |
| Solid box (redact) | Replaced with one flat color. The original is gone | Anything, including passwords and keys |
| Pixelate | Grouped into blocks, each the average color of the pixels it covers | Faces, photos, busy areas; not short text |
| Blur | Each pixel mixed with its neighbors | De-emphasizing, backgrounds; not short text |
| Crop | Removed from the image entirely | Anything at the edges |

The key word is **average**. Blur and pixelate do not delete information; they spread it out. When the hidden content is something with few possibilities (a four-digit code, a name from a known list, a word in a known font), an attacker can try candidates, apply the same blur or pixelation, and see which result matches.

## Can pixelated text really be recovered?

Sometimes. Depix, an open-source proof of concept, describes itself as a technique "to recover plaintext from pixelized screenshots". It works best in the conditions screenshots often provide: crisp, computer-rendered text in a standard font, pixelated with a simple block filter.

That does not mean every pixelated area can be read. Large blocks over long, random strings are much harder. But you rarely know who will look at a screenshot, or how motivated they are, so for anything that grants access (passwords, API keys, tokens, card numbers, recovery codes) treat pixelation as not enough.

## Is blur safer than pixelation?

A strong blur over a generous area destroys more detail than a light one, but the principle is the same: the result depends on the original. Light blurs over large text are the weakest, since the letter shapes still show through. If you can read even a few characters when you zoom in, others can too.

Blur is the right tool when you want to keep the overall look of an image while hiding detail that is not secret: background windows, faces in a photo, a cluttered sidebar.

## How can a black box leak what it covers?

This is the most common failure, and it has nothing to do with the box's color. It happens when the box is **an object on top of the image** rather than part of it:

- **PDFs with annotations.** A rectangle added as an annotation or a shape sits over the text. The text underneath is still in the file, often selectable and copyable.
- **Layered design files.** A Figma, Keynote, Sketch or similar file keeps each shape as its own layer. Anyone with the file can hide the layer.
- **Editable image formats.** Some editors save their own project formats that keep annotations separate so you can edit them later.
- **Highlighter instead of fill.** A semi-transparent highlight or a dark but not opaque fill can let the text show through when contrast is adjusted.

The fix is to **flatten**: export a PNG or JPG, which has no layers. In Preview, draw a shape with a solid **Fill Color**, then choose **File → Export** to save a flat copy.

## How do I redact safely, step by step?

1. **Capture less.** Take a window or area capture, not the whole screen, so less private material is in the image at all.
2. **Crop** out anything at the edges you do not need.
3. **Cover secrets with a solid box** that is written into the pixels. The free [browser screenshot editor](/editor) does this with its Redact tool and exports a flat PNG, with nothing uploaded.
4. **Use blur or pixelate** only for things that are private but not secret, such as faces or background windows.
5. **Export a flat image** (PNG or JPG), never the editable project.
6. **Zoom in to 200% or more** on the exported file and check every redacted area.

[Screenmac](/download), the free Mac app behind the editor, does the same after each capture: redact, blur and pixelate are flattened into the exported pixels.

## Which should I use?

| Situation | Use |
| --- | --- |
| Password, token, API key, card or account number | Solid box, or crop |
| Customer names and emails in a support screenshot | Solid box |
| Faces in a photo or video thumbnail | Blur or strong pixelate |
| Unrelated windows in the background | Blur |
| Anything in a PDF or layered file | Flatten first, then share |

For practical steps on a Mac, see [how to blur part of a screenshot](/blog/blur-part-of-screenshot-mac) and [how to redact sensitive information](/blog/redact-sensitive-info-screenshot). To check your own habits, take the six-question [screenshot privacy check](/quiz/screenshot-privacy-check).
