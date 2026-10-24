import AVFoundation
import SwiftUI

struct SettingsView: View {
    @ObservedObject var model: AppModel
    @ObservedObject var preferences: Preferences

    var body: some View {
        TabView {
            GeneralSettings(model: model, preferences: preferences)
                .tabItem { Label("General", systemImage: "gearshape") }
            CaptureSettings(preferences: preferences)
                .tabItem { Label("Capture", systemImage: "camera.viewfinder") }
            ShortcutSettings(model: model, preferences: preferences)
                .tabItem { Label("Shortcuts", systemImage: "command") }
            RecordingSettings(preferences: preferences)
                .tabItem { Label("Recording", systemImage: "record.circle") }
        }
        .padding(20)
        .frame(width: 620, height: 500)
    }
}

private struct GeneralSettings: View {
    @ObservedObject var model: AppModel
    @ObservedObject var preferences: Preferences

    var body: some View {
        Form {
            Section("After capture") {
                Toggle("Show Quick Access preview", isOn: $preferences.showQuickAccess)
                Picker("Preview position", selection: $preferences.quickAccessCorner) {
                    ForEach(QuickAccessCorner.allCases) { Text($0.label).tag($0) }
                }
                .disabled(!preferences.showQuickAccess)
                Picker("Dismiss preview after", selection: $preferences.quickAccessDismissSeconds) {
                    Text("5 seconds").tag(5)
                    Text("10 seconds").tag(10)
                    Text("30 seconds").tag(30)
                    Text("Never").tag(0)
                }
                .disabled(!preferences.showQuickAccess)
                Toggle("Copy to clipboard automatically", isOn: $preferences.copyAfterCapture)
                Toggle("Also save a copy to the folder below", isOn: $preferences.autoSaveToFolder)
            }
            Section("Saving") {
                LabeledContent("Save folder") {
                    HStack {
                        Text(preferences.saveFolder.path)
                            .lineLimit(1)
                            .truncationMode(.middle)
                            .foregroundStyle(.secondary)
                        Button("Choose…") { chooseFolder() }
                    }
                }
                Picker("Format", selection: $preferences.imageFormat) {
                    ForEach(ImageFormat.allCases) { Text($0.displayName).tag($0) }
                }
                .pickerStyle(.segmented)
                LabeledContent("History") {
                    Button("Show in Finder") {
                        NSWorkspace.shared.activateFileViewerSelecting([model.history.paths.captures])
                    }
                }
            }
            Section("App") {
                Toggle("Open at login", isOn: Binding(get: { model.launchAtLogin }, set: { model.setLaunchAtLogin($0) }))
                LabeledContent("Screen Recording") {
                    HStack {
                        Text(model.hasScreenPermission ? "Allowed" : "Not allowed")
                            .foregroundStyle(model.hasScreenPermission ? Color.green : Color.orange)
                        if !model.hasScreenPermission {
                            Button("Open System Settings") { ScreenCapturer.openPrivacySettings() }
                        }
                        Button("Fix…") { model.fixScreenPermission() }
                            .help("Clears Screenmac's Screen Recording entry so macOS asks again. Use this if captures fail after an update or rebuild.")
                    }
                }
            }
        }
        .formStyle(.grouped)
        .onAppear { model.refreshPermission() }
    }

    private func chooseFolder() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.canCreateDirectories = true
        panel.directoryURL = preferences.saveFolder
        panel.prompt = "Use Folder"
        if panel.runModal() == .OK, let url = panel.url { preferences.saveFolder = url }
    }
}

private struct CaptureSettings: View {
    @ObservedObject var preferences: Preferences

