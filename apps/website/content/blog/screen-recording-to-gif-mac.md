---
title: "How to Make a GIF From a Screen Recording on Mac"
slug: screen-recording-to-gif-mac
description: "macOS cannot export GIFs from a screen recording. Record straight to GIF with Kap or CleanShot X, or convert a short MOV, and keep the file small: short clips, small areas and few colors."
publishedAt: 2026-11-17
type: how-to
tags:
  - screen-recording
  - how-to
primaryApp: screenmac
feature: tools/screen-recording-file-size-calculator
faq:
  - question: "Can a Mac turn a screen recording into a GIF without an app?"
    answer: "Not with QuickTime Player or the Screenshot toolbar. QuickTime exports movies as .mov files only. You need a recorder or converter that writes GIF."
  - question: "What is the best free GIF screen recorder for Mac?"
    answer: "Kap is free and open source and exports GIF, MP4, WebM and APNG. Its site lists macOS 12 or later."
  - question: "Why is my GIF so big?"
    answer: "GIF is an old format with weak compression. Every second at full Retina size adds a lot. Keep clips to a few seconds, record a small area, and lower the frame rate."
  - question: "Should I use a GIF or an MP4?"
    answer: "Use MP4 where it is supported, since it is usually much smaller and sharper. Use GIF where video is not allowed or will not autoplay, such as some README files and older chat tools."
  - question: "Does Screenmac record GIFs?"
    answer: "No. Screenmac records to MP4 with an optional microphone. Convert the MP4 with a GIF tool, or record with Kap or CleanShot X if you need GIFs often."
sources:
  - title: "Kap"
    url: "https://getkap.co/"
  - title: "CleanShot X: features"
    url: "https://cleanshot.com/features"
  - title: "Monosnap on the Mac App Store"
    url: "https://apps.apple.com/us/app/monosnap-screenshot-editor/id540348655?mt=12"
  - title: "Apple QuickTime Player User Guide: Export movies"
    url: "https://support.apple.com/guide/quicktime-player/export-movies-qtp20e395859/mac"
seoTitle: "Make a GIF From a Mac Screen Recording (Small and Sharp)"
seoDescription: "macOS can't export GIFs. Record to GIF with Kap or CleanShot X, or convert a short clip, and keep it small with short loops, small areas and low frame rates."
draft: true
---
macOS cannot turn a screen recording into a GIF on its own: QuickTime Player and the Screenshot toolbar save **.mov** files, and QuickTime's export options are movie and audio formats only. To get a GIF, record straight to GIF with an app such as **Kap** (free, open source) or **CleanShot X** (paid), or convert a short recording with a GIF converter. Keep it to a few seconds and a small area, because GIFs get large fast.

## Which apps record GIFs on a Mac?

| App | GIF support (from its own site or store page) | Price |
| --- | --- | --- |
| Kap | Exports GIF, MP4, WebM and APNG, with trimming | Free, open source |
| CleanShot X | Records a window, fullscreen or area as MP4 or GIF | $35 one-time Basic |
| Monosnap | Screencasts and GIF recording | Free with in-app purchases |
| Built-in tools | No GIF export | Free |

Kap is the simplest free route: select an area from its menu bar icon, record, then choose GIF when exporting. It is built with web technology rather than as a native app, and its site lists macOS 12 or later.

## How do I make a GIF with Kap?

1. Install Kap from its website and open it. It lives in the menu bar.
2. Click its icon and drag over the area you want to record.
3. Click record, do the thing you want to show, then stop.
4. In the editor, trim the start and end.
5. Choose **GIF** as the export format and save it.

Like any recorder, Kap needs **Screen & System Audio Recording** permission. If it records only the wallpaper, see [how to fix screen recording permission](/blog/screen-recording-permission-mac).

## How do I convert an existing recording to GIF?

If you already have a .mov or .mp4, open it in an app that can export GIF, or use a converter. Before you use a website, remember that uploading a screen recording sends everything in it to someone else's server. For anything with private details, use an app on your Mac instead.

Whatever tool you use, trim first. A 30-second recording makes a GIF that is far too big for most places it is going.

## How do I keep a GIF small?

GIF is an old format: it stores at most 256 colors per frame and compresses video poorly compared with MP4. The size grows with **every pixel and every frame**, so:

- **Keep it short.** Two to eight seconds is plenty to show an interaction.
- **Record a small area.** Use a selected portion or a single window, not the full screen.
- **Scale it down.** Retina recordings are twice the width and height you see; export at half size.
- **Lower the frame rate.** Interface demos look fine at 10 to 15 frames per second as a GIF.
- **Avoid gradients and video** in the area. They use many colors and dither badly.
- **Loop deliberately.** Start and end on the same screen so the loop looks intentional.

The [screen recording file size calculator](/tools/screen-recording-file-size-calculator) estimates sizes for MP4 from bitrate and length; for GIFs, expect larger files for the same clip and check the export before you post.

## Should I use a GIF or an MP4?

| Destination | Better choice | Why |
| --- | --- | --- |
| Pull requests and README files | GIF or MP4, if supported | Some renderers autoplay GIF but not video |
| Chat apps | MP4 | Smaller, sharper, usually autoplays |
| Documentation sites | MP4 or WebM | Much smaller files |
| Email | GIF | Video rarely plays inline |
| Social media | MP4 | Platforms convert GIFs anyway |

When the destination plays video, MP4 is almost always smaller and sharper. [Screenmac](/download) records to MP4 with an optional microphone and keeps files on your Mac, which suits chat and docs; for GIFs specifically, use one of the apps above. To record the clip in the first place, see [how to record your screen on a Mac](/blog/record-screen-mac), and to trim it, [how to trim a screen recording](/blog/trim-screen-recording-mac).
