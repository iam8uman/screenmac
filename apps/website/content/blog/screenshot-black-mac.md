---
title: "Why Is My Mac Screenshot or Recording Black?"
slug: screenshot-black-mac
description: "A black Mac screenshot or recording usually means the app protects its content, the capture app lacks screen recording permission, or HDR looks wrong elsewhere. How to tell which, and fix it."
publishedAt: 2026-11-17
type: troubleshooting
tags:
  - troubleshooting
  - screenshots
primaryApp: screenmac
faq:
  - question: "Why are my screenshots of a video black?"
    answer: "Some apps protect what they show. Apple's guides note that apps such as the Apple TV app may not allow their windows to be captured, so the video area comes out black or missing. No setting changes this."
  - question: "Why does my capture app only show the wallpaper or a black screen?"
    answer: "It has not been given Screen and System Audio Recording permission. Turn it on in System Settings, Privacy and Security, then quit and reopen the app."
  - question: "Why is my whole screenshot black with the built-in tool?"
    answer: "That is unusual. Restart the Mac and try again; if one app's window is the only black part, that app is blocking capture."
  - question: "Why does my screenshot look washed out or too dark on another device?"
    answer: "On macOS Tahoe 26 or later, the HDR capture format records extra brightness that standard displays cannot show. Switch Capture Format to SDR in the Screenshot app's Options for screenshots you share."
sources:
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
  - title: "Apple Mac User Guide: Control access to screen and system audio recording"
    url: "https://support.apple.com/guide/mac-help/control-access-screen-system-audio-recording-mchld6aa7d23/mac"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
seoTitle: "Mac Screenshot or Screen Recording Black? Causes and Fixes"
seoDescription: "Black Mac screenshot or recording? Usually a protected app, missing screen recording permission or an HDR mismatch. How to tell which and what you can fix."
draft: true
---
A black screenshot or screen recording on a Mac has one of three usual causes. If only a **video or one app's window** is black, that app protects its content and macOS leaves it out; Apple's guides name the Apple TV app as an example, and nothing can override it. If a **third-party capture app** returns black frames or just the wallpaper, it lacks **Screen & System Audio Recording** permission. If the image looks **too dark or washed out** elsewhere, it may be an HDR capture viewed on a standard screen.

## Is the app protecting its content?

Apple's screenshot and recording guides both note that some apps, such as the Apple TV app, may not allow their windows to be captured. Streaming services, protected video and some secure fields behave the same way. The result is usually:

- The video area is black while the rest of the window captures normally.
- The window is missing from a full-screen capture.
- A recording shows black wherever the protected content was.

This is deliberate and applies to every capture tool, built-in or not. Recording protected films or shows would usually break the service's terms anyway. If you need a picture for a review or bug report, capture the app's controls with the video paused or closed, and describe the rest.

## Does the capture app have permission?

Third-party apps need your permission to see the screen. Without it they typically get the desktop wallpaper and menu bar, or nothing at all.

1. Open **System Settings → Privacy & Security**.
2. Click **Screen & System Audio Recording**.
3. Turn the app on. If it is already on, turn it off and on again.
4. Quit and reopen the app.

If that does not help, remove the app from the list with the minus button and add it again. Our full guide is [how to fix screen recording permission on Mac](/blog/screen-recording-permission-mac). In Screenmac, the menu bar item **Fix Screen Recording Permission…** resets its own entry so macOS asks again.

## Is it an HDR capture?

On macOS Tahoe 26 or later, supported Macs offer **Capture Format: HDR** in the Screenshot app's Options. Apple says HDR captures more brightness and color but needs an HDR display to show the difference, and that HDR content appears as SDR on standard displays. If a screenshot looks fine on your Mac but too dark, too bright or flat when someone else opens it:

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd> and click **Options**.
2. Under **Capture Format**, choose **SDR**.
3. Take the screenshot again.

SDR saves a PNG, which looks the same everywhere. See [changing the screenshot file format](/blog/change-screenshot-format-mac) for more.

## What if everything is black?

| Symptom | Try |
| --- | --- |
| Built-in screenshots of the whole screen are black | Restart the Mac |
| Only one external display is black | Reconnect it, or restart |
| Black right after a macOS update | Re-grant permission to capture apps, then restart |
| Black only while a video plays | That video is protected; pause or close it |
| A capture app shows only wallpaper | Missing permission; see above |

Testing with the built-in tool (<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>3</kbd>) is the quickest way to tell whether the problem is one app's permission or the Mac itself.

## Why is part of my screenshot black after editing?

If the black area is a box drawn over private information, that is a redaction, which is the point. If you meant to blur and got black, check which tool you used: the free [screenshot editor](/editor) has separate **Blur**, **Pixelate** and **Redact** tools, and Redact draws a solid block. Why a solid block is often the safer choice is covered in [pixelate vs blur vs black box](/blog/pixelate-vs-blur-vs-black-box).

## How do I avoid black captures in recordings?

- Close or pause protected video before recording a tutorial.
- Give your capture app permission before you start, not mid-recording.
- Record a short test and play it back.

For more fixes, see [Mac screenshot not working](/blog/mac-screenshot-not-working) or browse the [troubleshooting guides](/blog/topics/troubleshooting).
