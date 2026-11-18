---
title: "How to Screen Record With QuickTime Player"
slug: quicktime-screen-recording-mac
description: "Use QuickTime Player for screen recordings on a Mac: start with File, New Screen Recording, choose a mic and show clicks, then trim, split and export at a smaller size in the same app. When QuickTime is the better choice."
publishedAt: 2026-11-17
type: how-to
tags:
  - screen-recording
  - how-to
primaryApp: screenmac
faq:
  - question: "How do I screen record with QuickTime on a Mac?"
    answer: "Open QuickTime Player, choose File, New Screen Recording or press Control-Command-N, click Record, then click to record the whole screen or drag to record part of it. Stop from the menu bar or with Command-Control-Esc."
  - question: "Why does QuickTime open the Screenshot toolbar instead?"
    answer: "On current macOS versions, New Screen Recording can hand off to the Screenshot toolbar. Apple says that when the toolbar appears, QuickTime is not doing the recording, and the steps for the Screenshot app apply."
  - question: "Where does QuickTime save screen recordings?"
    answer: "QuickTime opens the recording when you stop. Choose File, Save to pick a name and folder. Recordings made through the Screenshot toolbar save to the desktop by default."
  - question: "Can QuickTime record my webcam and screen at the same time?"
    answer: "Not in one recording. A common workaround is to open File, New Movie Recording, choose View, Float on Top, and include that window in a screen recording."
  - question: "Can QuickTime export MP4?"
    answer: "No. Apple's guide says QuickTime Player exports movies as .mov files, using H.264 or HEVC."
sources:
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
  - title: "Apple QuickTime Player User Guide: Trim a movie or clip"
    url: "https://support.apple.com/guide/quicktime-player/qtpf2115f6fd/mac"
  - title: "Apple QuickTime Player User Guide: Export movies"
    url: "https://support.apple.com/guide/quicktime-player/export-movies-qtp20e395859/mac"
  - title: "Apple QuickTime Player User Guide: Record a movie"
    url: "https://support.apple.com/guide/quicktime-player/record-a-movie-qtp356b55534/mac"
seoTitle: "QuickTime Screen Recording on Mac: Record, Trim, Export"
seoDescription: "Screen record with QuickTime Player: File, New Screen Recording, pick a mic and show clicks, then trim, split and export a smaller .mov in the same app."
draft: true
---
To screen record with QuickTime Player, open it and choose **File → New Screen Recording** (or press **Control-Command-N**). Click **Record**, then click anywhere to record the whole screen, or drag to select an area and click **Start Recording**. Stop with the **Stop** button in the menu bar or **Command-Control-Esc**. QuickTime then opens the recording, ready to trim, split and export at a smaller size without leaving the app.

On current macOS versions, New Screen Recording may open the same Screenshot toolbar you get with Shift-Command-5; Apple says that when the toolbar appears, QuickTime is not doing the recording.

## How do I record with QuickTime Player?

1. Open **QuickTime Player** from Applications.
2. Choose **File → New Screen Recording**.
3. If a **Screen Recording** window appears, click the arrow next to **Record** to choose:
   - a **Microphone** (QuickTime shows a volume slider so you can monitor it);
   - **Show Mouse Clicks in Recording**, which draws a circle around the pointer on each click.
4. Click **Record**.
5. Click anywhere to record the entire screen, or drag over an area and click **Start Recording**.
6. Stop from the menu bar or with <kbd>Command</kbd>-<kbd>Control</kbd>-<kbd>Esc</kbd>.

If the Screenshot toolbar appears instead, choose a record button there and use **Options** for the microphone and clicks. The full toolbar walkthrough is in [how to record your screen on a Mac](/blog/record-screen-mac).

## What can QuickTime do after recording?

This is where QuickTime earns its place. Apple's QuickTime guide covers:

| Task | Where |
| --- | --- |
| Trim the start and end | Edit → Trim, drag the yellow handles |
| Split into clips | Edit → Split Clip at the playhead |
| Remove a section | Split twice, select the middle clip, Delete |
| Rotate or flip | Edit menu |
| Export smaller | File → Export As → 1080p, 720p or 480p |
| Keep only the sound | File → Export As → Audio Only |
| Check size and data rate | Window → Show Movie Inspector |

Trimming steps are in [how to trim a screen recording on Mac](/blog/trim-screen-recording-mac), and choosing an export size in [how to make a Mac screen recording smaller](/blog/reduce-screen-recording-file-size-mac).

The Movie Inspector is handy for planning: it shows a recording's size and data rate, which you can feed into the [file size calculator](/tools/screen-recording-file-size-calculator) to estimate how big a longer recording with the same settings will be.

## How do I add my webcam with QuickTime?

QuickTime cannot record the screen and the camera into one file, but you can place the camera on screen:

1. Choose **File → New Movie Recording**. Your camera appears in a window.
2. Choose **View → Float on Top** so it stays above other windows.
3. Resize it small and drag it to a corner.
4. Start a screen recording that includes that corner.

The camera window is just another window on screen, so it is recorded with everything else. It is a workaround; OBS Studio, CleanShot X and Snagit add a proper camera overlay.

## Can QuickTime record an iPhone screen?

Yes. Connect the iPhone or iPad to the Mac, choose **File → New Movie Recording**, and pick the device as the **Camera** in the menu next to the Record button. Apple's guide describes the connected device as a source you can record from.

## When should I use QuickTime instead of another recorder?

| Use QuickTime when | Use something else when |
| --- | --- |
| You want to record, trim and export in one free app | You need MP4 files (QuickTime exports .mov) |
| You need a quick audio-only export | You want a proper webcam overlay |
| You are recording a connected iPhone | You want click and keystroke overlays |
| You are fine with a basic editor | You want to annotate screenshots too |

[Screenmac](/download) records to MP4 with an optional microphone and also takes screenshots with an annotation and redaction editor, which suits people who mix short videos and marked-up images. For more choices, see [best free screen recorders for Mac](/blog/best-free-screen-recorders-mac-2027).
