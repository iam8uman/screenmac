import AppKit
import AVFoundation
import Combine
import ScreenCaptureKit
import ServiceManagement
import UniformTypeIdentifiers

/// The app's single source of truth: owns services and routes every user action.
@MainActor
final class AppModel: ObservableObject {
    let preferences = Preferences()
    let history = HistoryStore()
    let capturer = ScreenCapturer()
    let hotkeys = HotkeyCenter()
    lazy var quickAccess = QuickAccessController(preferences: preferences)
    let windows = WindowManager()

    enum RecordingState: Equatable {
        case idle
        case preparing
        case recording(paused: Bool)
        case finishing
    }

    @Published private(set) var recordingState: RecordingState = .idle
    @Published private(set) var recordingElapsed: TimeInterval = 0
    @Published private(set) var isCapturing = false
    @Published private(set) var shortcutFailures: [ShortcutAction: OSStatus] = [:]
    @Published var hasScreenPermission = ScreenCapturer.hasPermission

    private var session: RecordingSession?
    private var recordingTimer: Timer?
    private var recordingHUD: RecordingHUD?
    private var cancellables: Set<AnyCancellable> = []

    func start() {
        quickAccess.actions = QuickAccessActions(
            annotate: { [weak self] item in self?.openEditor(for: item) },
            copy: { [weak self] item in self?.copy(item) },
            save: { [weak self] item in self?.saveToFolder(item) },
            reveal: { item in NSWorkspace.shared.activateFileViewerSelecting([item.url]) },
            delete: { [weak self] item in
                self?.history.delete(item)
                self?.quickAccess.dismiss(item.id)
            }
        )
        hotkeys.start { [weak self] action in self?.perform(action) }
        registerShortcuts()
        preferences.$shortcuts
            .dropFirst()
            .sink { [weak self] _ in DispatchQueue.main.async { self?.registerShortcuts() } }
            .store(in: &cancellables)

        if !ScreenCapturer.hasPermission {
            showOnboarding()
        }
    }

    func registerShortcuts() {
        shortcutFailures = hotkeys.register(preferences.shortcuts)
    }

    func perform(_ action: ShortcutAction) {
        switch action {
        case .captureArea: captureArea()
        case .captureWindow: captureWindow()
        case .captureFullScreen: captureFullScreen()
        case .toggleRecording: toggleRecording()
        }
    }

    // MARK: - Permissions

    /// Set when ScreenCaptureKit refused even though the preflight check passed
    /// (for example after a rebuild changed the app's signature). Cleared by a successful capture.
    private var captureDeclined = false

    func refreshPermission() {
        hasScreenPermission = ScreenCapturer.hasPermission && !captureDeclined
    }

    /// Returns true if capture can proceed. Otherwise explains what to do; never fakes a capture.
    private func ensureScreenPermission() -> Bool {
        refreshPermission()
        if hasScreenPermission { return true }
        ScreenCapturer.requestPermission()
        showOnboarding()
        return false
    }

    func showOnboarding() {
        windows.showOnboarding(model: self)
    }

    // MARK: - Screenshots

    func captureArea() { Task { await runCapture(mode: .area) } }
    func captureWindow() { Task { await runCapture(mode: .window) } }
    func captureFullScreen() { Task { await runFullScreen() } }

    private func runCapture(mode: SelectionMode) async {
        guard !isCapturing, recordingState == .idle || mode == .area else { return }
        guard ensureScreenPermission() else { return }
        isCapturing = true
        defer { isCapturing = false }
        do {
            try await countdownIfNeeded()
            let content = try await capturer.content()
            let snapshots = try await capturer.snapshotDisplays(includeCursor: preferences.includeCursor, hideDesktopIcons: preferences.hideDesktopIcons)
            let overlay = SelectionOverlayController(
                snapshots: snapshots,
                windows: capturer.pickableWindows(in: content),
                mode: mode,
                purpose: .screenshot,
                initialSelection: preferences.rememberSelection ? preferences.lastSelection : nil
            )
            switch await overlay.run() {
            case .cancelled:
                return
            case .area(let snapshot, let rect):
                guard let image = ImageEncoding.crop(snapshot.image, to: Geometry.pixelRect(for: rect, scale: snapshot.scale)) else {
                    throw CaptureError.failed("The selected area was empty.")
                }
                if preferences.rememberSelection {
                    let f = snapshot.screen.frame
                    preferences.lastSelection = CGRect(x: f.minX + rect.minX, y: f.maxY - rect.maxY, width: rect.width, height: rect.height)
                }
                deliver(image, screen: snapshot.screen)
            case .window(let window):
                let image = try await capturer.capture(window: window, includeCursor: false)
                deliver(image, screen: NSScreen.underPointer)
            }
        } catch {
            present(error)
        }
    }

