import AppKit
import Combine

enum QuickAccessCorner: String, CaseIterable, Identifiable, Sendable {
    case bottomRight, bottomLeft, topRight, topLeft
    var id: String { rawValue }
    var label: String {
        switch self {
        case .bottomRight: return "Bottom right"
        case .bottomLeft: return "Bottom left"
        case .topRight: return "Top right"
        case .topLeft: return "Top left"
        }
    }
}

/// User preferences, persisted in UserDefaults.
@MainActor
final class Preferences: ObservableObject {
    private let defaults: UserDefaults

    @Published var imageFormat: ImageFormat { didSet { defaults.set(imageFormat.rawValue, forKey: K.format) } }
    @Published var saveFolder: URL { didSet { defaults.set(saveFolder.path, forKey: K.folder) } }
    @Published var autoSaveToFolder: Bool { didSet { defaults.set(autoSaveToFolder, forKey: K.autoSave) } }
    @Published var copyAfterCapture: Bool { didSet { defaults.set(copyAfterCapture, forKey: K.copy) } }
    @Published var showQuickAccess: Bool { didSet { defaults.set(showQuickAccess, forKey: K.quickAccess) } }
    @Published var quickAccessDismissSeconds: Int { didSet { defaults.set(quickAccessDismissSeconds, forKey: K.dismiss) } }
    @Published var quickAccessCorner: QuickAccessCorner { didSet { defaults.set(quickAccessCorner.rawValue, forKey: K.corner) } }
    @Published var includeCursor: Bool { didSet { defaults.set(includeCursor, forKey: K.cursor) } }
    @Published var captureDelay: Int { didSet { defaults.set(captureDelay, forKey: K.delay) } }
    @Published var playSound: Bool { didSet { defaults.set(playSound, forKey: K.sound) } }
    @Published var hideDesktopIcons: Bool { didSet { defaults.set(hideDesktopIcons, forKey: K.hideIcons) } }
    @Published var rememberSelection: Bool { didSet { defaults.set(rememberSelection, forKey: K.remember) } }
    @Published var lastSelection: CGRect? {
        didSet {
            if let r = lastSelection { defaults.set(NSStringFromRect(r), forKey: K.lastSelection) } else { defaults.removeObject(forKey: K.lastSelection) }
        }
    }
    @Published var recordMicrophone: Bool { didSet { defaults.set(recordMicrophone, forKey: K.mic) } }
    @Published var microphoneID: String? { didSet { defaults.set(microphoneID, forKey: K.micID) } }
    @Published var recordSystemAudio: Bool { didSet { defaults.set(recordSystemAudio, forKey: K.systemAudio) } }
    @Published var recordCursor: Bool { didSet { defaults.set(recordCursor, forKey: K.recordCursor) } }
    @Published var frameRate: Int { didSet { defaults.set(frameRate, forKey: K.fps) } }
    @Published var shortcuts: [ShortcutAction: Shortcut] {
        didSet {
            let encoded = Dictionary(uniqueKeysWithValues: shortcuts.map { ($0.key.rawValue, $0.value) })
            defaults.set(try? JSONEncoder().encode(encoded), forKey: K.shortcuts)
        }
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let desktop = FileManager.default.urls(for: .desktopDirectory, in: .userDomainMask).first
            ?? FileManager.default.homeDirectoryForCurrentUser
        imageFormat = ImageFormat(rawValue: defaults.string(forKey: K.format) ?? "") ?? .png
        saveFolder = defaults.string(forKey: K.folder).map { URL(fileURLWithPath: $0, isDirectory: true) } ?? desktop
        autoSaveToFolder = defaults.object(forKey: K.autoSave) as? Bool ?? false
        copyAfterCapture = defaults.object(forKey: K.copy) as? Bool ?? false
        showQuickAccess = defaults.object(forKey: K.quickAccess) as? Bool ?? true
        quickAccessDismissSeconds = defaults.object(forKey: K.dismiss) as? Int ?? 10
        quickAccessCorner = QuickAccessCorner(rawValue: defaults.string(forKey: K.corner) ?? "") ?? .bottomRight
        includeCursor = defaults.object(forKey: K.cursor) as? Bool ?? false
        captureDelay = defaults.object(forKey: K.delay) as? Int ?? 0
        playSound = defaults.object(forKey: K.sound) as? Bool ?? true
        hideDesktopIcons = defaults.object(forKey: K.hideIcons) as? Bool ?? false
        rememberSelection = defaults.object(forKey: K.remember) as? Bool ?? false
        lastSelection = defaults.string(forKey: K.lastSelection).map { NSRectFromString($0) }
        recordMicrophone = defaults.object(forKey: K.mic) as? Bool ?? false
        microphoneID = defaults.string(forKey: K.micID)
        recordSystemAudio = defaults.object(forKey: K.systemAudio) as? Bool ?? false
        recordCursor = defaults.object(forKey: K.recordCursor) as? Bool ?? true
        frameRate = defaults.object(forKey: K.fps) as? Int ?? 30

        var loaded: [ShortcutAction: Shortcut] = [:]
        if let data = defaults.data(forKey: K.shortcuts),
           let decoded = try? JSONDecoder().decode([String: Shortcut].self, from: data) {
            for (key, value) in decoded { if let action = ShortcutAction(rawValue: key) { loaded[action] = value } }
        } else {
            for action in ShortcutAction.allCases { loaded[action] = action.defaultShortcut }
        }
        shortcuts = loaded
    }

    func resetShortcuts() {
        shortcuts = Dictionary(uniqueKeysWithValues: ShortcutAction.allCases.map { ($0, $0.defaultShortcut) })
    }

    private enum K {
        static let format = "sm.imageFormat"
        static let folder = "sm.saveFolder"
        static let autoSave = "sm.autoSave"
        static let copy = "sm.copyAfterCapture"
        static let quickAccess = "sm.showQuickAccess"
        static let dismiss = "sm.quickAccessDismiss"
        static let corner = "sm.quickAccessCorner"
        static let cursor = "sm.includeCursor"
        static let delay = "sm.captureDelay"
        static let sound = "sm.playSound"
        static let hideIcons = "sm.hideDesktopIcons"
        static let remember = "sm.rememberSelection"
        static let lastSelection = "sm.lastSelection"
        static let mic = "sm.recordMicrophone"
        static let micID = "sm.microphoneID"
        static let systemAudio = "sm.recordSystemAudio"
        static let recordCursor = "sm.recordCursor"
        static let fps = "sm.frameRate"
        static let shortcuts = "sm.shortcuts"
    }
}
