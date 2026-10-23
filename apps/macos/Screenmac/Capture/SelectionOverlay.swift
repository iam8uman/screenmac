import AppKit
import ScreenCaptureKit

enum SelectionMode: Equatable {
    case area
    case window
}

enum SelectionPurpose {
    case screenshot
    case recording
}

enum SelectionResult {
    /// `rect` is in the snapshot screen's local points, top-left origin.
    case area(snapshot: DisplaySnapshot, rect: CGRect)
    case window(SCWindow)
    case cancelled
}

/// Full-screen overlays (one per display) over frozen snapshots, for picking an area or a window.
@MainActor
final class SelectionOverlayController {
    private let snapshots: [DisplaySnapshot]
    private let windows: [SCWindow]
    private let purpose: SelectionPurpose
    private var overlays: [OverlayWindow] = []
    private var continuation: CheckedContinuation<SelectionResult, Never>?
    private(set) var mode: SelectionMode
    private let initialSelection: CGRect?

    /// - Parameter initialSelection: a previous selection in Cocoa global coordinates, if remembered.
    init(snapshots: [DisplaySnapshot], windows: [SCWindow], mode: SelectionMode, purpose: SelectionPurpose, initialSelection: CGRect?) {
        self.snapshots = snapshots
        self.windows = windows
        self.mode = mode
        self.purpose = purpose
        self.initialSelection = initialSelection
    }

    func run() async -> SelectionResult {
        await withCheckedContinuation { continuation in
            self.continuation = continuation
            present()
        }
    }

    private func present() {
        NSApp.activate(ignoringOtherApps: true)
        let pointer = NSEvent.mouseLocation
        for snapshot in snapshots {
            let window = OverlayWindow(snapshot: snapshot)
            let view = OverlayView(snapshot: snapshot, controller: self, windows: windows, purpose: purpose)
            window.contentView = view
            if let initial = initialSelection, snapshot.screen.frame.contains(CGPoint(x: initial.midX, y: initial.midY)) {
                view.selection = view.localRect(fromCocoa: initial).intersection(view.bounds)
            }
            overlays.append(window)
            window.orderFrontRegardless()
            if NSMouseInRect(pointer, snapshot.screen.frame, false) {
                window.makeKeyAndOrderFront(nil)
                window.makeFirstResponder(view)
            }
        }
        if !overlays.contains(where: { $0.isKeyWindow }), let first = overlays.first {
            first.makeKeyAndOrderFront(nil)
            first.makeFirstResponder(first.contentView)
        }
        NSCursor.crosshair.set()
    }

    func toggleMode() {
        guard !windows.isEmpty else { return }
        mode = mode == .area ? .window : .area
        for overlay in overlays { (overlay.contentView as? OverlayView)?.modeChanged() }
    }

    /// A drag began on `view`: clear selections on other displays.
    func didBeginSelection(on view: OverlayView) {
        for overlay in overlays {
            if let other = overlay.contentView as? OverlayView, other !== view, other.selection != nil {
                other.selection = nil
                other.needsDisplay = true
            }
        }
    }

    func finish(_ result: SelectionResult) {
        guard let continuation else { return }
        self.continuation = nil
        for overlay in overlays {
            overlay.orderOut(nil)
            overlay.contentView = nil
        }
        overlays.removeAll()
        NSCursor.arrow.set()
        continuation.resume(returning: result)
    }
}

final class OverlayWindow: NSWindow {
    init(snapshot: DisplaySnapshot) {
        super.init(contentRect: snapshot.screen.frame, styleMask: [.borderless], backing: .buffered, defer: false)
        setFrame(snapshot.screen.frame, display: false)
        level = .screenSaver
        isOpaque = true
        backgroundColor = .black
        hasShadow = false
        ignoresMouseEvents = false
        acceptsMouseMovedEvents = true
        isReleasedWhenClosed = false
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
        animationBehavior = .none
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { true }
}

@MainActor
final class OverlayView: NSView {
    let snapshot: DisplaySnapshot
    private weak var controller: SelectionOverlayController?
    private let windows: [SCWindow]
    private let purpose: SelectionPurpose
    private let frozen: NSImage

    var selection: CGRect? { didSet { updateButtons() } }
    private var hoveredWindow: SCWindow?
    private var pointer: CGPoint?

    private enum Drag {
        case new(origin: CGPoint)
        case move(origin: CGPoint, base: CGRect)
        case resize(Handle, base: CGRect)
    }
    private var drag: Drag?

