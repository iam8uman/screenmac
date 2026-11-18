---
title: "How to Take a Scrolling Screenshot on Mac"
slug: scrolling-screenshot-mac
description: "macOS has no built-in scrolling screenshot. Here is what works instead: Chrome's full-size capture for web pages, and apps such as Shottr, CleanShot X and Snagit for any window."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
feature: quiz/which-mac-screenshot-tool
faq:
  - question: "Can a Mac take a scrolling screenshot without an app?"
    answer: "Not of any window. The built-in Screenshot tool captures only what is visible on screen. For web pages, Chrome's developer tools can capture a full-size screenshot of the whole page without installing anything."
  - question: "What is the best free scrolling screenshot app for Mac?"
    answer: "Shottr's site says it can capture scrolling content in any app and that you can name your price, including $0. CleanShot X and Snagit also do scrolling capture but are paid."
  - question: "Does Screenmac do scrolling screenshots?"
    answer: "No. Scrolling capture is on Screenmac's planned list and not built. If you need it today, use one of the apps in this guide."
  - question: "How do I take a full-page screenshot in Chrome on a Mac?"
    answer: "Open Developer Tools, turn on the device toolbar, open its More options menu and choose Capture full size screenshot. Chrome downloads a PNG of the whole page."
sources:
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
  - title: "Chrome for Developers: Simulate mobile devices with device mode (screenshots)"
    url: "https://developer.chrome.com/docs/devtools/device-mode"
  - title: "Shottr: features and pricing"
    url: "https://shottr.cc/"
  - title: "CleanShot X: features"
    url: "https://cleanshot.com/features"
  - title: "CleanShot X: pricing"
    url: "https://cleanshot.com/pricing"
  - title: "TechSmith Snagit"
    url: "https://www.techsmith.com/snagit/"
seoTitle: "Scrolling Screenshot on Mac: What Actually Works"
seoDescription: "macOS can't take scrolling screenshots on its own. Use Chrome's full-size capture for web pages, or Shottr, CleanShot X or Snagit for any scrolling window."
draft: false
---
macOS cannot take a scrolling screenshot on its own: Shift-Command-3, 4 and 5 capture only what is visible on screen. For a **web page**, Chrome's developer tools can save a full-size screenshot of the whole page for free. For **any scrolling window** (chats, documents, long settings panes), you need a third-party app such as Shottr, CleanShot X or Snagit, which scroll and stitch the image for you.

## Can macOS take a scrolling screenshot by itself?

No. Apple's screenshot guide covers the entire screen, a selected portion and a window. None of them scroll. If the content is taller than your display, the built-in tool only gets the part you can see.

The closest built-in workaround is to make more of the content visible:

- Maximize the window and hide the Dock.
- Zoom the page out (<kbd>Command</kbd>-<kbd>-</kbd> in most browsers and documents) so more fits, then capture with <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd>.

That works for content a little taller than the screen. Beyond that, the text gets too small to read and you need a real scrolling capture.

## How do I capture a full web page for free?

Chrome has a full-page capture built into its developer tools. Google's documentation places it in the device toolbar's menu:

1. Open the page in Chrome.
2. Press <kbd>Option</kbd>-<kbd>Command</kbd>-<kbd>I</kbd> to open Developer Tools.
3. Click the **Toggle device toolbar** button (the phone and tablet icon) to turn on device mode.
4. Set the width you want in the dimensions bar, or pick a device.
5. Open the **More options** menu in that bar and choose **Capture full size screenshot**.

Chrome saves a PNG of the entire page. It works best on ordinary scrolling pages. Pages that scroll inside a fixed panel, or that load content as you scroll, may come out cut short or with blank areas, because the tool renders the page rather than scrolling it like a person would.

## Which apps take scrolling screenshots on a Mac?

These three say on their own sites that they capture scrolling content. Prices and requirements were checked on each site on the date of this guide.

| App | Scrolling capture | Price | Notes |
| --- | --- | --- | --- |
| Shottr | Any app, any window (default max height 20,000 px, can be raised) | Name your price, $0 allowed | Screenshots only, also OCR, pixel ruler and color picker |
| CleanShot X | Scrolling capture, vertical and horizontal | $35 one-time with a year of updates | Also recording, cloud links, OCR, annotation |
| Snagit | Long web pages, documents and spreadsheets | $39 per year | Mac and Windows, recording with webcam |

How scrolling capture works in these apps: you select the area, start the capture, and the app either scrolls for you or asks you to scroll, then stitches the frames into one tall image. Expect to retry on pages with sticky headers or animated content, which can repeat or tear where frames join.

## Which option should I use?

| You need to capture | Use |
| --- | --- |
| One long web page, now and then | Chrome's Capture full size screenshot |
| Chats, docs or settings panes, for free | Shottr |
| Scrolling plus recording, cloud links and a full editor | CleanShot X |
| Scrolling on both Mac and Windows | Snagit |
| A page just slightly taller than the screen | Zoom out, then Shift-Command-4 |

Not sure which kind of app you need overall? The [screenshot tool quiz](/quiz/which-mac-screenshot-tool) asks six questions, including whether you need scrolling capture.

## Does Screenmac take scrolling screenshots?

No. Screenmac captures an area, a window or a whole display, with annotation and redaction, and scrolling capture is listed as planned, not built. If long captures are a regular part of your work, one of the apps above is the better pick today. If you mostly capture what is on screen and need to blur or mark it up, [Screenmac](/download) is free, and you can try its editor in the browser at [/editor](/editor) first.

## What should I check before sharing a long capture?

Long captures pick up far more than a single screen: names in a chat history, account numbers further down a page, email addresses in a thread. Scroll through the whole image before you send it and hide anything private. Our guide to [redacting sensitive information in a screenshot](/blog/redact-sensitive-info-screenshot) explains which methods actually remove it.

For all the standard capture methods, see [how to take a screenshot on a Mac](/blog/how-to-screenshot-on-mac).
