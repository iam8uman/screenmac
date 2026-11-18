---
title: "Where Do Screenshots Go on a Mac?"
slug: where-do-screenshots-go-mac
description: "Mac screenshots save to the desktop by default, named Screenshot with the date and time. How to find them, check your current save folder, and track down captures that went to the clipboard."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
feature: tools/mac-screenshot-shortcuts
faq:
  - question: "Where are screenshots saved on a Mac by default?"
    answer: "On the desktop. Each file is a PNG whose name starts with Screenshot followed by the date and time it was taken."
  - question: "Why can't I find my screenshot on the desktop?"
    answer: "Either the save location was changed in the Screenshot app's Options menu, the capture went to the clipboard because Control was held, or the desktop is synced to iCloud Drive and shows the file there."
  - question: "How do I see which folder my screenshots go to?"
    answer: "Press Shift-Command-5 and click Options. The ticked item under Save to is the current location."
  - question: "Where do screen recordings go?"
    answer: "Also to the desktop by default, as .mov files whose names start with Screen Recording and the date and time."
  - question: "Do Mac screenshots go into the Photos app?"
    answer: "No. macOS saves them as files in a folder, not in your Photos library, unless you drag them into Photos yourself."
sources:
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
seoTitle: "Where Do Screenshots Go on Mac? Find Every Capture"
seoDescription: "Mac screenshots save to the desktop by default as PNG files named Screenshot plus the date. How to check your save folder and find missing captures."
draft: false
---
Screenshots on a Mac are saved to the **desktop** by default, as PNG files whose names start with **Screenshot** followed by the date and time. If you have changed the save location, they go to the folder ticked under **Save to** in the Screenshot app's Options menu (press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd> to see it). Captures taken with Control held go to the clipboard and are never saved as a file.

Here is how to check where yours are going and find any that seem to have vanished.

## How do I check where my screenshots are saved?

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>. The Screenshot toolbar appears at the bottom of the screen.
2. Click **Options**.
3. Look under **Save to**. The item with a tick is where every new screenshot goes: Desktop, Documents, Clipboard, Mail, Messages, Preview or a folder you picked with **Other Location**.
4. Press **Esc** to close the toolbar without taking a screenshot.

The choice applies to the keyboard shortcuts too, not just to captures taken from the toolbar. To change it, follow the steps in [how to change where screenshots are saved](/blog/change-screenshot-location-mac).

## How do I find a screenshot I just took?

- **Look for the thumbnail.** After each capture a small preview floats in the corner of the screen for a few seconds. Drag it anywhere to put the file there, or click it to open it.
- **Search for it.** Press <kbd>Command</kbd>-<kbd>Space</kbd> and type `Screenshot`. Spotlight lists recent captures by name.
- **Sort by date.** Open the save folder in Finder, choose **View → as List** and click the **Date Added** column.
- **Check Recents.** The Recents item in the Finder sidebar lists files you created recently, including captures.

## What are Mac screenshots named?

Apple's guide says screenshot file names start with "Screenshot" and screen recording names start with "Screen Recording", each followed by the date and time. For example, a capture taken at 9:05 in the morning might be called `Screenshot 2026-11-17 at 09.05.07.png`. Very old versions of macOS used "Screen Shot" with a space instead.

Screenshots are saved as PNG and recordings as MOV. On supported Macs with macOS Tahoe 26 or later, the Options menu also offers an HDR capture format, which saves screenshots as HEIF instead of PNG.

## Why are my screenshots not on the desktop?

| What you see | Likely cause | Fix |
| --- | --- | --- |
| No file anywhere, but paste works | Control was held, so it went to the clipboard | Paste with <kbd>Command</kbd>-<kbd>V</kbd>, or take it again without Control |
| Files appear in another folder | Save to was changed | Check Options → Save to |
| Desktop looks empty but Finder shows files | Desktop items are hidden or synced | Open Finder → Desktop, or check iCloud Drive → Desktop |
| A screenshot opened in Preview or Mail | Save to is set to an app | Save from that app, or change Save to |
| Nothing happens at all | The shortcut is not firing | See [Mac screenshot not working](/blog/mac-screenshot-not-working) |

If you use iCloud Drive with **Desktop & Documents Folders** turned on, your desktop lives in iCloud. The screenshot is still on the desktop, but it may take a moment to appear on your other Macs.

## Where do screen recordings and app captures go?

Recordings made with <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd> follow the same **Save to** setting and land on the desktop by default as `.mov` files. QuickTime Player recordings open in a QuickTime window and you choose where to save them.

Third-party apps have their own folders. Screenmac, for example, keeps a local capture history on your Mac and lets you copy, save or drag each capture from its Quick Access preview, so you decide per capture whether a file is created at all. Nothing is uploaded.

## How do I stop screenshots cluttering the desktop?

Two habits keep the desktop clear:

1. **Copy instead of saving** when the capture is going straight into a chat or document: add <kbd>Control</kbd> to any shortcut. The free [screenshot shortcut finder](/tools/mac-screenshot-shortcuts) shows the exact keys.
2. **Point Save to at a dedicated folder**, such as a Screenshots folder inside Pictures or Documents, so captures collect in one place you can sort and clean out.

For every capture type and option, see [how to take a screenshot on a Mac](/blog/how-to-screenshot-on-mac). More answers are in the [screenshot guides](/blog/topics/screenshots).
