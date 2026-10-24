import AppKit
import ScreenCaptureKit

enum CaptureError: LocalizedError {
    case permissionDenied
    case noDisplays
    case windowUnavailable
    case failed(String)

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Screenmac needs Screen Recording permission. Turn it on in System Settings → Privacy & Security → Screen & System Audio Recording, then quit and reopen Screenmac."
        case .noDisplays:
            return "No display could be captured."
        case .windowUnavailable:
            return "That window can't be captured. It may have closed, be minimized, or be protected by its app."
        case .failed(let reason):
            return "The capture failed: \(reason)"
        }
    }
}

/// A frozen image of one display, taken before the selection overlay appears.
struct DisplaySnapshot {
    let screen: NSScreen
    let displayID: CGDirectDisplayID
    let display: SCDisplay
    let image: CGImage
    /// Image pixels per screen point.
    var scale: CGFloat { CGFloat(image.width) / screen.frame.width }
    /// The display's rect in Quartz global coordinates (top-left origin).
    var quartzBounds: CGRect { CGDisplayBounds(displayID) }
}

extension NSScreen {
    var displayID: CGDirectDisplayID? {
        (deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber).map { CGDirectDisplayID($0.uint32Value) }
    }

    /// The screen under the mouse pointer.
    static var underPointer: NSScreen? {
        let p = NSEvent.mouseLocation
        return screens.first { NSMouseInRect(p, $0.frame, false) } ?? main
    }
}

extension CaptureError {
    /// ScreenCaptureKit reports a missing Screen Recording grant as `userDeclined`,
    /// even when the quick preflight check says yes. Treat it as a permission problem.
    static func from(_ error: Error) -> CaptureError {
        if let capture = error as? CaptureError {
            if case .failed(let reason) = capture, isDeclinedText(reason) { return .permissionDenied }
            return capture
        }
        return isPermissionRefusal(error) ? .permissionDenied : .failed(error.localizedDescription)
    }

    /// ScreenCaptureKit's refusal arrives as `SCStreamError.userDeclined` (-3801), but depending on the
    /// API and macOS version it can come wrapped, or in a differently spelled domain. Match all of them.
    static func isPermissionRefusal(_ error: Error) -> Bool {
        if let scError = error as? SCStreamError, scError.code == .userDeclined { return true }
        var current: NSError? = error as NSError
        var depth = 0
        while let ns = current, depth < 4 {
            if ns.code == SCStreamError.Code.userDeclined.rawValue,
               ns.domain == SCStreamErrorDomain || ns.domain.contains("ScreenCaptureKit") {
                return true
            }
            if isDeclinedText(ns.localizedDescription) { return true }
            current = ns.userInfo[NSUnderlyingErrorKey] as? NSError
            depth += 1
        }
        return false
    }

    static func isDeclinedText(_ text: String) -> Bool {
        let lower = text.lowercased()
        return lower.contains("declined tcc") || (lower.contains("declined") && lower.contains("capture"))
    }
}

@MainActor
final class ScreenCapturer {
    static var hasPermission: Bool { CGPreflightScreenCaptureAccess() }

    /// Shows the system prompt the first time; afterwards macOS only allows changes in System Settings.
    @discardableResult
    static func requestPermission() -> Bool { CGRequestScreenCaptureAccess() }

    /// Clears Screenmac's own Screen Recording entry so macOS asks again.
    /// Needed when the entry belongs to an earlier build: builds without a fixed signing identity look
    /// like a new app to macOS, so the switch shows "on" but captures are refused.
    /// Only ever touches this app's own bundle identifier.
    @discardableResult
    static func resetOwnPermission() -> Bool {
        guard let bundleID = Bundle.main.bundleIdentifier else { return false }
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/tccutil")
        task.arguments = ["reset", "ScreenCapture", bundleID]
        task.standardOutput = FileHandle.nullDevice
        task.standardError = FileHandle.nullDevice
        do {
            try task.run()
            task.waitUntilExit()
            return task.terminationStatus == 0
        } catch {
            return false
        }
    }

