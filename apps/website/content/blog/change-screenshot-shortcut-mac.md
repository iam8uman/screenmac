---
title: "How to Change the Screenshot Shortcut on Mac"
slug: change-screenshot-shortcut-mac
description: "Change or turn off the Mac screenshot shortcuts in System Settings, Keyboard, Keyboard Shortcuts, Screenshots. How to pick keys that do not clash, restore the defaults, and run a capture app alongside."
publishedAt: 2026-11-17
type: how-to
tags:
  - keyboard-shortcuts
  - screenshots
primaryApp: screenmac
feature: tools/mac-screenshot-shortcuts
faq:
  - question: "How do I change the screenshot shortcut on a Mac?"
    answer: "Open System Settings, click Keyboard, then Keyboard Shortcuts, and select Screenshots. Double-click the current keys next to an action and press the new combination."
  - question: "How do I turn off a screenshot shortcut?"
    answer: "In the same Screenshots list, untick the checkbox next to the shortcut. This is useful when a capture app should use those keys instead."
  - question: "How do I reset the screenshot shortcuts?"
    answer: "In Keyboard Shortcuts, click Restore Defaults. Shift-Command-3, 4 and 5 come back."
  - question: "Why does my new shortcut not work?"
    answer: "Apple says a shortcut that another command or app already uses will not work. Pick a different combination, or change the other one."
  - question: "Can I make a single key take a screenshot?"
    answer: "A combination with modifier keys is more reliable. If your keyboard has spare function keys, you can assign one, but avoid keys apps use for other things."
sources:
  - title: "Apple Mac User Guide: Use macOS keyboard shortcuts"
    url: "https://support.apple.com/guide/mac-help/use-keyboard-shortcuts-mchlp2262/mac"
  - title: "Apple Mac User Guide: Take screenshots or screen recordings"
    url: "https://support.apple.com/guide/mac-help/take-screenshots-or-screen-recordings-mh26782/mac"
seoTitle: "Change the Screenshot Shortcut on Mac (or Turn It Off)"
seoDescription: "Change Mac screenshot shortcuts in System Settings, Keyboard, Keyboard Shortcuts, Screenshots. Avoid clashes, restore defaults, or hand the keys to an app."
draft: true
---
To change the screenshot shortcut on a Mac, open **System Settings → Keyboard → Keyboard Shortcuts**, select **Screenshots**, then **double-click** the keys next to the action you want to change and press the new combination. Untick an action to turn its shortcut off, or click **Restore Defaults** to get Shift-Command-3, 4 and 5 back.

## How do I change a screenshot shortcut?

1. Choose **Apple menu → System Settings**.
2. Click **Keyboard** in the sidebar. You may need to scroll.
3. Click **Keyboard Shortcuts**.
4. Select **Screenshots** in the list on the left.
5. Make sure the checkbox next to the action is ticked.
6. Double-click the current key combination and press the new one.
7. Click **Done**, then quit and reopen any apps that need to notice the change.

Apple notes that each type of key can appear only once in a combination, so you cannot use Shift twice.

## Which screenshot actions can I change?

The Screenshots section lists the built-in actions, with their defaults:

| Action | Default |
| --- | --- |
| Save picture of screen as a file | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>3</kbd> |
| Copy picture of screen to the clipboard | <kbd>Control</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>3</kbd> |
| Save picture of selected area as a file | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> |
| Copy picture of selected area to the clipboard | <kbd>Control</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> |
| Screenshot and recording options | <kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>5</kbd> |

The exact wording can vary between macOS versions. If you forget what a default does, the [screenshot shortcut finder](/tools/mac-screenshot-shortcuts) shows it.

## How do I choose keys that will not clash?

Apple says that if a new shortcut is already used by another command or app, it will not work. To avoid clashes:

- **Keep Command and Shift** in the combination; few apps use Shift-Command with numbers.
- **Avoid common app shortcuts** such as Command-S, Command-P or Command-Shift-S.
- **Check your other utilities.** Clipboard managers, launchers and capture apps often register global shortcuts.

If an app's shortcut clashes with a macOS one, Apple's advice is to turn off the macOS shortcut so the app's version works.

## Which keys work well as screenshot shortcuts?

A good screenshot shortcut is easy to press with one hand, hard to press by accident, and unused by the apps you rely on. Some patterns that tend to work:

- **Keep the number keys.** The defaults use 3, 4 and 5, which sit together and rarely mean anything inside apps when combined with Shift and Command.
- **Add a modifier rather than replacing one.** Adding Option or Control to a default is easier to remember than a new set of keys.
- **Use spare function keys carefully.** If your keyboard has a function key you never use, it can make a fast shortcut with one modifier. Check that your apps do not already rely on it.
- **Write it down.** Once you change the defaults, guides and colleagues' tips no longer match your Mac.

If you share a Mac or help other people with theirs, consider leaving the defaults alone and changing a capture app's shortcuts instead, so the standard instructions keep working for everyone.

## How do I let a capture app use Shift-Command-4?

Some people want a third-party app on the familiar keys:

1. Untick the built-in actions you want to free up.
2. In the capture app's settings, record Shift-Command-4 (or whichever you freed) for its area capture.

The alternative is to leave the built-in shortcuts alone and give the app different keys. Screenmac does this by default: its shortcuts add Option (<kbd>Option</kbd>-<kbd>Shift</kbd>-<kbd>Command</kbd>-<kbd>4</kbd> for an area, <kbd>2</kbd> for a window, <kbd>3</kbd> for the full screen, <kbd>5</kbd> to record), so both sets work side by side. [Download Screenmac](/download) if you want that setup.

## What if screenshots stop working after I change the shortcut?

- **Check the checkbox** next to the action is still ticked.
- **Try the new keys in another app.** If they work there, the first app is using the same combination.
- **Click Restore Defaults** to start over.
- **Open Screenshot from Applications → Utilities** to capture without any shortcut while you sort it out.

More fixes are in [Mac screenshot not working](/blog/mac-screenshot-not-working). For what each default shortcut captures, see [how to take a screenshot on a Mac](/blog/how-to-screenshot-on-mac).
