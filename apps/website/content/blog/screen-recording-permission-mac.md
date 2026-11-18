---
title: "How to Fix Screen Recording Permission on Mac"
slug: screen-recording-permission-mac
description: "When an app says it cannot record your screen, or captures only show the desktop wallpaper, turn on Screen and System Audio Recording for it in Privacy and Security. Steps, and what to do when it is already on."
publishedAt: 2026-11-17
type: troubleshooting
tags:
  - troubleshooting
  - screen-recording
primaryApp: screenmac
faq:
  - question: "How do I allow screen recording on a Mac?"
    answer: "Open System Settings, Privacy and Security, Screen and System Audio Recording, and turn the app on. If it is not listed, click the Add button and choose it. Then quit and reopen the app."
  - question: "Why does my screen capture only show the wallpaper?"
    answer: "That is what macOS gives an app that has not been allowed to record the screen: the desktop without other apps' windows. Turn on the app's Screen and System Audio Recording permission and reopen it."
  - question: "The permission is on but the app still cannot record. What now?"
    answer: "Turn the permission off and on again, quit and reopen the app. After an app update, removing the app from the list with the minus button and adding it again often clears a stale entry."
  - question: "Does the built-in Screenshot app need this permission?"
    answer: "No. The permission is for third-party apps and websites that want to see your screen. Apple's own screenshot tools do not appear in the list."
  - question: "Is it safe to give an app screen recording permission?"
    answer: "Only give it to apps you trust. Apple notes that how third-party apps handle what they record is governed by their own terms and privacy policies."
sources:
  - title: "Apple Mac User Guide: Control access to screen and system audio recording"
    url: "https://support.apple.com/guide/mac-help/control-access-screen-system-audio-recording-mchld6aa7d23/mac"
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
seoTitle: "Fix Screen Recording Permission on Mac (Step by Step)"
seoDescription: "App can't record your Mac screen, or captures show only the wallpaper? Turn on Screen and System Audio Recording in Privacy and Security, then reopen it."
draft: false
---
To fix screen recording permission on a Mac, open **System Settings → Privacy & Security → Screen & System Audio Recording** and turn the app on. If it is not listed, click **Add (+)** and choose it from Applications. Then **quit and reopen the app**. If the switch is already on but recording still fails, turn it off and on again, or remove the app with the minus button and add it back.

## Why does macOS ask for screen recording permission?

macOS does not let apps see what is on your screen unless you allow it. The same permission covers screenshots taken by third-party apps, screen recordings, screen sharing in video calls, and some automation tools. Apple groups screen and system audio access together, and you can allow an app to record both or audio only.

When an app has no permission, it typically gets one of these results:

- A prompt asking you to open System Settings.
- Captures that show only the **desktop wallpaper and menu bar**, without other apps' windows.
- A black or empty recording.
- An error message saying recording is not allowed.

Apple's own Screenshot app (<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>) does not need this permission, which is why built-in screenshots can work while an app fails.

## How do I turn on screen recording permission?

1. Choose **Apple menu → System Settings**.
2. Click **Privacy & Security** in the sidebar. You may need to scroll down.
3. Click **Screen & System Audio Recording**.
4. Find the app in the list and turn it on.
5. If the app is not there, click **Add (+)** below the list, find the app in Applications and click **Open**.
6. Quit the app completely (choose **Quit** from its menu, not just closing the window) and open it again.

macOS may tell you the app needs to quit to apply the change and offer to do it for you.

## What if the permission is already on and it still fails?

Work through these in order:

| Try | Why it helps |
| --- | --- |
| Turn the switch off, then on, then reopen the app | Refreshes the setting for that app |
| Remove the app with the minus button and add it again | Clears an entry that points to an older copy |
| Check you are running the copy in Applications | A second copy in Downloads is a different app to macOS |
| Restart the Mac | Clears a stuck capture service |
| Update the app | Older builds may not support your macOS version |

The second fix matters most after an **app update**. macOS ties the permission to the app's identity, and an update or a copy in a different folder can look like a different app. Removing the old entry and adding the current one fixes that.

## How do I fix it in Screenmac?

Screenmac uses Apple's ScreenCaptureKit and asks for this permission on first launch. Its builds are ad-hoc signed and not yet notarized by Apple, so after updating, macOS can treat the new build as a new app. If captures fail after an update:

1. Click the Screenmac icon in the menu bar.
2. Choose **Fix Screen Recording Permission…**. It resets Screenmac's own entry so macOS asks again.
3. Allow it when prompted, then reopen Screenmac.

The [support page](/support) has more help with permissions and first launch.

## Why is a window missing from my recording even with permission?

Permission lets an app see the screen, but some apps protect their own windows. Apple's guides note that some apps, such as the Apple TV app, may not allow their windows to be captured or recorded. Those areas come out black or are left out, and no permission setting changes it. Protected video and some password fields behave the same way.

If microphone audio is missing rather than video, that is a separate permission: **Privacy & Security → Microphone**. For missing sound in general, see [how to screen record with internal audio](/blog/record-screen-with-audio-mac).

## Which apps should I allow?

Treat screen recording permission like a key to your screen. Allow it for capture apps, video call apps you use for screen sharing, and tools you trust. Remove apps you no longer use: open the same list and turn them off or remove them. Apple points out that what third-party apps do with recordings is covered by their own privacy policies, so it is worth a quick read for anything that uploads.

For the built-in recording steps, see [how to record your screen on a Mac](/blog/record-screen-mac). If screenshots fail rather than recordings, try [Mac screenshot not working](/blog/mac-screenshot-not-working), or browse all [troubleshooting guides](/blog/topics/troubleshooting).
