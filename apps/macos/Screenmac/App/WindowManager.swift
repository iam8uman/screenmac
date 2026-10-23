import AppKit
import SwiftUI

/// Opens and tracks Screenmac's windows. While any window is open the app shows
/// in the Dock and app switcher; when the last one closes it returns to being a
/// menu bar–only app.
@MainActor
final class WindowManager: NSObject, NSWindowDelegate {
    private var editors: [EditorWindowController] = []
    private var historyWindow: NSWindow?
    private var settingsWindow: NSWindow?
    private var onboardingWindow: NSWindow?

    // MARK: Editor

    func openEditor(image: CGImage, sourceURL: URL?, title: String, pixelsPerPoint: CGFloat, preferences: Preferences) {
        let controller = EditorWindowController(image: image, sourceURL: sourceURL, title: title, pixelsPerPoint: pixelsPerPoint, preferences: preferences)
        controller.onClose = { [weak self, weak controller] in
            self?.editors.removeAll { $0 === controller }
            self?.updateActivationPolicy()
        }
        editors.append(controller)
        updateActivationPolicy()
        controller.showWindow(nil)
        controller.window?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    // MARK: Utility windows

    func showHistory(store: HistoryStore, actions: HistoryActions) {
        if historyWindow == nil {
            historyWindow = makeWindow(title: "Capture History", size: CGSize(width: 860, height: 560), resizable: true,
                                       root: HistoryView(store: store, actions: actions), autosave: "History")
        }
        present(historyWindow)
    }

    func showSettings(model: AppModel) {
        if settingsWindow == nil {
            settingsWindow = makeWindow(title: "Screenmac Settings", size: CGSize(width: 620, height: 500), resizable: false,
                                        root: SettingsView(model: model, preferences: model.preferences), autosave: "Settings")
        }
        present(settingsWindow)
    }

    func showOnboarding(model: AppModel) {
        if onboardingWindow == nil {
            onboardingWindow = makeWindow(title: "Welcome to Screenmac", size: CGSize(width: 520, height: 460), resizable: false,
                                          root: OnboardingView(model: model, close: { [weak self] in self?.onboardingWindow?.close() }), autosave: nil)
        }
        present(onboardingWindow)
    }

    private func makeWindow<Content: View>(title: String, size: CGSize, resizable: Bool, root: Content, autosave: String?) -> NSWindow {
        var style: NSWindow.StyleMask = [.titled, .closable, .miniaturizable]
        if resizable { style.insert(.resizable) }
        let window = NSWindow(contentRect: CGRect(origin: .zero, size: size), styleMask: style, backing: .buffered, defer: false)
        window.title = title
        window.isReleasedWhenClosed = false
        window.contentViewController = NSHostingController(rootView: root)
        window.setContentSize(size)
        window.delegate = self
        if let autosave { window.setFrameAutosaveName("Screenmac.\(autosave)") }
        if window.frame.origin == .zero { window.center() }
        return window
    }

    private func present(_ window: NSWindow?) {
        guard let window else { return }
        updateActivationPolicy(forceRegular: true)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func windowWillClose(_ notification: Notification) {
        DispatchQueue.main.async { self.updateActivationPolicy() }
    }

    private var hasVisibleWindows: Bool {
        !editors.isEmpty || [historyWindow, settingsWindow, onboardingWindow].contains { $0?.isVisible == true }
    }

    func updateActivationPolicy(forceRegular: Bool = false) {
        let regular = forceRegular || hasVisibleWindows
        let target: NSApplication.ActivationPolicy = regular ? .regular : .accessory
        if NSApp.activationPolicy() != target { NSApp.setActivationPolicy(target) }
    }
}

/// One annotation editor window.
@MainActor
final class EditorWindowController: NSWindowController, NSWindowDelegate {
    let model: EditorViewModel
    private let preferences: Preferences
    var onClose: (() -> Void)?

    init(image: CGImage, sourceURL: URL?, title: String, pixelsPerPoint: CGFloat, preferences: Preferences) {
        model = EditorViewModel(image: image, sourceURL: sourceURL, title: title)
        self.preferences = preferences
        let window = NSWindow(contentRect: CGRect(x: 0, y: 0, width: 1100, height: 720),
                              styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
                              backing: .buffered, defer: false)
        window.title = title
        window.titlebarAppearsTransparent = true
        window.appearance = NSAppearance(named: .darkAqua)
        window.isReleasedWhenClosed = false
        window.tabbingMode = .disallowed
        super.init(window: window)
        window.delegate = self

        let view = EditorView(model: model, preferences: preferences, pixelsPerPoint: pixelsPerPoint, window: { [weak window] in window })
        window.contentViewController = NSHostingController(rootView: view.padding(.top, 28).ignoresSafeArea())
        window.setContentSize(Self.initialSize(for: image, pixelsPerPoint: pixelsPerPoint))
        window.center()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    private static func initialSize(for image: CGImage, pixelsPerPoint: CGFloat) -> CGSize {
        let visible = NSScreen.main?.visibleFrame.size ?? CGSize(width: 1440, height: 900)
        let content = CGSize(width: CGFloat(image.width) / pixelsPerPoint + 236 + 96, height: CGFloat(image.height) / pixelsPerPoint + 46 + 44 + 28 + 96)
        return CGSize(width: min(max(content.width, 860), visible.width * 0.9), height: min(max(content.height, 560), visible.height * 0.9))
    }

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        guard !model.isSaved, model.history.canUndo else { return true }
        let alert = NSAlert()
        alert.messageText = "Keep your changes to this capture?"
        alert.informativeText = "Your annotations haven't been copied or saved. The original capture stays in History either way."
        alert.addButton(withTitle: "Save")
        alert.addButton(withTitle: "Cancel")
        alert.addButton(withTitle: "Discard Changes")
        alert.beginSheetModal(for: sender) { [weak self] response in
            guard let self else { return }
            switch response {
            case .alertFirstButtonReturn:
                self.model.saveToDefaultFolder(preferences: self.preferences)
                if self.model.isSaved { sender.close() }
            case .alertThirdButtonReturn:
                sender.delegate = nil
                sender.close()
                self.onClose?()
            default:
                break
            }
        }
        return false
    }

    func windowWillClose(_ notification: Notification) {
        onClose?()
    }
}