    private func runFullScreen() async {
        guard !isCapturing else { return }
        guard ensureScreenPermission() else { return }
        isCapturing = true
        defer { isCapturing = false }
        do {
            try await countdownIfNeeded()
            let screen = NSScreen.underPointer
            let snapshots = try await capturer.snapshotDisplays(only: screen, includeCursor: preferences.includeCursor, hideDesktopIcons: preferences.hideDesktopIcons)
            guard let snapshot = snapshots.first else { throw CaptureError.noDisplays }
            deliver(snapshot.image, screen: snapshot.screen)
        } catch {
            present(error)
        }
    }

    private func countdownIfNeeded() async throws {
        let seconds = preferences.captureDelay
        guard seconds > 0 else { return }
        let hud = CountdownHUD()
        for remaining in stride(from: seconds, to: 0, by: -1) {
            hud.show(remaining, on: NSScreen.underPointer)
            try await Task.sleep(nanoseconds: 1_000_000_000)
        }
        hud.close()
        // Let the HUD disappear from the screen before capturing.
        try await Task.sleep(nanoseconds: 120_000_000)
    }

    /// Store a finished screenshot and run the after-capture actions.
    private func deliver(_ image: CGImage, screen: NSScreen?) {
        captureDeclined = false
        hasScreenPermission = true
        if preferences.playSound { CaptureSound.play() }
        let item: HistoryItem
        do {
            item = try history.addScreenshot(image, format: preferences.imageFormat)
        } catch {
            present(error, title: "The capture couldn't be saved")
            return
        }
        if preferences.copyAfterCapture { Pasteboard.copy(image) }
        if preferences.autoSaveToFolder { saveToFolder(item, quiet: true) }
        if preferences.showQuickAccess {
            let thumb = ImageEncoding.thumbnail(of: image, maxEdge: 720).map { NSImage(cgImage: $0, size: CGSize(width: $0.width, height: $0.height)) }
                ?? NSImage(cgImage: image, size: CGSize(width: image.width, height: image.height))
            quickAccess.show(item, thumbnail: thumb, on: screen)
        } else if !preferences.copyAfterCapture && !preferences.autoSaveToFolder {
            // With every after-capture action off, open the editor so the capture isn't lost from view.
            openEditor(for: item)
        }
    }

    // MARK: - Item actions

    func openEditor(for item: HistoryItem) {
        guard item.kind == .screenshot else {
            NSWorkspace.shared.open(item.url)
            return
        }
        do {
            let image = try ImageEncoding.load(item.url)
            let ppp = (item.pixelWidth != nil) ? (NSScreen.underPointer?.backingScaleFactor ?? 2) : 1
            windows.openEditor(image: image, sourceURL: item.url, title: item.displayName, pixelsPerPoint: ppp, preferences: preferences)
            quickAccess.dismiss(item.id)
        } catch {
            present(error, title: "The capture couldn't be opened")
        }
    }

