import AppKit

/// Counts desktop (Space) switches so a capture can tell whether the person
/// swiped to another desktop after its displays were frozen.
@MainActor
final class SpaceObserver {
    static let shared = SpaceObserver()

    /// Bumped on every active-Space change.
    private(set) var generation = 0
    private var listeners: [UUID: () -> Void] = [:]
    private var token: NSObjectProtocol?

    func start() {
        guard token == nil else { return }
        token = NSWorkspace.shared.notificationCenter.addObserver(
            forName: NSWorkspace.activeSpaceDidChangeNotification, object: nil, queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self else { return }
                self.generation += 1
                for listener in self.listeners.values { listener() }
            }
        }
    }

    func addListener(_ listener: @escaping () -> Void) -> UUID {
        let id = UUID()
        listeners[id] = listener
        return id
    }

    func removeListener(_ id: UUID) {
        listeners[id] = nil
    }
}

/// Hands keyboard focus back after Screenmac briefly took it (for the selection overlay,
/// or when its last window closes) without making macOS jump to another desktop.
@MainActor
enum FocusRestorer {
    /// The app that owns the frontmost normal window on the current desktop, other than Screenmac.
    static func frontmostOtherAppOnCurrentSpace() -> NSRunningApplication? {
        let ownPID = ProcessInfo.processInfo.processIdentifier
        guard let info = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] else {
            return nil
        }
        for window in info {
            guard (window[kCGWindowLayer as String] as? Int) == 0,
                  let pid = window[kCGWindowOwnerPID as String] as? pid_t, pid != ownPID,
                  (window[kCGWindowAlpha as String] as? Double ?? 1) > 0,
                  let app = NSRunningApplication(processIdentifier: pid),
                  app.activationPolicy == .regular, !app.isTerminated
            else { continue }
            return app
        }
        return nil
    }

    /// Give focus to the app the person is looking at on this desktop.
    /// `fallback` is used only when it's known to be on this desktop (no Space change happened).
    static func restore(fallback: NSRunningApplication?) {
        let target = frontmostOtherAppOnCurrentSpace() ?? fallback
        guard let target, target.processIdentifier != ProcessInfo.processInfo.processIdentifier else { return }
        target.activate()
    }
}
