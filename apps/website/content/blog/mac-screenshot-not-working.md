---
title: "Mac Screenshot Not Working? Fixes That Work"
slug: mac-screenshot-not-working
description: "When Shift-Command-3, 4 or 5 does nothing, or screenshots come out blank or vanish, work through these checks: shortcut settings, conflicts, the save folder, app restrictions and permissions."
publishedAt: 2026-11-17
type: troubleshooting
tags:
  - troubleshooting
  - screenshots
primaryApp: screenmac
feature: tools/mac-screenshot-shortcuts
faq:
  - question: "Why is Shift-Command-4 not working on my Mac?"
    answer: "The shortcut may be turned off or reassigned in System Settings, under Keyboard, Keyboard Shortcuts, Screenshots, or another app may be using the same keys. Turn the shortcut back on, or click Restore Defaults."
  - question: "Why does my screenshot take but not save?"
    answer: "Check the Save to setting in the Screenshot app's Options menu. If it is set to the clipboard or an app, no file is created, and if it points to a folder that was moved or deleted, macOS has nowhere to save."
  - question: "Why is part of my screenshot black?"
    answer: "Some apps, such as the Apple TV app, do not allow their windows to be captured, so that area comes out blank. This is deliberate and cannot be changed in settings."
  - question: "My screenshot app stopped working after a macOS update. What do I do?"
    answer: "Third-party capture apps need Screen and System Audio Recording permission in Privacy and Security. Turn it off and on again for the app, then quit and reopen the app."
  - question: "Is there a way to take a screenshot if the keyboard shortcuts are broken?"
    answer: "Yes. Open Screenshot from Applications, then Utilities, and use the toolbar buttons. It works without any keyboard shortcut."
sources:
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
  - title: "Apple Mac User Guide: Use macOS keyboard shortcuts"
    url: "https://support.apple.com/guide/mac-help/use-keyboard-shortcuts-mchlp2262/mac"
  - title: "Apple Support: How to take a screenshot on your Mac"
    url: "https://support.apple.com/en-us/102646"
  - title: "Apple Mac User Guide: Control access to screen and system audio recording"
    url: "https://support.apple.com/guide/mac-help/control-access-screen-system-audio-recording-mchld6aa7d23/mac"
seoTitle: "Mac Screenshot Not Working? Fixes to Try in Order"
seoDescription: "Shift-Command-4 doing nothing, or screenshots not saving? Check the shortcut settings, conflicts, the Save to folder, app restrictions and permissions."
draft: false
---
If screenshots are not working on your Mac, the cause is usually one of three things: the shortcut has been turned off or taken over by another app, the **Save to** folder in the Screenshot app's Options no longer exists, or the app you are capturing blocks screenshots. Check **System Settings → Keyboard → Keyboard Shortcuts → Screenshots** first, then press **Shift-Command-5** and look at **Options → Save to**.

Work through the fixes below in order. Each one takes under a minute.

## Is the screenshot shortcut turned on?

macOS lets you turn each screenshot shortcut off or change its keys, and a cleanup app or a past experiment may have done so.

1. Open **Apple menu → System Settings**.
2. Click **Keyboard** in the sidebar, then **Keyboard Shortcuts**.
3. Select **Screenshots**.
4. Make sure each shortcut you use has a tick, and check the keys next to it.
5. If anything looks wrong, click **Restore Defaults**.

Apple notes that after changing a shortcut you may need to quit and reopen apps for it to take effect.

## Is another app using the same keys?

If two commands share a shortcut, Apple says the new one will not work. Apps that commonly grab screenshot-style shortcuts include other capture tools, clipboard managers, launchers and some games.

- Quit apps one at a time and try <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> after each.
- When you find the culprit, change the shortcut in that app's settings, or turn off the macOS one if you prefer the app's version.

Capture apps can avoid this entirely by using different keys. Screenmac, for example, adds Option to the built-in shortcuts (<kbd>Option</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> for an area) so both sets work side by side.

## Does the screenshot work but the file never appears?

Press <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd>, click **Options**, and look under **Save to**:

- **Clipboard** is ticked: screenshots are copied, not saved. Paste with <kbd>Command</kbd>-<kbd>V</kbd>.
- **Mail, Messages or Preview** is ticked: the screenshot opens in that app instead of being saved.
- **A folder you picked** is ticked: if it was renamed, moved or lived on an external drive that is no longer connected, choose it again or pick Desktop.

Also check you did not hold <kbd>Control</kbd>, which sends that one capture to the clipboard. Our guide to [where screenshots go](/blog/where-do-screenshots-go-mac) covers the other places captures hide, and [changing the save location](/blog/change-screenshot-location-mac) shows how to reset it.

## Why is the screenshot black or missing a window?

Apple's guide notes that some apps, such as the Apple TV app, do not allow screenshots of their windows. Protected video and some secure input fields come out black or are left out. That is the app's choice and no setting overrides it.

If **every** capture is black, including the desktop, restart the Mac. If only a third-party capture app gives black images, see the next section.

## Why does my screenshot app not capture anything?

Built-in screenshots do not need permission, but third-party apps do. macOS asks before any app can see your screen.

1. Open **System Settings → Privacy & Security**.
2. Click **Screen & System Audio Recording**.
3. Find the app and turn it on. If it is already on, turn it off and on again.
4. Quit and reopen the app.

If the app is not listed, click the **Add (+)** button and select it from Applications. Our step-by-step guide to the [screen recording permission](/blog/screen-recording-permission-mac) covers updates and stuck permissions. Screenmac also has a **Fix Screen Recording Permission** item in its menu bar menu that resets its own entry so macOS asks again.

## What if nothing else works?

| Symptom | Try |
| --- | --- |
| No crosshair appears at all | Open Screenshot from Applications → Utilities and use the toolbar |
| Shortcut works only in some apps | That app may block capture, or use the same keys itself |
| Thumbnail appears, file does not | Save to setting, or the folder is missing |
| Everything worked until today | Restart the Mac, then Restore Defaults in Keyboard Shortcuts |
| Touch Bar screenshot needed | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>6</kbd> captures the Touch Bar |

The Screenshot app in **Applications → Utilities** does not rely on any shortcut, so it is a useful way to tell a keyboard problem from a capture problem. If it works, the issue is the shortcut; if it does not, the issue is with saving or the app you are capturing.

If you are not sure which keys do what, the [screenshot shortcut finder](/tools/mac-screenshot-shortcuts) gives the exact combination for each capture type. For more fixes, browse the [troubleshooting guides](/blog/topics/troubleshooting).
