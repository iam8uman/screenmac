---
title: "Best Screen Recording Settings for Tutorials on Mac"
slug: best-screen-recording-settings-tutorials
description: "Settings that make Mac tutorial recordings easy to follow: record a window at a readable size, SDR, show clicks, a good microphone, Do Not Disturb, then trim and export at 1080p. With the reasons for each."
publishedAt: 2026-11-17
type: how-to
tags:
  - screen-recording
primaryApp: screenmac
feature: tools/screen-recording-file-size-calculator
faq:
  - question: "What resolution should I record a tutorial at on a Mac?"
    answer: "Record a window or area at a size that will still be readable at 1080p, then export at 1080p. Recording the whole screen of a large Retina display makes text tiny when viewers watch in a smaller player."
  - question: "Should I use HDR or SDR for screen recordings?"
    answer: "SDR. Apple's guide says HDR only looks different on an HDR display, and SDR recordings use H.264, which plays almost everywhere."
  - question: "How do I make clicks visible in a tutorial?"
    answer: "Turn on Show Mouse Clicks in the Screenshot toolbar's Options, or Show Mouse Clicks in Recording in QuickTime. A circle appears around the pointer on each click."
  - question: "How long should a tutorial video be?"
    answer: "As short as the task allows. Split long processes into several short videos, one per task, which are easier to follow, update and re-record."
  - question: "What export settings should I use?"
    answer: "In QuickTime Player, File, Export As, 1080p. Choose Greater Compatibility for H.264 if viewers use many different devices, or Smaller File Size for HEVC."
sources:
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
  - title: "Apple QuickTime Player User Guide: Export movies"
    url: "https://support.apple.com/guide/quicktime-player/export-movies-qtp20e395859/mac"
  - title: "Apple Mac User Guide: Turn a Focus on or off"
    url: "https://support.apple.com/guide/mac-help/turn-a-focus-on-or-off-mchl999b7c1a/mac"
seoTitle: "Best Screen Recording Settings for Mac Tutorials"
seoDescription: "Record clearer Mac tutorials: capture a window at a readable size, use SDR, show clicks, pick a good mic, mute notifications, then export at 1080p."
draft: true
---
The best screen recording settings for a tutorial on a Mac are: record **one window or area** sized so text stays readable at **1080p**, use the **SDR** capture format, turn on **Show Mouse Clicks**, choose a **microphone close to your mouth**, switch on **Do Not Disturb**, then **trim** and **export at 1080p**. None of these needs extra software; they are all in the Screenshot toolbar (Shift-Command-5), QuickTime Player and Control Center.

## What should I set before I press Record?

| Setting | Where | Recommended | Why |
| --- | --- | --- | --- |
| What to record | Screenshot toolbar | Selected window (Tahoe 26+) or portion | Keeps focus and privacy |
| Capture format | Options (Tahoe 26+) | SDR | H.264, plays everywhere; HDR needs an HDR display |
| Show Mouse Clicks | Options | On | Viewers see where you click |
| Microphone | Options | A headset or desk mic | Clearer than the laptop mic |
| Timer | Options | 5 seconds | Time to get ready, less to trim |
| Notifications | Control Center → Focus | Do Not Disturb | No pop-ups or sounds |
| Remember Last Selection | Options | On for a series | Same frame for every clip |

## How big should the recording area be?

Viewers usually watch tutorials in a player smaller than your screen. If you record a 5K display in full, text that was readable on your screen becomes tiny.

- **Size the window** you are recording to roughly 1280 × 720 or 1440 × 900 points. On a Retina display that records at twice the pixels, which exports cleanly at 1080p.
- **Increase font sizes** in Terminal, code editors and browsers (<kbd>Command</kbd>-<kbd>+</kbd>).
- **Hide sidebars and toolbars** you will not use.
- **Keep the pointer movements slow and deliberate**, so viewers can follow.

Use **Record Selected Window** on macOS Tahoe 26 or later; on earlier versions, **Record Selected Portion** around the window. See [how to record a single window](/blog/record-window-mac).

## How do I get clear audio?

- Pick a **headset or USB microphone** under **Options → Microphone**.
- **Wear headphones** if any sound plays, which Apple also suggests to avoid feedback.
- **Record a test** and listen back.
- On **macOS 27 Golden Gate**, add **System audio** only if the tutorial needs the app's sounds.

Microphone choices and fixes are in [how to screen record with your voice](/blog/record-screen-with-microphone-mac).

## Which export settings should I use?

Open the recording in QuickTime Player, trim it (**Edit → Trim**), then choose **File → Export As**:

| Destination | Export | Format choice |
| --- | --- | --- |
| Documentation site or course platform | 1080p | Greater Compatibility (H.264) |
| Internal wiki or chat | 1080p or 720p | Smaller File Size (HEVC) at 1080p |
| Quick "where to click" clip | 720p | H.264 |
| Very small file needed | 480p | H.264; check text is readable |

QuickTime exports .mov files. To plan sizes, measure a short test recording and use the [screen recording file size calculator](/tools/screen-recording-file-size-calculator) to scale it to your planned length. More options are in [how to make a Mac screen recording smaller](/blog/reduce-screen-recording-file-size-mac).

## How should I structure a tutorial recording?

- **One task per video.** "How to export a report" rather than "Everything about reports".
- **Start with the result.** Show what the viewer will have at the end, then how to get there.
- **Pause before each click** so the click circle and the change on screen are easy to follow.
- **Use test data.** Real names, emails and account numbers end up in tutorials more often than people expect.
- **Re-record rather than patch.** Short clips are quick to redo when the app's interface changes.

## Which apps add more tutorial features?

The built-in tools cover the essentials. Apps add things like keystroke overlays, webcam bubbles and zooms: CleanShot X lists click and keystroke overlays, a camera overlay and a video editor with zooms; OBS Studio builds scenes with a webcam for free. [Screenmac](/download) records to MP4 with an optional microphone and also captures screenshots you can annotate with arrows and numbered steps, which pairs well with written tutorials. For more, see the [best free screen recorders for Mac](/blog/best-free-screen-recorders-mac-2027).
