---
title: "How to Screen Record on Mac With Internal Audio"
slug: record-screen-with-audio-mac
description: "Recording your Mac's own sound depends on your macOS version. macOS 27 Golden Gate adds a System audio option to the Screenshot toolbar; on earlier versions you need an app that captures computer audio."
publishedAt: 2026-11-17
type: how-to
tags:
  - screen-recording
  - how-to
primaryApp: screenmac
feature: quiz/which-mac-screen-recorder
faq:
  - question: "Can a Mac screen record with internal audio?"
    answer: "Yes on macOS 27 Golden Gate or later: press Shift-Command-5, open Options and turn on System audio. On earlier versions the built-in recorder captures a microphone only, so you need an app that records computer audio."
  - question: "Why does my Mac screen recording have no sound?"
    answer: "The built-in recorder only records a microphone unless you are on macOS 27 or later with System audio turned on. Check Options in the Screenshot toolbar and make sure a microphone or System audio is selected."
  - question: "Which apps record a Mac's internal audio?"
    answer: "CleanShot X lists microphone and computer audio recording, and Snagit lists system audio. Both are paid. Check each app's own site for current details."
  - question: "Do apps need permission to record system audio?"
    answer: "Yes. macOS controls this in System Settings, Privacy and Security, Screen and System Audio Recording, where you can allow an app to record the screen and audio or audio only."
  - question: "Can I record the microphone and system audio together?"
    answer: "On macOS 27 Golden Gate, Apple's Options menu lists both a Microphone choice and System audio. Apps that record computer audio usually let you add a microphone too."
sources:
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
  - title: "Apple Mac User Guide: Control access to screen and system audio recording"
    url: "https://support.apple.com/guide/mac-help/control-access-screen-system-audio-recording-mchld6aa7d23/mac"
  - title: "CleanShot X: features"
    url: "https://cleanshot.com/features"
  - title: "TechSmith Snagit"
    url: "https://www.techsmith.com/snagit/"
seoTitle: "Screen Record on Mac With Internal Audio (By Version)"
seoDescription: "Record your Mac's internal audio: use System audio in the Screenshot toolbar on macOS 27 Golden Gate, or an app that captures computer audio on older versions."
draft: false
---
Whether you can screen record with internal audio on a Mac depends on your macOS version. On **macOS 27 Golden Gate or later**, press **Shift-Command-5**, open **Options** and turn on **System audio**, then record as usual. On **macOS Tahoe 26 and earlier**, the built-in recorder captures only a microphone, so to get the Mac's own sound you need an app that records computer audio, such as CleanShot X or Snagit.

## How do I record internal audio on macOS 27 Golden Gate?

Apple's screen recording guide lists system audio as an option in the Screenshot app from macOS 27 Golden Gate:

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>.
2. Choose **Record Entire Screen**, **Record Selected Window** or **Record Selected Portion**.
3. Click **Options** and turn on **System audio**. Pick a **Microphone** as well if you want to talk over it.
4. Click **Record**.
5. Stop with the **Stop** button in the menu bar or <kbd>Command</kbd>-<kbd>Control</kbd>-<kbd>Esc</kbd>.

Play back the first few seconds of a test recording before you record something long, to check the levels and that the sound you expect is there.

## Why does my recording have no internal audio on older macOS?

Before macOS 27, Apple's built-in recorder (the Screenshot toolbar and QuickTime Player) recorded sound only from a **microphone**. Sound playing on the Mac, such as a video, a notification chime or a call, was not captured directly.

You may have seen two workarounds:

- **Playing sound out loud** so the built-in microphone picks it up. It works in a pinch, but the quality is poor and it records the room too.
- **Virtual audio devices** that route sound from apps into a fake microphone. These are third-party drivers. They work, but they change your Mac's audio setup and are more than most people need now that capture apps can record computer audio themselves.

## Which apps record a Mac's internal audio?

These apps say on their own sites that they record computer or system audio. Prices were checked on the date of this guide.

| App | What its site says | Price |
| --- | --- | --- |
| Built-in Screenshot toolbar | System audio option, macOS 27 Golden Gate or later | Free |
| CleanShot X | Microphone and computer audio recording, MP4 or GIF | $35 one-time with a year of updates |
| Snagit | Records the screen, microphone audio, system audio and webcam | $39 per year |

OBS Studio is also free, open source and has an audio mixer for building recordings from several sources; it takes longer to set up than the options above. Our roundup of the [best free screen recorders for Mac](/blog/best-free-screen-recorders-mac-2027) compares the free choices.

Screenmac records the screen to MP4 with an optional microphone. If recording your Mac's own sound is the main reason you are choosing a recorder, use the built-in System audio option on macOS 27 or one of the apps above.

## What permission do apps need to record system audio?

macOS asks before any app records your screen or its audio. Apple puts both in one place:

1. Open **Apple menu → System Settings → Privacy & Security**.
2. Click **Screen & System Audio Recording**.
3. Turn the app on. Apple notes you can allow an app to record both the screen and audio, or audio only.
4. If the app is missing, click **Add (+)** and choose it.
5. Quit and reopen the app.

If a recording has picture but no sound, or the app says it is not allowed to record, see [how to fix screen recording permission on Mac](/blog/screen-recording-permission-mac).

## How do I get good audio in a screen recording?

- **Lower the Mac's volume a little** before recording system audio. Very loud playback can clip.
- **Use headphones** when you record your voice and system audio together, so the microphone does not pick up the speakers. Apple suggests the same to avoid feedback.
- **Silence notifications** with Do Not Disturb, or their sounds end up in the recording.
- **Record a short test first** and listen to it with headphones.

## Is it legal to record calls and videos with system audio?

Being able to record sound does not mean you are allowed to. Recording calls without consent is illegal in some places, and recording streamed films or music may break the service's terms. Tell people on a call that you are recording, and only record content you have the right to use. Some apps block capture of their windows entirely, which is why protected video can come out black.

For the basics of starting, stopping and saving a recording, see [how to record your screen on a Mac](/blog/record-screen-mac). Not sure which recorder suits you? Take the [screen recorder quiz](/quiz/which-mac-screen-recorder).
