---
title: "How to Take a Full-Page Screenshot in a Mac Browser"
slug: full-page-screenshot-browser-mac
description: "Capture an entire web page on a Mac without an app: Chrome's Capture full size screenshot in DevTools, or Safari's Export as PDF. What each produces, the pages they struggle with, and how to share the result."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
faq:
  - question: "How do I screenshot a whole web page in Chrome on a Mac?"
    answer: "Press Option-Command-I to open Developer Tools, turn on the device toolbar, open its More options menu and choose Capture full size screenshot. Chrome downloads a PNG of the whole page."
  - question: "Can Safari take a full-page screenshot?"
    answer: "Safari has no full-page image capture in its menus, but File, Export as PDF saves the page as a PDF. You can open that in Preview and export it as an image if you need one."
  - question: "Why is my full-page screenshot cut off or has blank areas?"
    answer: "Pages that load content as you scroll, or that scroll inside a fixed panel, often render incompletely. Scroll to the bottom first so everything loads, then capture again."
  - question: "Do I need an extension for full-page screenshots?"
    answer: "No for Chrome, which has the command in DevTools. Extensions and capture apps are more convenient if you do it often, but each extension you add can see the pages you visit."
sources:
  - title: "Chrome for Developers: Simulate mobile devices with device mode (screenshots)"
    url: "https://developer.chrome.com/docs/devtools/device-mode"
  - title: "Apple Safari User Guide: Save webpages"
    url: "https://support.apple.com/guide/safari/ibrw1089/mac"
  - title: "Apple Preview User Guide: Convert image file types"
    url: "https://support.apple.com/guide/preview/convert-image-file-types-prvw1012/mac"
seoTitle: "Full-Page Screenshot in Chrome or Safari on Mac"
seoDescription: "Screenshot an entire web page on a Mac without an app: Chrome's Capture full size screenshot in DevTools, or Safari's Export as PDF. Steps and fixes."
draft: true
---
To take a full-page screenshot in a browser on a Mac, use **Chrome's** built-in developer tools: press **Option-Command-I**, turn on the **device toolbar**, open its **More options** menu and choose **Capture full size screenshot**. Chrome downloads a PNG of the whole page, top to bottom. In **Safari**, choose **File → Export as PDF** to save the full page as a PDF instead of an image. Neither needs an extension.

This guide is about web pages only. For long chats, documents and other apps, see [how to take a scrolling screenshot on Mac](/blog/scrolling-screenshot-mac).

## How do I capture a full page in Chrome?

Google documents the full-size capture in DevTools' device mode:

1. Open the page in Chrome and scroll to the bottom once, so anything that loads on scroll has loaded.
2. Press <kbd>Option</kbd>-<kbd>Command</kbd>-<kbd>I</kbd> to open Developer Tools.
3. Click **Toggle device toolbar** (the phone and tablet icon at the top left of DevTools).
4. In the dimensions bar above the page, choose a device or type a width. For a desktop-looking capture, enter a width such as 1440.
5. Open the **More options** menu (three dots) in that bar.
6. Choose **Capture full size screenshot**.

The same menu has **Capture screenshot** for just the visible area. If you want the device's frame around the capture, turn on **Show device frame** first, which Google's documentation also mentions.

## How do I save a full page in Safari?

Safari's File menu has **Export as PDF**:

1. Open the page in Safari.
2. Choose **File → Export as PDF**.
3. Name the file, choose where to save it and click **Save**.

The PDF keeps the page's text selectable, which is useful for archiving articles and receipts. If you need an image rather than a PDF, open it in Preview, choose **File → Export**, and pick PNG or JPEG. Apple's Safari guide also covers **File → Save As** with **Web Archive**, which keeps the page with its images for viewing in Safari later; that is not an image file either.

## Which method should I use?

| You need | Use | You get |
| --- | --- | --- |
| A single image of the whole page | Chrome, Capture full size screenshot | PNG |
| A mobile-width capture | Chrome device toolbar with a phone selected | PNG at that width |
| An archive with selectable text | Safari, Export as PDF | PDF |
| The page to view offline in Safari | Safari, Save As, Web Archive | .webarchive |
| Just what is on screen | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> | PNG |

## Why is my full-page capture broken?

| Problem | Why | Fix |
| --- | --- | --- |
| Blank areas or missing images | Images load only when scrolled into view | Scroll to the bottom first, then capture |
| A header repeated or stuck in the middle | Sticky elements are drawn in place | Accept it, or capture the parts separately |
| Only the first screen | The page scrolls inside a panel, not the window | Use a scrolling capture app instead |
| Very wide or tiny text | The device toolbar width is too large | Set a sensible width such as 1280 or 1440 |
| Huge file | Long pages at Retina resolution are big | Resize or convert with the [format converter](/tools/image-format-converter) |

Web apps such as dashboards and email clients often scroll inside their own panels, which is exactly the case these browser tools handle badly.

## What should I check before sharing a full-page capture?

A whole page contains far more than you look at: comment sections with names, account details in a footer, a logged-in avatar, tracking codes in links. Scroll through the whole image before sending it. To hide parts of it, open it in the free [screenshot editor](/editor), which blurs, pixelates or blocks out areas and exports a new PNG without uploading anything. Our guide to [redacting sensitive information](/blog/redact-sensitive-info-screenshot) lists what to look for.

## Is there an easier way if I do this often?

Capture apps with scrolling capture handle pages and other apps in one shortcut; CleanShot X, Shottr and Snagit all list it on their own sites. Screenmac does not have scrolling capture (it is planned), but it is handy for the visible part of a page that you want to annotate and redact. See the [best screenshot apps for Mac](/blog/best-screenshot-apps-mac-2027) for a comparison.
