import AppKit
import Carbon.HIToolbox

/// A global keyboard shortcut: a virtual key code plus modifiers.
struct Shortcut: Codable, Hashable, Sendable {
    let keyCode: UInt32
    /// Raw value of `NSEvent.ModifierFlags`, limited to ⌘ ⌥ ⌃ ⇧.
    let modifiers: UInt

    static let relevantFlags: NSEvent.ModifierFlags = [.command, .option, .control, .shift]

    init(keyCode: UInt32, modifiers: NSEvent.ModifierFlags) {
        self.keyCode = keyCode
        self.modifiers = modifiers.intersection(Self.relevantFlags).rawValue
    }

    var flags: NSEvent.ModifierFlags { NSEvent.ModifierFlags(rawValue: modifiers) }

    /// Modifiers in Carbon's format for `RegisterEventHotKey`.
    var carbonModifiers: UInt32 {
        var result: UInt32 = 0
        if flags.contains(.command) { result |= UInt32(cmdKey) }
        if flags.contains(.option) { result |= UInt32(optionKey) }
        if flags.contains(.control) { result |= UInt32(controlKey) }
        if flags.contains(.shift) { result |= UInt32(shiftKey) }
        return result
    }

    /// e.g. "⌥⇧⌘4", in the order macOS displays modifiers.
    var displayString: String {
        var s = ""
        if flags.contains(.control) { s += "⌃" }
        if flags.contains(.option) { s += "⌥" }
        if flags.contains(.shift) { s += "⇧" }
        if flags.contains(.command) { s += "⌘" }
        return s + Self.keyName(keyCode)
    }

    static func keyName(_ code: UInt32) -> String {
        if let name = names[Int(code)] { return name }
        return "Key \(code)"
    }

    private static let names: [Int: String] = [
        kVK_ANSI_0: "0", kVK_ANSI_1: "1", kVK_ANSI_2: "2", kVK_ANSI_3: "3", kVK_ANSI_4: "4",
        kVK_ANSI_5: "5", kVK_ANSI_6: "6", kVK_ANSI_7: "7", kVK_ANSI_8: "8", kVK_ANSI_9: "9",
        kVK_ANSI_A: "A", kVK_ANSI_B: "B", kVK_ANSI_C: "C", kVK_ANSI_D: "D", kVK_ANSI_E: "E",
        kVK_ANSI_F: "F", kVK_ANSI_G: "G", kVK_ANSI_H: "H", kVK_ANSI_I: "I", kVK_ANSI_J: "J",
        kVK_ANSI_K: "K", kVK_ANSI_L: "L", kVK_ANSI_M: "M", kVK_ANSI_N: "N", kVK_ANSI_O: "O",
        kVK_ANSI_P: "P", kVK_ANSI_Q: "Q", kVK_ANSI_R: "R", kVK_ANSI_S: "S", kVK_ANSI_T: "T",
        kVK_ANSI_U: "U", kVK_ANSI_V: "V", kVK_ANSI_W: "W", kVK_ANSI_X: "X", kVK_ANSI_Y: "Y",
        kVK_ANSI_Z: "Z", kVK_Space: "Space", kVK_Return: "↩", kVK_Tab: "⇥", kVK_Escape: "⎋",
        kVK_F1: "F1", kVK_F2: "F2", kVK_F3: "F3", kVK_F4: "F4", kVK_F5: "F5", kVK_F6: "F6",
        kVK_F7: "F7", kVK_F8: "F8", kVK_F9: "F9", kVK_F10: "F10", kVK_F11: "F11", kVK_F12: "F12",
        kVK_ANSI_Minus: "-", kVK_ANSI_Equal: "=", kVK_ANSI_LeftBracket: "[", kVK_ANSI_RightBracket: "]",
        kVK_ANSI_Semicolon: ";", kVK_ANSI_Quote: "'", kVK_ANSI_Comma: ",", kVK_ANSI_Period: ".",
        kVK_ANSI_Slash: "/", kVK_ANSI_Backslash: "\\", kVK_ANSI_Grave: "`",
    ]
}

enum ShortcutAction: String, CaseIterable, Codable, Identifiable, Sendable {
    case captureArea, captureWindow, captureFullScreen, toggleRecording

    var id: String { rawValue }

    var label: String {
        switch self {
        case .captureArea: return "Capture Area"
        case .captureWindow: return "Capture Window"
        case .captureFullScreen: return "Capture Full Screen"
        case .toggleRecording: return "Start or Stop Recording"
        }
    }

    /// Defaults add ⌥ to the macOS screenshot shortcuts, so they never collide with them.
    var defaultShortcut: Shortcut {
        let mods: NSEvent.ModifierFlags = [.option, .shift, .command]
        switch self {
        case .captureArea: return Shortcut(keyCode: UInt32(kVK_ANSI_4), modifiers: mods)
        case .captureWindow: return Shortcut(keyCode: UInt32(kVK_ANSI_2), modifiers: mods)
        case .captureFullScreen: return Shortcut(keyCode: UInt32(kVK_ANSI_3), modifiers: mods)
        case .toggleRecording: return Shortcut(keyCode: UInt32(kVK_ANSI_5), modifiers: mods)
        }
    }
}

enum ShortcutValidation: Equatable {
    case ok
    case needsModifier
    case reservedBySystem(String)
    case duplicate(ShortcutAction)

    var message: String? {
        switch self {
        case .ok: return nil
        case .needsModifier: return "Use at least ⌘, ⌥, or ⌃ so normal typing isn't captured."
        case .reservedBySystem(let what): return "macOS already uses this for \(what)."
        case .duplicate(let action): return "Already used for \(action.label)."
        }
    }
}

enum ShortcutRules {
    /// Shortcuts macOS reserves by default. Registering over them either fails or never fires.
    static let reserved: [(Shortcut, String)] = [
        (Shortcut(keyCode: UInt32(kVK_ANSI_3), modifiers: [.shift, .command]), "screenshots"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_4), modifiers: [.shift, .command]), "screenshots"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_5), modifiers: [.shift, .command]), "the Screenshot toolbar"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_6), modifiers: [.shift, .command]), "Touch Bar screenshots"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_3), modifiers: [.control, .shift, .command]), "screenshots to the clipboard"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_4), modifiers: [.control, .shift, .command]), "screenshots to the clipboard"),
        (Shortcut(keyCode: UInt32(kVK_Space), modifiers: [.command]), "Spotlight"),
        (Shortcut(keyCode: UInt32(kVK_Space), modifiers: [.control]), "input sources"),
        (Shortcut(keyCode: UInt32(kVK_Tab), modifiers: [.command]), "switching apps"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_Q), modifiers: [.command]), "quitting apps"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_W), modifiers: [.command]), "closing windows"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_H), modifiers: [.command]), "hiding apps"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_M), modifiers: [.command]), "minimizing windows"),
        (Shortcut(keyCode: UInt32(kVK_ANSI_Q), modifiers: [.control, .command]), "locking the screen"),
        (Shortcut(keyCode: UInt32(kVK_Escape), modifiers: [.option, .command]), "Force Quit"),
    ]

    static func validate(_ shortcut: Shortcut, for action: ShortcutAction, existing: [ShortcutAction: Shortcut]) -> ShortcutValidation {
        let flags = shortcut.flags
        if !(flags.contains(.command) || flags.contains(.option) || flags.contains(.control)) { return .needsModifier }
        if let hit = reserved.first(where: { $0.0 == shortcut }) { return .reservedBySystem(hit.1) }
        if let other = existing.first(where: { $0.key != action && $0.value == shortcut })?.key { return .duplicate(other) }
        return .ok
    }
}
