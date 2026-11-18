---
title: "Mac Screen Recording Has No Sound: How to Fix It"
slug: screen-recording-no-sound-mac
description: "No audio in a Mac screen recording usually means the microphone was set to None, the wrong input was chosen, the app lacks microphone permission, or you expected system audio on a macOS version that cannot record it."
publishedAt: 2026-11-17
type: troubleshooting
tags:
  - troubleshooting
  - screen-recording
primaryApp: screenmac
faq:
  - question: "Why does my Mac screen recording have no sound?"
    answer: "The most common reason is that Microphone is set to None in the Screenshot toolbar's Options. Pick a microphone there before you click Record."
  - question: "Why does my recording have my voice but not the video's sound?"
    answer: "Before macOS 27 Golden Gate, the built-in recorder captures only a microphone, not sound playing on the Mac. On macOS 27 or later, turn on System audio in Options."
  - question: "Why is a third-party recorder silent?"
    answer: "It needs microphone permission (System Settings, Privacy and Security, Microphone) for your voice, and Screen and System Audio Recording permission for Mac audio. Turn both on and reopen the app."
  - question: "Can I add sound to a recording that has none?"
    answer: "Not in QuickTime Player. Record a voice-over separately and combine them in a video editor such as iMovie, or record again with audio set up."
  - question: "The audio is there but very quiet. What can I do?"
    answer: "Move closer to the microphone, check the input level in System Settings, Sound, Input, and use QuickTime's volume slider while recording to monitor it."
sources:
  - title: "Apple Support: How to record the screen on your Mac"
    url: "https://support.apple.com/en-us/102618"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "Apple Mac User Guide: Control access to screen and system audio recording"
    url: "https://support.apple.com/guide/mac-help/control-access-screen-system-audio-recording-mchld6aa7d23/mac"
seoTitle: "Mac Screen Recording No Sound? Causes and Fixes"
seoDescription: "No sound in a Mac screen recording? Check the Microphone option, the input device, app permissions and whether your macOS version can record system audio."
draft: true
---
If a Mac screen recording has no sound, check **Shift-Command-5 → Options → Microphone** first: when it is set to **None**, nothing is recorded. If your voice is there but the **sound from apps or videos** is missing, that is expected on **macOS Tahoe 26 and earlier**, where the built-in recorder captures only a microphone; **macOS 27 Golden Gate** adds a **System audio** option. Third-party recorders also need **microphone** and **screen and system audio** permissions.

Work out which case you are in, then use the matching fix.

## Is the microphone set to None?

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>.
2. Click **Options**.
3. Under **Microphone**, choose a microphone. If several are listed, pick the one you are speaking into.
4. Record a short test and play it back.

In QuickTime Player's Screen Recording window, the same choice is in the menu next to the **Record** button, along with a volume slider to monitor the level. The setting is remembered, so a recording made silent once will stay silent until you change it.

## Is the right input device selected?

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Silent even with a mic chosen | A different mic is selected than the one you used | Choose the mic explicitly in Options |
| Sound drops when headphones connect | macOS switched input to the headset | Choose the headset mic, or the built-in mic, deliberately |
| Very quiet | Input level low or mic far away | System Settings → Sound → Input; move closer |
| Crackles or cuts out | Bluetooth connection | Try a wired mic or the built-in mic |
| Hardware mute | Headset or USB mic muted | Check the mute switch |

**System Settings → Sound → Input** shows each input device with a live level meter. Speak and watch it move to confirm macOS is hearing you.

## Why is the sound from apps or videos missing?

Apple's screen recording guide lists **System audio** as an option from **macOS 27 Golden Gate or later**. On earlier versions, the Screenshot toolbar and QuickTime record from a microphone only, so the sound from a video, a game or a call is not in the file. Options:

- **On macOS 27 or later:** turn on **System audio** in Options.
- **On earlier versions:** use a recorder whose own site lists computer or system audio, such as CleanShot X or Snagit.

More detail is in [how to screen record with internal audio](/blog/record-screen-with-audio-mac). Some apps also protect their content, so even with system audio you may get silence or black video from them.

## Does the app have permission?

Third-party recorders need two permissions:

1. **System Settings → Privacy & Security → Microphone:** turn the app on for your voice.
2. **System Settings → Privacy & Security → Screen & System Audio Recording:** turn the app on for the screen and Mac audio. Apple notes you can allow screen and audio, or audio only.

Then quit and reopen the app. If it still fails, remove it from the list and add it again; see [how to fix screen recording permission](/blog/screen-recording-permission-mac). Screenmac, for example, records the screen to MP4 with an optional microphone, and if microphone audio was requested but none arrived, it tells you after the recording and points you to the input device and the Microphone permission.

## How do I fix a recording that is already silent?

QuickTime Player cannot add audio to a recording. You can:

- **Re-record** with audio set up, which is usually quickest for short clips.
- **Record a voice-over** separately with QuickTime's **File → New Audio Recording**, then combine the two in a video editor such as iMovie.

## How do I avoid silent recordings?

- Record a **five-second test** before anything important and listen with headphones.
- Watch the **level meter** in QuickTime or in Sound settings while you speak.
- Keep **one microphone** connected so macOS does not switch inputs mid-recording.
- Turn on **Do Not Disturb**, so the only sounds are the ones you mean.

For the rest of the setup, see [how to record your screen on a Mac](/blog/record-screen-mac) or browse the [troubleshooting guides](/blog/topics/troubleshooting).
