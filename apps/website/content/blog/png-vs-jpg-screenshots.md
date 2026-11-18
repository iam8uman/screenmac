---
title: "PNG vs JPG for Screenshots: Which Format to Use"
slug: png-vs-jpg-screenshots
description: "PNG is the right format for most screenshots: lossless, sharp text, often smaller than JPG for interfaces. When JPG or WebP is better, with a real size test on three interface screenshots."
publishedAt: 2026-11-17
type: explainer
tags:
  - screenshots
primaryApp: screenmac
feature: tools/image-format-converter
faq:
  - question: "Is PNG or JPG better for screenshots?"
    answer: "PNG, for screenshots of apps, websites, text and code. It is lossless, keeps edges sharp and supports transparency. JPG suits screenshots that are mostly photos or video frames."
  - question: "Why are PNG screenshots sometimes smaller than JPG?"
    answer: "PNG compresses large areas of flat color very well, and interfaces are mostly flat color. JPG is designed for photographs and spends data on sharp edges, so it can come out larger for UI screenshots."
  - question: "Does JPG make text blurry?"
    answer: "It can. JPG is lossy and adds faint halos around sharp edges, which shows on small text, especially at lower quality settings."
  - question: "What about WebP?"
    answer: "WebP supports both lossless and lossy compression and is widely supported by browsers. It is a good choice for screenshots on websites, less so for sending to people whose apps may not open it."
  - question: "Why does macOS save screenshots as PNG?"
    answer: "Apple's guide says screenshots are saved as PNG files. On macOS Tahoe 26 or later, the HDR capture format saves HEIF instead on supported Macs."
sources:
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
seoTitle: "PNG vs JPG for Screenshots: Size, Sharpness, Our Test"
seoDescription: "PNG or JPG for screenshots? PNG keeps text sharp and is often smaller for interfaces. Our size test on three UI screenshots, and when JPG or WebP wins."
draft: true
---
For most screenshots, **PNG** is the better format: it is lossless, keeps text and interface edges sharp, supports transparency and, for screens made of flat colors, is often **smaller** than JPG. Use **JPG** when the screenshot is mostly a photo or a video frame, where it is much more efficient. **WebP** is a good middle ground for screenshots that go on a website. macOS saves screenshots as PNG by default, which is the right choice.

## What is the difference between PNG and JPG?

| | PNG | JPG |
| --- | --- | --- |
| Compression | Lossless: every pixel is kept exactly | Lossy: detail is thrown away to save space |
| Best at | Flat colors, sharp edges, text, line art | Photos, gradients, natural images |
| Transparency | Yes | No |
| Re-saving | No quality loss | Each save can lose a little more |
| Text | Crisp | Faint halos, worse at low quality |

Screenshots of apps and websites are mostly flat backgrounds, sharp text and thin lines, which is exactly what PNG handles well.

## Is JPG really smaller for screenshots?

Not necessarily. We tested three 1600 × 1000 PNG screenshots of app interfaces (a code editor, a design tool and a metrics dashboard), converting each with macOS's built-in `sips` tool:

| Screenshot | PNG | JPEG quality 80 | JPEG quality 60 |
| --- | --- | --- | --- |
| Code editor | 169 KB | 178 KB | 134 KB |
| Design tool | 125 KB | 133 KB | 104 KB |
| Metrics dashboard | 98 KB | 135 KB | 104 KB |

At quality 80 all three JPEGs were larger than the PNGs. At quality 60, two were smaller by around a fifth and one was still larger, and small text had started to soften. For interface screenshots, converting to JPG often saves little or nothing while making text worse.

The picture changes for screenshots of photos, video or gradients, where JPG is typically far smaller than PNG.

## When should I use JPG?

- The screenshot is mostly a **photo**, a **video frame** or a **game** scene.
- A form, website or tool **only accepts JPG**.
- You have **checked** that the JPG is actually smaller and the text still reads well.

If you need the file smaller but the screenshot is an interface, reduce its **dimensions** instead. Retina screenshots are usually twice the width and height of what you saw, so halving them cuts the pixel count to a quarter.

## Where does WebP fit?

WebP can be lossless or lossy and is supported by current browsers, so it suits screenshots in blog posts, documentation sites and web apps. It is less suited to email attachments or documents, where the recipient's app may not open it. The free [screenshot format converter](/tools/image-format-converter) saves PNG, JPG or WebP in your browser, shows the new size next to the old one, and strips the original's metadata.

## What about HEIF on newer Macs?

On macOS Tahoe 26 or later, supported Macs offer an **HDR** capture format that saves screenshots as **HEIF**. It keeps extra brightness for HDR displays, but looks the same as SDR on standard screens and opens in fewer places. For screenshots you share, keep **SDR**, which saves PNG. See [how to change the screenshot file format](/blog/change-screenshot-format-mac).

## Which format should I use?

| Screenshot of | Use |
| --- | --- |
| Code, terminal, settings, forms | PNG |
| Websites and app interfaces | PNG, or WebP for the web |
| Photos, video, games | JPG |
| Window with transparent shadow | PNG |
| Anything you will edit again | PNG |
| Upload that only accepts JPG | JPG at high quality |

To convert existing files, see [how to convert a screenshot from PNG to JPG](/blog/convert-screenshot-png-to-jpg-mac). The free [screenshot editor](/editor) and [Screenmac](/download) both export PNG, so redactions and arrows stay crisp. For capturing in the first place, read [how to take a screenshot on a Mac](/blog/how-to-screenshot-on-mac).