    static func openPrivacySettings() {
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture") {
            NSWorkspace.shared.open(url)
        }
    }

    func content() async throws -> SCShareableContent {
        do {
            return try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)
        } catch {
            if !Self.hasPermission { throw CaptureError.permissionDenied }
            throw CaptureError.from(error)
        }
    }

    /// Windows owned by Screenmac itself (overlays, Quick Access, HUD) are always left out of captures.
    func ownWindows(in content: SCShareableContent) -> [SCWindow] {
        let pid = ProcessInfo.processInfo.processIdentifier
        return content.windows.filter { $0.owningApplication?.processID == pid }
    }

    /// Finder's desktop-icon windows, hidden when "Hide desktop icons" is on.
    func desktopIconWindows(in content: SCShareableContent) -> [SCWindow] {
        content.windows.filter { $0.owningApplication?.bundleIdentifier == "com.apple.finder" && $0.windowLayer < 0 }
    }

    /// Freeze every display (or just `only`) at full pixel resolution.
    func snapshotDisplays(only: NSScreen? = nil, includeCursor: Bool, hideDesktopIcons: Bool) async throws -> [DisplaySnapshot] {
        let content = try await content()
        var excluded = ownWindows(in: content)
        if hideDesktopIcons { excluded += desktopIconWindows(in: content) }
        let screens = only.map { [$0] } ?? NSScreen.screens

        var result: [DisplaySnapshot] = []
        for screen in screens {
            guard let id = screen.displayID, let display = content.displays.first(where: { $0.displayID == id }) else { continue }
            let filter = SCContentFilter(display: display, excludingWindows: excluded)
            let config = configuration(for: filter, includeCursor: includeCursor)
            do {
                let image = try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: config)
                result.append(DisplaySnapshot(screen: screen, displayID: id, display: display, image: image))
            } catch {
                throw CaptureError.from(error)
            }
        }
        guard !result.isEmpty else { throw CaptureError.noDisplays }
        return result
    }

    /// Capture one window's own content (not what's on top of it), with its shadow.
    func capture(window: SCWindow, includeCursor: Bool) async throws -> CGImage {
        let filter = SCContentFilter(desktopIndependentWindow: window)
        let config = configuration(for: filter, includeCursor: includeCursor)
        do {
            return try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: config)
        } catch {
            let mapped = CaptureError.from(error)
            if case .permissionDenied = mapped { throw mapped }
            throw CaptureError.windowUnavailable
        }
    }

    private func configuration(for filter: SCContentFilter, includeCursor: Bool) -> SCStreamConfiguration {
        let info = SCShareableContent.info(for: filter)
        let config = SCStreamConfiguration()
        config.width = max(1, Int((info.contentRect.width * CGFloat(info.pointPixelScale)).rounded()))
        config.height = max(1, Int((info.contentRect.height * CGFloat(info.pointPixelScale)).rounded()))
        config.showsCursor = includeCursor
        config.captureResolution = .best
        return config
    }

    /// Normal app windows that can be picked, front to back.
    func pickableWindows(in content: SCShareableContent) -> [SCWindow] {
        let pid = ProcessInfo.processInfo.processIdentifier
        let candidates = content.windows.filter { w in
            w.isOnScreen && w.windowLayer == 0 && w.frame.width >= 40 && w.frame.height >= 40
                && w.owningApplication?.processID != pid
                && w.owningApplication != nil
        }
        // CGWindowList is ordered front to back; SCShareableContent isn't.
        guard let info = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] else {
            return candidates
        }
        let order = info.compactMap { $0[kCGWindowNumber as String] as? CGWindowID }
        let rank = Dictionary(uniqueKeysWithValues: order.enumerated().map { ($1, $0) })
        return candidates.sorted { (rank[$0.windowID] ?? .max) < (rank[$1.windowID] ?? .max) }
    }
}
