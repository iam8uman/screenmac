import AppKit
import SwiftUI

@main
struct ScreenmacApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate

    var body: some Scene {
        MenuBarExtra {
            MenuBarContent(model: delegate.model)
        } label: {
            MenuBarLabel(model: delegate.model)
        }
        .menuBarExtraStyle(.menu)
    }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    let model = AppModel()

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Unit tests host the app; keep side effects (hotkeys, prompts) out of test runs.
        guard ProcessInfo.processInfo.environment["XCTestConfigurationFilePath"] == nil else { return }
        NSApp.setActivationPolicy(.accessory)
        model.start()
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag { model.openHistory() }
        return true
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }

    func applicationWillTerminate(_ notification: Notification) {
        model.hotkeys.unregisterAll()
    }
}

private struct MenuBarLabel: View {
    @ObservedObject var model: AppModel

    var body: some View {
        switch model.recordingState {
        case .recording(let paused):
            Image(systemName: paused ? "pause.circle.fill" : "record.circle.fill")
            Text(formatDuration(model.recordingElapsed)).monospacedDigit()
        case .preparing, .finishing:
            Image(systemName: "record.circle")
        case .idle:
            Image(systemName: "viewfinder")
        }
    }
}

struct MenuBarContent: View {
    @ObservedObject var model: AppModel
    @ObservedObject var preferences: Preferences

    init(model: AppModel) {
        self.model = model
        self.preferences = model.preferences
    }

    var body: some View {
        if case .recording(let paused) = model.recordingState {
            Text("Recording \(formatDuration(model.recordingElapsed))\(paused ? " (paused)" : "")")
            Button(paused ? "Resume Recording" : "Pause Recording") { model.togglePause() }
            Button("Stop Recording") { model.stopRecording() }
                .modifier(Hotkey(preferences.shortcuts[.toggleRecording]))
            Divider()
        }

        if !model.hasScreenPermission {
            Button("Allow Screen Recording…") { model.showOnboarding() }
            Divider()
        }

        Button("Capture Area") { model.captureArea() }
            .modifier(Hotkey(preferences.shortcuts[.captureArea]))
        Button("Capture Window") { model.captureWindow() }
            .modifier(Hotkey(preferences.shortcuts[.captureWindow]))
        Button("Capture Full Screen") { model.captureFullScreen() }
            .modifier(Hotkey(preferences.shortcuts[.captureFullScreen]))

        Divider()

        Menu("Record Screen") {
            Button("Record Area…") { model.startRecording(mode: .area) }
                .modifier(Hotkey(preferences.shortcuts[.toggleRecording]))
            Button("Record Window…") { model.startRecording(mode: .window) }
            Button("Record Full Screen") { model.startRecording(mode: .fullScreen) }
        }
        .disabled(model.recordingState != .idle)

        Divider()

        Button("Open Image in Editor…") { model.openImageFile() }
        Button("Capture History") { model.openHistory() }
        Button("Settings…") { model.openSettings() }
            .keyboardShortcut(",", modifiers: .command)

        Divider()

        Button("Quit Screenmac") { NSApp.terminate(nil) }
            .keyboardShortcut("q", modifiers: .command)
    }
}

/// Shows a global shortcut next to a menu item. The shortcut itself is handled by HotkeyCenter.
private struct Hotkey: ViewModifier {
    let shortcut: Shortcut?

    init(_ shortcut: Shortcut?) { self.shortcut = shortcut }

    func body(content: Content) -> some View {
        if let shortcut, let equivalent = shortcut.keyEquivalent {
            content.keyboardShortcut(equivalent, modifiers: shortcut.eventModifiers)
        } else {
            content
        }
    }
}

private extension Shortcut {
    var keyEquivalent: KeyEquivalent? {
        let name = Shortcut.keyName(keyCode)
        guard name.count == 1, let c = name.lowercased().first else { return nil }
        return KeyEquivalent(c)
    }

    var eventModifiers: EventModifiers {
        var m: EventModifiers = []
        if flags.contains(.command) { m.insert(.command) }
        if flags.contains(.option) { m.insert(.option) }
        if flags.contains(.control) { m.insert(.control) }
        if flags.contains(.shift) { m.insert(.shift) }
        return m
    }
}