    private lazy var confirmButton: NSButton = {
        let title = purpose == .recording ? "Record" : "Capture"
        let b = NSButton(title: title, target: self, action: #selector(confirm))
        b.bezelStyle = .rounded
        b.keyEquivalent = "\r"
        b.controlSize = .large
        b.bezelColor = NSColor(srgbRed: 0.357, green: 0.298, blue: 0.961, alpha: 1)
        b.setAccessibilityLabel(purpose == .recording ? "Record this area" : "Capture this area")
        return b
    }()

    private lazy var cancelButton: NSButton = {
        let b = NSButton(title: "Cancel", target: self, action: #selector(cancel))
        b.bezelStyle = .rounded
        b.controlSize = .large
        return b
    }()

    init(snapshot: DisplaySnapshot, controller: SelectionOverlayController, windows: [SCWindow], purpose: SelectionPurpose) {
        self.snapshot = snapshot
        self.controller = controller
        self.windows = windows
        self.purpose = purpose
        frozen = NSImage(cgImage: snapshot.image, size: snapshot.screen.frame.size)
        super.init(frame: CGRect(origin: .zero, size: snapshot.screen.frame.size))
        addSubview(confirmButton)
        addSubview(cancelButton)
        updateButtons()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override var isFlipped: Bool { true }
    override var acceptsFirstResponder: Bool { true }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    private var mode: SelectionMode { controller?.mode ?? .area }

    func modeChanged() {
        hoveredWindow = nil
        if mode == .window { selection = nil }
        updateButtons()
        needsDisplay = true
    }

    // MARK: Coordinates

    /// Cocoa global rect → this view's local flipped rect.
    func localRect(fromCocoa r: CGRect) -> CGRect {
        let f = snapshot.screen.frame
        return CGRect(x: r.minX - f.minX, y: f.maxY - r.maxY, width: r.width, height: r.height)
    }

    func cocoaRect(fromLocal r: CGRect) -> CGRect {
        let f = snapshot.screen.frame
        return CGRect(x: f.minX + r.minX, y: f.maxY - r.maxY, width: r.width, height: r.height)
    }

    /// Quartz global rect (SCWindow.frame) → local.
    private func localRect(fromQuartz r: CGRect) -> CGRect {
        let b = snapshot.quartzBounds
        return CGRect(x: r.minX - b.minX, y: r.minY - b.minY, width: r.width, height: r.height)
    }

    private func clamp(_ p: CGPoint) -> CGPoint {
        CGPoint(x: min(max(p.x, 0), bounds.width), y: min(max(p.y, 0), bounds.height))
    }

    private func windowAt(_ p: CGPoint) -> SCWindow? {
        windows.first { localRect(fromQuartz: $0.frame).contains(p) }
    }

    // MARK: Drawing

    override func draw(_ dirtyRect: NSRect) {
        frozen.draw(in: bounds, from: .zero, operation: .copy, fraction: 1, respectFlipped: true, hints: nil)

        let highlight: CGRect?
        switch mode {
        case .area: highlight = selection
        case .window: highlight = hoveredWindow.map { localRect(fromQuartz: $0.frame).intersection(bounds) }
        }

        let dim = NSBezierPath(rect: bounds)
        if let h = highlight, !h.isEmpty { dim.append(NSBezierPath(rect: h).reversed) }
        NSColor.black.withAlphaComponent(0.38).setFill()
        dim.fill()

        if let h = highlight, !h.isEmpty {
            if mode == .window {
                NSColor(srgbRed: 0.357, green: 0.298, blue: 0.961, alpha: 0.18).setFill()
                NSBezierPath(rect: h).fill()
            }
            let border = NSBezierPath(rect: h.insetBy(dx: -0.5, dy: -0.5))
            border.lineWidth = mode == .window ? 3 : 1
            (mode == .window ? NSColor(srgbRed: 0.55, green: 0.5, blue: 1, alpha: 1) : NSColor.white).setStroke()
            border.stroke()
            if mode == .area {
                for handle in Handle.allCases { drawHandle(at: handle.point(on: h)) }
            }
            drawSizeLabel(for: h)
        }

        if mode == .area, drag == nil || isDrawingNew, let p = pointer {
            drawGuides(at: p)
            drawLoupe(at: p)
        }
        drawHint()
    }

    private var isDrawingNew: Bool {
        if case .new = drag { return true }
        return false
    }

    private func drawHandle(at p: CGPoint) {
        let r = CGRect(x: p.x - 4.5, y: p.y - 4.5, width: 9, height: 9)
        let path = NSBezierPath(roundedRect: r, xRadius: 2.5, yRadius: 2.5)
        NSColor.white.setFill()
        path.fill()
        path.lineWidth = 1.5
        NSColor(srgbRed: 0.357, green: 0.298, blue: 0.961, alpha: 1).setStroke()
        path.stroke()
    }

    private func pill(_ text: String, at origin: CGPoint, font: NSFont = .monospacedDigitSystemFont(ofSize: 12, weight: .medium)) -> CGRect {
        let s = NSAttributedString(string: text, attributes: [.font: font, .foregroundColor: NSColor.white])
        let size = s.size()
        let r = CGRect(x: origin.x, y: origin.y, width: size.width + 16, height: size.height + 8)
        NSColor.black.withAlphaComponent(0.78).setFill()
        NSBezierPath(roundedRect: r, xRadius: 6, yRadius: 6).fill()
        s.draw(at: CGPoint(x: r.minX + 8, y: r.minY + 4))
        return r
    }

    private func drawSizeLabel(for r: CGRect) {
        let px = Geometry.pixelRect(for: r, scale: snapshot.scale)
        let text = "\(Int(px.width)) × \(Int(px.height))"
        var y = r.maxY + 8
        if y + 26 > bounds.height { y = max(4, r.minY - 32) }
        _ = pill(text, at: CGPoint(x: max(4, min(r.minX, bounds.width - 120)), y: y))
    }

    private func drawGuides(at p: CGPoint) {
        let path = NSBezierPath()
        path.move(to: CGPoint(x: p.x + 0.5, y: 0))
        path.line(to: CGPoint(x: p.x + 0.5, y: bounds.height))
        path.move(to: CGPoint(x: 0, y: p.y + 0.5))
        path.line(to: CGPoint(x: bounds.width, y: p.y + 0.5))
        path.lineWidth = 1
        path.setLineDash([4, 4], count: 2, phase: 0)
        NSColor.white.withAlphaComponent(0.45).setStroke()
        path.stroke()
    }

    /// A magnifier near the pointer for pixel-precise selection.
    private func drawLoupe(at p: CGPoint) {
        let size: CGFloat = 128
        let zoom: CGFloat = 8
        var origin = CGPoint(x: p.x + 24, y: p.y + 24)
        if origin.x + size > bounds.width { origin.x = p.x - 24 - size }
        if origin.y + size + 28 > bounds.height { origin.y = p.y - 24 - size - 28 }
        let frame = CGRect(origin: origin, size: CGSize(width: size, height: size))

        let sourceSide = size / zoom
        let scale = snapshot.scale
        // Source rect in image pixels (NSImage.draw(from:) uses the image's own bottom-left space).
        let src = CGRect(
            x: (p.x - sourceSide / 2) * scale,
            y: (bounds.height - p.y - sourceSide / 2) * scale,
            width: sourceSide * scale,
            height: sourceSide * scale
        )
        NSGraphicsContext.saveGraphicsState()
        let clip = NSBezierPath(roundedRect: frame, xRadius: 10, yRadius: 10)
        clip.addClip()
        NSColor.black.setFill()
        frame.fill()
        NSGraphicsContext.current?.imageInterpolation = .none
        let pixelImage = NSImage(cgImage: snapshot.image, size: CGSize(width: snapshot.image.width, height: snapshot.image.height))
        pixelImage.draw(in: frame, from: src, operation: .copy, fraction: 1, respectFlipped: true, hints: [.interpolation: NSImageInterpolation.none.rawValue])
        let cross = NSBezierPath()
        cross.move(to: CGPoint(x: frame.midX, y: frame.minY))
        cross.line(to: CGPoint(x: frame.midX, y: frame.maxY))
        cross.move(to: CGPoint(x: frame.minX, y: frame.midY))
        cross.line(to: CGPoint(x: frame.maxX, y: frame.midY))
        cross.lineWidth = 1
        NSColor(srgbRed: 0.55, green: 0.5, blue: 1, alpha: 0.9).setStroke()
        cross.stroke()
        NSGraphicsContext.restoreGraphicsState()
        let ring = NSBezierPath(roundedRect: frame, xRadius: 10, yRadius: 10)
        ring.lineWidth = 2
        NSColor.white.withAlphaComponent(0.9).setStroke()
        ring.stroke()
        let px = CGPoint(x: (p.x * scale).rounded(), y: (p.y * scale).rounded())
        _ = pill("\(Int(px.x)), \(Int(px.y))", at: CGPoint(x: frame.minX, y: frame.maxY + 6), font: .monospacedDigitSystemFont(ofSize: 11, weight: .medium))
    }

    private func drawHint() {
        let text: String
        switch (mode, purpose) {
        case (.area, .screenshot): text = windows.isEmpty ? "Drag to select an area. Return captures, Esc cancels." : "Drag to select an area. Space picks a window. Return captures, Esc cancels."
        case (.area, .recording): text = "Drag to choose the area to record. Return starts, Esc cancels."
        case (.window, .screenshot): text = "Click a window to capture it. Space switches to area. Esc cancels."
        case (.window, .recording): text = "Click a window to record it. Esc cancels."
        }
        let font = NSFont.systemFont(ofSize: 13, weight: .medium)
        let width = NSAttributedString(string: text, attributes: [.font: font]).size().width + 16
        _ = pill(text, at: CGPoint(x: (bounds.width - width) / 2, y: 40), font: font)
    }

    private func updateButtons() {
        guard let s = selection, mode == .area, s.width >= 4, s.height >= 4, drag == nil else {
            confirmButton.isHidden = true
            cancelButton.isHidden = true
            return
        }
        confirmButton.isHidden = false
        cancelButton.isHidden = false
        confirmButton.sizeToFit()
        cancelButton.sizeToFit()
        let gap: CGFloat = 8
        let totalWidth = confirmButton.frame.width + cancelButton.frame.width + gap
        var y = s.maxY + 40
        if y + 34 > bounds.height { y = s.maxY - 44 }
        let x = min(max(4, s.maxX - totalWidth), bounds.width - totalWidth - 4)
        cancelButton.setFrameOrigin(CGPoint(x: x, y: y))
        confirmButton.setFrameOrigin(CGPoint(x: x + cancelButton.frame.width + gap, y: y))
    }

    // MARK: Events

    override func resetCursorRects() {
        addCursorRect(bounds, cursor: .crosshair)
    }

    override func mouseMoved(with event: NSEvent) {
        let p = convert(event.locationInWindow, from: nil)
        pointer = p
        if mode == .window {
            let hit = windowAt(p)
            if hit?.windowID != hoveredWindow?.windowID {
                hoveredWindow = hit
            }
        }
        needsDisplay = true
    }

    override func mouseExited(with event: NSEvent) {
        pointer = nil
        needsDisplay = true
    }

    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        trackingAreas.forEach(removeTrackingArea)
        addTrackingArea(NSTrackingArea(rect: bounds, options: [.mouseMoved, .mouseEnteredAndExited, .activeAlways, .inVisibleRect], owner: self))
    }

    override func mouseDown(with event: NSEvent) {
        window?.makeKey()
        window?.makeFirstResponder(self)
        let p = clamp(convert(event.locationInWindow, from: nil))

        if mode == .window {
            if let w = windowAt(p) { controller?.finish(.window(w)) }
            return
        }

        if let s = selection {
            if event.clickCount >= 2, s.contains(p) {
                confirm()
                return
            }
            if let h = Handle.hit(s, at: p, tolerance: 8) {
                drag = .resize(h, base: s)
                updateButtons()
                return
            }
            if s.contains(p) {
                drag = .move(origin: p, base: s)
                updateButtons()
                return
            }
        }
        controller?.didBeginSelection(on: self)
        drag = .new(origin: p)
        selection = CGRect(origin: p, size: .zero)
        needsDisplay = true
    }

    override func mouseDragged(with event: NSEvent) {
        guard let drag else { return }
        let raw = convert(event.locationInWindow, from: nil)
        let p = clamp(raw)
        pointer = p
        switch drag {
        case .new(let origin):
            let end = event.modifierFlags.contains(.shift) ? clamp(Geometry.square(from: origin, to: p)) : p
            selection = Geometry.rect(from: origin, to: end)
        case .move(let origin, let base):
            selection = Geometry.keep(base.offsetBy(dx: raw.x - origin.x, dy: raw.y - origin.y), inside: bounds)
        case .resize(let handle, let base):
            selection = Geometry.clamp(handle.resize(base, to: p), to: bounds)
        }
        needsDisplay = true
    }

    override func mouseUp(with event: NSEvent) {
        let wasNew = isDrawingNew
        drag = nil
        if wasNew, let s = selection, s.width < 4 || s.height < 4 {
            selection = nil
        }
        updateButtons()
        needsDisplay = true
    }

    override func keyDown(with event: NSEvent) {
        switch event.keyCode {
        case 53: cancel() // escape
        case 36, 76: confirm() // return
        case 49: controller?.toggleMode() // space
        case 123, 124, 125, 126:
            guard var s = selection else { return }
            let step: CGFloat = event.modifierFlags.contains(.shift) ? 10 : 1
            let grow = event.modifierFlags.contains(.option)
            switch event.keyCode {
            case 123: if grow { s.size.width -= step } else { s.origin.x -= step }
            case 124: if grow { s.size.width += step } else { s.origin.x += step }
            case 125: if grow { s.size.height += step } else { s.origin.y += step }
            default: if grow { s.size.height -= step } else { s.origin.y -= step }
            }
            selection = Geometry.keep(s.standardized, inside: bounds)
            needsDisplay = true
        default:
            super.keyDown(with: event)
        }
    }

    @objc private func confirm() {
        guard mode == .area, let s = selection, s.width >= 4, s.height >= 4 else { return }
        controller?.finish(.area(snapshot: snapshot, rect: s.integral))
    }

    @objc private func cancel() {
        controller?.finish(.cancelled)
    }

    override func cancelOperation(_ sender: Any?) {
        cancel()
    }
}