    var body: some View {
        Form {
            Section("Screenshots") {
                Toggle("Include the pointer", isOn: $preferences.includeCursor)
                Toggle("Hide desktop icons", isOn: $preferences.hideDesktopIcons)
                Toggle("Remember the last selected area", isOn: $preferences.rememberSelection)
                Picker("Delay", selection: $preferences.captureDelay) {
                    Text("None").tag(0)
                    Text("3 seconds").tag(3)
                    Text("5 seconds").tag(5)
                    Text("10 seconds").tag(10)
                }
                Toggle("Play a sound", isOn: $preferences.playSound)
            }
            Section {
                Text("Window captures include the window's shadow and transparency, like macOS. Minimized windows and content an app protects from capture can't be captured.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
    }
}

private struct ShortcutSettings: View {
    @ObservedObject var model: AppModel
    @ObservedObject var preferences: Preferences

    var body: some View {
        Form {
            Section {
                ForEach(ShortcutAction.allCases) { action in
                    LabeledContent(action.label) {
                        VStack(alignment: .trailing, spacing: 4) {
                            ShortcutRecorder(action: action, preferences: preferences)
                            if let status = model.shortcutFailures[action] {
                                Text("Another app is using this shortcut (error \(status)). Pick a different one.")
                                    .font(.caption)
                                    .foregroundStyle(.orange)
                            }
                        }
                    }
                }
            } footer: {
                Text("Defaults add ⌥ to the macOS screenshot shortcuts, so both keep working. Click a shortcut, then press the new keys. Esc cancels, Delete clears.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
            Section {
                Button("Restore Defaults") { preferences.resetShortcuts() }
            }
        }
        .formStyle(.grouped)
    }
}

private struct RecordingSettings: View {
    @ObservedObject var preferences: Preferences
    @State private var micStatus = MicrophonePermission.status
    @State private var devices = MicrophonePermission.devices

    var body: some View {
        Form {
            Section("Video") {
                Picker("Frame rate", selection: $preferences.frameRate) {
                    Text("30 fps").tag(30)
                    Text("60 fps").tag(60)
                }
                .pickerStyle(.segmented)
                Toggle("Show the pointer", isOn: $preferences.recordCursor)
            }
            Section("Audio") {
                Toggle("Record microphone", isOn: $preferences.recordMicrophone)
                Picker("Microphone", selection: Binding(get: { preferences.microphoneID ?? "" }, set: { preferences.microphoneID = $0.isEmpty ? nil : $0 })) {
                    Text("System default").tag("")
                    ForEach(devices, id: \.uniqueID) { Text($0.localizedName).tag($0.uniqueID) }
                }
                .disabled(!preferences.recordMicrophone)
                if preferences.recordMicrophone && micStatus == .denied {
                    HStack {
                        Text("Microphone access is off for Screenmac.").foregroundStyle(.orange)
                        Button("Open System Settings") { MicrophonePermission.openPrivacySettings() }
                    }
                }
                Toggle("Record system audio", isOn: $preferences.recordSystemAudio)
                Text("System audio is saved as a separate track from the microphone. After each recording Screenmac tells you if audio was requested but none arrived.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
        .onAppear {
            micStatus = MicrophonePermission.status
            devices = MicrophonePermission.devices
        }
    }
}

/// Click, then press keys. Validates against macOS shortcuts and the other actions.
struct ShortcutRecorder: View {
    let action: ShortcutAction
    @ObservedObject var preferences: Preferences
    @State private var recording = false
    @State private var monitor: Any?
    @State private var error: String?

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            Button {
                recording ? stop() : start()
            } label: {
                Text(recording ? "Press keys…" : (preferences.shortcuts[action]?.displayString ?? "Not set"))
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .frame(minWidth: 110)
            }
            .buttonStyle(.bordered)
            .tint(recording ? .accentColor : nil)
            .accessibilityLabel("\(action.label) shortcut, \(preferences.shortcuts[action]?.displayString ?? "not set")")
            if let error {
                Text(error).font(.caption).foregroundStyle(.red)
            }
        }
        .onDisappear(perform: stop)
    }

    private func start() {
        error = nil
        recording = true
        monitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            handle(event)
            return nil
        }
    }

    private func stop() {
        recording = false
        if let monitor { NSEvent.removeMonitor(monitor) }
        monitor = nil
    }

    private func handle(_ event: NSEvent) {
        if event.keyCode == 53 { stop(); return } // Esc
        if event.keyCode == 51 || event.keyCode == 117 { // Delete clears
            preferences.shortcuts[action] = nil
            stop()
            return
        }
        let shortcut = Shortcut(keyCode: UInt32(event.keyCode), modifiers: event.modifierFlags)
        switch ShortcutRules.validate(shortcut, for: action, existing: preferences.shortcuts) {
        case .ok:
            preferences.shortcuts[action] = shortcut
            error = nil
            stop()
        case let problem:
            error = problem.message
        }
    }
}
