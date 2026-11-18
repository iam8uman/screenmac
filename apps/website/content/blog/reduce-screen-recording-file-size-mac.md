---
title: "How to Make a Mac Screen Recording Smaller"
slug: reduce-screen-recording-file-size-mac
description: "Shrink a Mac screen recording by trimming it, exporting at 1080p, 720p or 480p in QuickTime, choosing HEVC, recording a smaller area or using SDR. What each step saves and when to use it."
publishedAt: 2026-11-17
type: how-to
tags:
  - screen-recording
  - how-to
primaryApp: screenmac
feature: tools/screen-recording-file-size-calculator
faq:
  - question: "Why are Mac screen recordings so big?"
    answer: "They are recorded at your display's full pixel resolution, which on a Retina screen is very high, and a file's size is its bitrate multiplied by its length. Long, full-screen, high-resolution recordings add up fast."
  - question: "How do I compress a screen recording on Mac for free?"
    answer: "Open it in QuickTime Player, choose File, Export As, and pick 1080p, 720p or 480p. For 1080p and 4K, choose Smaller File Size to export in HEVC."
  - question: "What is the smallest QuickTime export?"
    answer: "480p, which Apple lists as up to 640 by 480 using H.264. It is fine for showing where to click but too small to read fine text."
  - question: "Does recording a smaller area reduce file size?"
    answer: "Yes. Record Selected Portion records fewer pixels than the whole screen, which generally means a smaller file at the same quality."
  - question: "How can I estimate the size before recording?"
    answer: "Make a short test recording, note its size and length, and enter them in the free screen recording file size calculator, which scales it to the length you plan."
sources:
  - title: "Apple QuickTime Player User Guide: Export movies"
    url: "https://support.apple.com/guide/quicktime-player/export-movies-qtp20e395859/mac"
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
  - title: "Apple QuickTime Player User Guide: Trim a movie or clip"
    url: "https://support.apple.com/guide/quicktime-player/qtpf2115f6fd/mac"
seoTitle: "Reduce Screen Recording File Size on Mac (Free Ways)"
seoDescription: "Make a Mac screen recording smaller: trim it, export at 1080p, 720p or 480p in QuickTime, pick HEVC, and record a smaller area next time. No extra apps."
draft: false
---
To make a Mac screen recording smaller, open it in **QuickTime Player**, choose **File → Export As**, and pick a lower resolution such as **1080p** or **720p**. At 1080p, choose **Smaller File Size** to export in HEVC. Trimming the start and end first helps too. Next time, record a selected portion instead of the whole screen.

These steps use only built-in apps. Here is what each one does and how to pick.

## Why are Mac screen recordings so large?

Every video's size comes from one sum: **bitrate × length**. A recording at 8 megabits per second for one minute holds 480 megabits, which is 60 megabytes. Three things push the bitrate up:

- **Resolution.** On a Retina display the Mac records far more pixels than the size the screen appears to be.
- **Movement.** Scrolling, video playback and animations change every frame, so the encoder needs more data than for a still slide.
- **Format.** Uncompressed or lightly compressed formats are larger than HEVC.

Length then multiplies all of it. The free [screen recording file size calculator](/tools/screen-recording-file-size-calculator) does this sum for you, from a bitrate or from a sample recording of your own.

## How do I compress a recording in QuickTime Player?

1. Open the recording in QuickTime Player.
2. Choose **File → Export As**.
3. Pick a resolution. Apple lists these options:

| Export | Format | Maximum size |
| --- | --- | --- |
| 4K | .mov, H.264 or HEVC | 3840 × 2160 |
| 1080p | .mov, H.264 or HEVC | 1920 × 1080 |
| 720p | .mov, H.264 | 1280 × 720 |
| 480p | .mov, H.264 | 640 × 480 |
| Audio Only | AAC audio | No video |

4. For 4K or 1080p, open the **Format** menu and choose **Smaller File Size** (HEVC) or **Greater Compatibility** (H.264).
5. Name the file, choose where to save it and click **Save**.

Options larger than your recording are dimmed. QuickTime exports `.mov` files, not MP4.

## Which resolution should I export?

| The video is for | Export | Why |
| --- | --- | --- |
| A tutorial where people read code or small text | 1080p, Smaller File Size | Text stays sharp, HEVC keeps it smaller |
| A teammate in chat, mostly clicking around | 720p | Much smaller, text is still readable at normal sizes |
| Showing roughly where to click | 480p | Smallest; fine text will be blurry |
| Someone on an older device or app | 1080p or 720p, Greater Compatibility | H.264 plays almost everywhere |

Before you send a 480p file, play it at full screen and check you can still read what matters.

## What else makes a recording smaller?

- **Trim it.** Cutting dead time at the start and end removes footage outright. See [how to trim a screen recording on Mac](/blog/trim-screen-recording-mac).
- **Record a smaller area.** In the Screenshot toolbar, choose **Record Selected Portion**, or **Record Selected Window** on macOS Tahoe 26 or later. Fewer pixels, smaller file.
- **Use SDR.** On supported Macs with macOS Tahoe 26 or later, Options offers SDR (H.264) or HDR (HEVC). HDR only looks different on an HDR display, so SDR is the sensible choice for screen recordings you share.
- **Keep it still.** Close animated pages and pause videos you do not need in the shot.
- **Split long recordings.** Two five-minute videos are easier to send than one ten-minute file.

## How small does it need to be?

Size limits depend on where the video is going, and they change, so check the limit of the email provider, chat app or ticket system you are using. Then use the calculator's **Fit under a size limit** mode: enter the limit and the length, and it gives the highest average bitrate that fits. Leave some headroom, because encoders do not hit an average exactly.

## Is there a better way to share large recordings?

If a file is still too big after a 720p export, a link is usually better than an attachment. Upload it to cloud storage you already use and share the link, or use a video messaging service. Remember that anything you upload leaves your Mac, so check the recording for private details first.

Screenmac records to MP4, with an optional microphone, and keeps recordings on your Mac; there is no upload feature. If you are choosing a recorder with file size in mind, compare the options in [best free screen recorders for Mac](/blog/best-free-screen-recorders-mac-2027), or start with the basics in [how to record your screen on a Mac](/blog/record-screen-mac).
