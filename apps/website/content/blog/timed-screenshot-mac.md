---
title: "How to Take a Timed Screenshot on Mac"
slug: timed-screenshot-mac
description: "Set a 5 or 10 second screenshot timer on a Mac in the Screenshot app's Options, or choose any delay with the screencapture command. Useful for menus, hover states and tooltips."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
feature: tools/mac-screenshot-shortcuts
faq:
  - question: "How do I set a screenshot timer on a Mac?"
    answer: "Press Shift-Command-5, click Options and choose 5 Seconds or 10 Seconds under Timer. Then click Capture; the screenshot is taken when the countdown ends."
  - question: "Can I set a timer longer than 10 seconds?"
    answer: "Not in the Screenshot app. In Terminal, screencapture -T followed by a number of seconds waits as long as you like, for example screencapture -T 20 ~/Desktop/shot.png."
  - question: "Does the timer apply to Shift-Command-4?"
    answer: "The timer is part of the Screenshot toolbar. To use it, start the capture from the toolbar opened with Shift-Command-5, not from the Shift-Command-3 or 4 shortcuts."
  - question: "How do I turn the screenshot timer off?"
    answer: "Press Shift-Command-5, click Options and choose None under Timer. The setting is remembered until you change it."
sources:
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "CleanShot X: features"
    url: "https://cleanshot.com/features"
  - title: "Shottr"
    url: "https://shottr.cc/"
seoTitle: "Timed Screenshot on Mac: 5 or 10 Seconds, or Any Delay"
seoDescription: "Take a timed screenshot on a Mac: set a 5 or 10 second timer in Shift-Command-5 Options, or any delay with screencapture -T. Ideal for menus and hovers."
draft: true
---
To take a timed screenshot on a Mac, press **Shift-Command-5**, click **Options**, and choose **5 Seconds** or **10 Seconds** under **Timer**. Pick what to capture in the toolbar, click **Capture**, then set up the screen during the countdown: open a menu, hover over a button, or bring a window forward. For a different delay, the built-in `screencapture` command in Terminal takes any number of seconds.

## How do I use the screenshot timer?

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>. The Screenshot toolbar appears.
2. Click **Options** and choose **5 Seconds** or **10 Seconds** under **Timer**.
3. Choose **Capture Entire Screen**, **Capture Selected Window** or **Capture Selected Portion**. For a portion, drag the frame over the area first.
4. Click **Capture**. A countdown starts.
5. Before it ends, get the screen into the state you want.

When the countdown reaches zero, the screenshot is taken and saved like any other. The timer stays set for the next capture from the toolbar, so set it back to **None** when you are done.

## When is a timed screenshot useful?

Some things on screen disappear the moment you press a key:

- **Menus and submenus** that close when the shortcut is pressed.
- **Hover states and tooltips**, which need the pointer to sit still over an element.
- **Drag-in-progress states**, such as a file being dragged over a folder.
- **Dialogs** you need to open after starting the capture.
- **Your own position** when you need both hands to set something up.

For open menus, there is also a shortcut that does not need a timer; see [how to screenshot a menu or hover state](/blog/screenshot-menu-mac).

## Can I set a longer or shorter delay?

The toolbar offers only 5 and 10 seconds. The `screencapture` command, built into macOS, accepts any delay with `-T`:

1. Open **Terminal**.
2. Type `screencapture -T 20 ~/Desktop/delayed.png` and press Return.
3. You have 20 seconds; then the whole screen is captured to your desktop.

Add `-i` to drag over an area instead (`screencapture -i -T 3 ~/Desktop/delayed.png`). The command's manual page, which you can read with `man screencapture`, says the default delay is 5 seconds if you leave the number out.

## How do capture apps handle timers?

| Tool | Delay options |
| --- | --- |
| Built-in Screenshot toolbar | None, 5 or 10 seconds |
| `screencapture -T` | Any number of seconds |
| CleanShot X | Self-timer (listed in its features) |
| Shottr | Delayed screenshot of 3 seconds (from its release notes) |

## What about hover states in recordings?

If you need to show a hover state in action, a short screen recording often explains it better than a still. Use **Options → Timer** in the same toolbar with **Record Selected Portion**, so recording starts after you have positioned the pointer. See [how to record your screen on a Mac](/blog/record-screen-mac).

## What should I do with the timed screenshot?

A timed screenshot is often a full-screen capture, because you set it before you knew exactly where the menu would open. Crop it down before sharing, and check the edges for open tabs and notifications. The free [screenshot editor](/editor) crops, adds arrows or numbered steps, and blurs anything private, then exports a PNG without uploading anything.

[Screenmac](/download) captures with its own shortcuts and opens each capture in the same editor, so a crop and an arrow take seconds. For every other method, read [how to take a screenshot on a Mac](/blog/how-to-screenshot-on-mac), or find any shortcut with the [shortcut finder](/tools/mac-screenshot-shortcuts).