    func openImageFile() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.png, .jpeg, .tiff, .heic, .gif, .bmp]
        panel.allowsMultipleSelection = false
        NSApp.activate(ignoringOtherApps: true)
        guard panel.runModal() == .OK, let url = panel.url else { return }
        do {
            let image = try ImageEncoding.load(url)
            windows.openEditor(image: image, sourceURL: url, title: url.lastPathComponent, pixelsPerPoint: 1, preferences: preferences)
        } catch {
            present(error)
        }
    }

    func copy(_ item: HistoryItem) {
        guard item.fileExists else {
            present(message: "The file was moved or deleted.", title: "Can't copy")
            return
        }
        let ok: Bool
        if item.kind == .screenshot, let image = try? ImageEncoding.load(item.url) {
            ok = Pasteboard.copy(image)
        } else {
            ok = Pasteboard.copyFile(item.url)
        }
        if ok { quickAccess.flash(item.id, "Copied") } else { present(message: "The clipboard didn't accept the image.", title: "Can't copy") }
    }

    func saveToFolder(_ item: HistoryItem, quiet: Bool = false) {
        let folder = preferences.saveFolder
        do {
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
            let destination = FileNaming.uniqueURL(in: folder, base: item.url.deletingPathExtension().lastPathComponent, ext: item.url.pathExtension)
            try FileManager.default.copyItem(at: item.url, to: destination)
            if !quiet { quickAccess.flash(item.id, "Saved to \(folder.lastPathComponent)") }
        } catch {
            present(error, title: "Couldn't save to \(folder.lastPathComponent)")
        }
    }

    // MARK: - Recording

    var isRecording: Bool {
        if case .recording = recordingState { return true }
        return false
    }

    func toggleRecording() {
        switch recordingState {
        case .idle: startRecordingFlow(mode: .area)
        case .recording: stopRecording()
        default: break
        }
    }

    func startRecording(mode: RecordingMenuMode) {
        guard recordingState == .idle else { return }
        switch mode {
        case .fullScreen: startRecordingFlow(mode: nil)
        case .area: startRecordingFlow(mode: .area)
        case .window: startRecordingFlow(mode: .window)
        }
    }

    enum RecordingMenuMode { case fullScreen, area, window }

    /// `mode == nil` records the display under the pointer.
    private func startRecordingFlow(mode: SelectionMode?) {
        guard recordingState == .idle, ensureScreenPermission() else { return }
        recordingState = .preparing
        Task {
            do {
                var options = RecordingOptions()
                options.frameRate = preferences.frameRate
                options.showsCursor = preferences.recordCursor
                options.systemAudio = preferences.recordSystemAudio
                options.microphoneID = preferences.microphoneID
                if preferences.recordMicrophone {
                    if await MicrophonePermission.request() {
                        options.microphone = true
                    } else if !confirmRecordWithoutMicrophone() {
                        recordingState = .idle
                        return
                    }
                }

                let content = try await capturer.content()
                let target: RecordingTarget
                if let mode {
                    let snapshots = try await capturer.snapshotDisplays(includeCursor: false, hideDesktopIcons: false)
                    let overlay = SelectionOverlayController(snapshots: snapshots, windows: capturer.pickableWindows(in: content),
                                                             mode: mode, purpose: .recording, initialSelection: nil)
                    switch await overlay.run() {
                    case .cancelled:
                        recordingState = .idle
                        return
                    case .area(let snapshot, let rect):
                        target = .area(snapshot.display, rect: rect)
                    case .window(let window):
                        target = .window(window)
                    }
                } else {
                    guard let id = NSScreen.underPointer?.displayID, let display = content.displays.first(where: { $0.displayID == id }) ?? content.displays.first else {
                        throw CaptureError.noDisplays
                    }
                    target = .display(display)
                }

                try history.paths.ensureDirectories()
                let url = FileNaming.uniqueURL(in: history.paths.captures, base: FileNaming.baseName(prefix: "Screenmac Recording"), ext: "mp4")
                let session = RecordingSession(url: url, options: options)
                // AppModel lives for the whole app run, so a strong capture here is fine.
                session.onUnexpectedStop = { _ in
                    guard self.isRecording else { return }
                    self.stopRecording(reason: "Recording was stopped by macOS.")
                }
                let ownApp = content.applications.first { $0.processID == ProcessInfo.processInfo.processIdentifier }
                try await session.start(target: target, excludingWindowsOf: ownApp)
                self.session = session
                recordingState = .recording(paused: false)
                recordingElapsed = 0
                showRecordingHUD()
                recordingTimer = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { _ in
                    MainActor.assumeIsolated {
                        guard let session = self.session else { return }
                        self.recordingElapsed = session.elapsed()
                    }
                }
            } catch {
                recordingState = .idle
                present(error, title: "Recording couldn't start")
            }
        }
    }

    func togglePause() {
        guard let session, case .recording(let paused) = recordingState else { return }
        if paused { session.resume() } else { session.pause() }
        recordingState = .recording(paused: !paused)
    }

    func stopRecording(reason: String? = nil) {
        guard let session, isRecording else { return }
        recordingState = .finishing
        recordingTimer?.invalidate()
        recordingTimer = nil
        recordingHUD?.close()
        recordingHUD = nil
        Task {
            defer {
                self.session = nil
                self.recordingState = .idle
            }
            do {
                let result = try await session.stop()
                let item = HistoryItem(
                    id: UUID(), kind: .recording, createdAt: Date(), filePath: result.url.path, thumbnailPath: nil,
                    format: "mp4", fileSize: history.fileSize(at: result.url), pixelWidth: Int(result.size.width),
                    pixelHeight: Int(result.size.height), duration: result.duration,
                    hasAudio: result.hasMicrophoneAudio || result.hasSystemAudio
                )
                var stored = item
                let thumbnail = await Self.videoThumbnail(result.url)
                if let thumbnail, let cg = thumbnail.cgImage(forProposedRect: nil, context: nil, hints: nil) {
                    let thumbURL = history.paths.thumbnailURL(id: item.id)
                    if (try? ImageEncoding.write(cg, to: thumbURL, format: .png)) != nil { stored.thumbnailPath = thumbURL.path }
                }
                history.add(stored)
                if preferences.autoSaveToFolder { saveToFolder(stored, quiet: true) }
                quickAccess.show(stored, thumbnail: thumbnail ?? NSImage(systemSymbolName: "video", accessibilityDescription: nil) ?? NSImage(), on: NSScreen.underPointer)
                if result.microphoneMissing {
                    present(message: "The recording was saved without microphone audio: no audio arrived from the microphone. Check the input device in Settings → Recording, and that Screenmac is allowed in System Settings → Privacy & Security → Microphone.",
                            title: "No microphone audio")
                } else if let reason {
                    present(message: "\(reason) What was recorded so far has been saved.", title: "Recording stopped")
                }
            } catch {
                present(error, title: "The recording couldn't be saved")
            }
        }
    }

    private func showRecordingHUD() {
        let hud = RecordingHUD(model: self)
        hud.show(on: NSScreen.underPointer)
        recordingHUD = hud
    }

    private func confirmRecordWithoutMicrophone() -> Bool {
        NSApp.activate(ignoringOtherApps: true)
        let alert = NSAlert()
        alert.messageText = "Microphone access is off"
        alert.informativeText = "Screenmac can't hear the microphone. You can record without it, or allow access in System Settings → Privacy & Security → Microphone."
        alert.addButton(withTitle: "Record Without Microphone")
        alert.addButton(withTitle: "Open System Settings")
        alert.addButton(withTitle: "Cancel")
        switch alert.runModal() {
        case .alertFirstButtonReturn: return true
        case .alertSecondButtonReturn:
            MicrophonePermission.openPrivacySettings()
            return false
        default: return false
        }
    }

    private static func videoThumbnail(_ url: URL) async -> NSImage? {
        let generator = AVAssetImageGenerator(asset: AVURLAsset(url: url))
        generator.appliesPreferredTrackTransform = true
        generator.maximumSize = CGSize(width: 720, height: 720)
        guard let result = try? await generator.image(at: .zero) else { return nil }
        let image = result.image
        return NSImage(cgImage: image, size: CGSize(width: image.width, height: image.height))
    }

    // MARK: - Windows

    func openHistory() {
        windows.showHistory(store: history, actions: HistoryActions(
            open: { [weak self] item in self?.openEditor(for: item) },
            copy: { [weak self] item in self?.copy(item) }
        ))
    }

    func openSettings() {
        windows.showSettings(model: self)
    }

    // MARK: - Launch at login

    var launchAtLogin: Bool {
        SMAppService.mainApp.status == .enabled
    }

    func setLaunchAtLogin(_ enabled: Bool) {
        do {
            if enabled { try SMAppService.mainApp.register() } else { try SMAppService.mainApp.unregister() }
        } catch {
            present(message: "macOS didn't allow this change: \(error.localizedDescription). Moving Screenmac to the Applications folder usually fixes it.",
                    title: "Couldn't change Open at Login")
        }
        objectWillChange.send()
    }

    // MARK: - Errors

    func present(_ error: Error, title: String = "Screenmac") {
        if case .permissionDenied = CaptureError.from(error) {
            captureDeclined = true
            hasScreenPermission = false
            showOnboarding()
            return
        }
        if case CaptureError.permissionDenied = error {
            refreshPermission()
            showOnboarding()
            return
        }
        present(message: error.localizedDescription, title: title)
    }

    func present(message: String, title: String) {
        NSApp.activate(ignoringOtherApps: true)
        let alert = NSAlert()
        alert.messageText = title
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }
}

enum CaptureSound {
    private static let systemPath = "/System/Library/Components/CoreAudio.component/Contents/SharedSupport/SystemSounds/system/Screen Capture.aif"
    private static let sound: NSSound? = NSSound(contentsOfFile: systemPath, byReference: true) ?? NSSound(named: "Tink")

    static func play() {
        sound?.stop()
        sound?.play()
    }
}
