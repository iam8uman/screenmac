---
title: "How to Screenshot a Menu or Hover State on Mac"
slug: screenshot-menu-mac
description: "Capture an open menu on a Mac with Shift-Command-4 while the menu is showing, capture just the menu with Space, or use a timer for tooltips and hover states that vanish when you press keys."
publishedAt: 2026-11-17
type: how-to
tags:
  - screenshots
  - how-to
primaryApp: screenmac
faq:
  - question: "How do I screenshot an open menu on a Mac?"
    answer: "Open the menu, then press Shift-Command-4 and drag over it. The menu stays open while you capture. To capture only the menu, press Space after Shift-Command-4 and click the menu."
  - question: "How do I capture a menu without its title in the menu bar?"
    answer: "Press Shift-Command-4, then Space, and click the open menu. Only the menu panel is captured. Drag with Shift-Command-4 instead if you also want the menu bar title."
  - question: "How do I screenshot a tooltip on a Mac?"
    answer: "Tooltips disappear when you press keys. Use the timer: press Shift-Command-5, choose Options, then 5 or 10 Seconds, click Capture, and hover over the item until the countdown ends."
  - question: "Can I screenshot the menu bar itself?"
    answer: "Yes. Press Shift-Command-4 and drag across the menu bar. Apple's guide also lists capturing the menu bar with Shift-Command-4, Space and a click."
sources:
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
seoTitle: "Screenshot a Menu or Hover State on Mac (Without Closing It)"
seoDescription: "Screenshot an open Mac menu with Shift-Command-4, capture only the menu with Space, and use the timer for tooltips and hover states that close on a keypress."
draft: true
---
To screenshot an open menu on a Mac, **open the menu first**, then press **Shift-Command-4** and drag over it. The menu stays open while you capture. To capture just the menu panel with nothing around it, press **Space** after Shift-Command-4 and click the menu. For tooltips and hover states, which vanish when you press a key, use the **timer** in the Screenshot app (Shift-Command-5 → Options → Timer).

## How do I capture an open menu?

Apple's guide lists two ways.

**Capture the menu and its surroundings:**

1. Click the menu so it is open.
2. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd>. The menu stays open and the pointer becomes a crosshair.
3. Drag over the menu, including the menu title or anything else you want in the shot.

**Capture only the menu:**

1. Open the menu.
2. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd>, then <kbd>Space</kbd>. The pointer becomes a camera.
3. Click the menu. Only the menu panel is captured, without its title.

Add <kbd>Control</kbd> to either shortcut to copy the capture to the clipboard. The same steps work for context menus (Control-click menus) and submenus.

## How do I capture a submenu?

Hover over the item so the submenu opens, then press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> without moving the pointer, and drag over both panels. If the submenu closes as soon as you move to drag, use the timer method below instead.

## How do I screenshot a tooltip or hover state?

Tooltips, hover highlights and some pop-overs disappear the instant you press a key, so the shortcuts cannot catch them. Use a countdown:

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>.
2. Click **Options** and choose **5 Seconds** or **10 Seconds** under **Timer**.
3. Choose **Capture Selected Portion** and position the frame over the area, or choose **Capture Entire Screen**.
4. Click **Capture**, move the pointer over the item, and keep it still until the countdown ends.

Turn on **Show Mouse Pointer** in Options if you want the pointer in the shot, which helps show what is being hovered. More detail is in [how to take a timed screenshot on Mac](/blog/timed-screenshot-mac).

## Which method should I use?

| You want to capture | Use |
| --- | --- |
| An open menu with its title | Open it, Shift-Command-4, drag |
| Only the menu panel | Open it, Shift-Command-4, Space, click |
| A submenu that stays open | Hover, Shift-Command-4, drag |
| A tooltip or hover state | Shift-Command-5, Options, Timer |
| A menu, straight to chat | Add Control to the shortcut |

## Why does my menu screenshot have a shadow or transparent edges?

When you capture a menu with Space and a click, macOS treats it like a window and keeps its soft shadow and rounded corners, saved as transparent pixels. Apple documents holding <kbd>Option</kbd> as you click to leave out the shadow for [window screenshots](/blog/screenshot-window-without-shadow-mac); try the same with menus, or crop the shadow off afterwards. Rounded corners still show small transparent areas; the [window frame tool](/tools/screenshot-window-frame) can place the image on a solid background.

## Can I record a menu being used instead?

Sometimes a still image is not enough: the steps are a chain of menus and submenus, or a hover reveals something that only makes sense in motion. A short screen recording shows it better.

1. Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd> and choose **Record Selected Portion**.
2. Draw the frame around the area where the menus will open.
3. In **Options**, turn on **Show Mouse Clicks** so viewers see each click.
4. Click **Record**, walk through the menus slowly, then stop with <kbd>Command</kbd>-<kbd>Control</kbd>-<kbd>Esc</kbd>.

Keep these clips short and trim the dead time at the start. See [how to record your screen on a Mac](/blog/record-screen-mac) and [how to trim a screen recording](/blog/trim-screen-recording-mac).

## How do I make menu screenshots clear for documentation?

Menus are small, so a little markup goes a long way:

- **Crop tightly** so the menu fills the image.
- **Add a box or arrow** around the item you want people to click.
- **Number the steps** when a task involves several menus in a row.

The free [screenshot editor](/editor) does all three in your browser. [Screenmac](/download) opens the same editor after each capture you take with its own shortcuts. For more capture methods, see [how to take a screenshot on a Mac](/blog/how-to-screenshot-on-mac).
