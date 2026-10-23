import AppKit
import Combine
import SwiftUI

/// Keeps the document centered when it's smaller than the visible area.
final class CenteringClipView: NSClipView {
    override func constrainBoundsRect(_ proposedBounds: NSRect) -> NSRect {
        var rect = super.constrainBoundsRect(proposedBounds)
        guard let documentView else { return rect }
        let doc = documentView.frame
        if rect.width > doc.width { rect.origin.x = (doc.width - rect.width) / 2 }
        if rect.height > doc.height { rect.origin.y = (doc.height - rect.height) / 2 }
        return rect
    }
}

/// The editing surface. Coordinates: the view is flipped and sized in points;
/// one point is `pixelsPerPoint` image pixels.
@MainActor
final class CanvasView: NSView, NSTextFieldDelegate {
    let model: EditorViewModel
    let pixelsPerPoint: CGFloat

    private enum Gesture {
        case draw(origin: CGPoint)
        case move(id: UUID, origin: CGPoint, base: Annotation, baseDoc: EditorDocument, moved: Bool)
        case resize(id: UUID, handle: AnnotationHandle, base: Annotation, baseDoc: EditorDocument)
        case cropNew(origin: CGPoint)
        case cropMove(origin: CGPoint, base: CGRect)
        case cropResize(handle: Handle, base: CGRect)
    }

    private var gesture: Gesture?
    private var draft: Annotation?
    private var strokePoints: [CGPoint] = []
    private var editingText: (id: UUID, isNew: Bool, field: NSTextField, origin: CGPoint, color: RGBA, size: CGFloat, label: Bool)?
    private var trackingArea: NSTrackingArea?

    init(model: EditorViewModel, pixelsPerPoint: CGFloat) {
        self.model = model
        self.pixelsPerPoint = max(1, pixelsPerPoint)
        super.init(frame: .zero)
        wantsLayer = true
        layer?.shadowOpacity = 0.35
        layer?.shadowRadius = 18
        layer?.shadowOffset = CGSize(width: 0, height: -8)
        syncFrame()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    override var isFlipped: Bool { true }
    override var acceptsFirstResponder: Bool { true }
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }

    /// Size the view to the visible region (crop, or whole image while cropping).
    func syncFrame() {
        let visible = model.visibleRect
        let size = CGSize(width: visible.width / pixelsPerPoint, height: visible.height / pixelsPerPoint)
        if frame.size != size { setFrameSize(size) }
        needsDisplay = true
    }

    private var magnification: CGFloat { enclosingScrollView?.magnification ?? 1 }
    /// Hit tolerance in image pixels for ~7 screen points.
    private var tolerance: CGFloat { 7 * pixelsPerPoint / magnification }

    private func toImage(_ viewPoint: CGPoint) -> CGPoint {
        let o = model.visibleRect.origin
        return CGPoint(x: viewPoint.x * pixelsPerPoint + o.x, y: viewPoint.y * pixelsPerPoint + o.y)
    }

    private func toView(_ imagePoint: CGPoint) -> CGPoint {
        let o = model.visibleRect.origin
        return CGPoint(x: (imagePoint.x - o.x) / pixelsPerPoint, y: (imagePoint.y - o.y) / pixelsPerPoint)
    }

    private func toView(_ r: CGRect) -> CGRect {
        let p = toView(r.origin)
        return CGRect(x: p.x, y: p.y, width: r.width / pixelsPerPoint, height: r.height / pixelsPerPoint)
    }

    private func clampToImage(_ p: CGPoint) -> CGPoint {
        CGPoint(x: min(max(p.x, 0), model.imageSize.width), y: min(max(p.y, 0), model.imageSize.height))
    }

    // MARK: - Drawing

    override func draw(_ dirtyRect: NSRect) {
        guard let ctx = NSGraphicsContext.current?.cgContext else { return }
        let visible = model.visibleRect
        ctx.saveGState()
        ctx.scaleBy(x: 1 / pixelsPerPoint, y: 1 / pixelsPerPoint)
        ctx.translateBy(x: -visible.minX, y: -visible.minY)
        var options = Renderer.Options()
        options.extra = draft
        if let editing = editingText, !editing.isNew { options.hiddenIDs = [editing.id] }
        Renderer.draw(model.document, base: model.base, baseImage: model.baseImage, effects: model.effects, options: options)
        ctx.restoreGState()

        if model.tool == .crop { drawCropOverlay() } else { drawSelection() }
    }

    private func drawSelection() {
        guard let a = model.selected, editingText?.id != a.id else { return }
        let m = magnification
        let box = toView(a.bounds).insetBy(dx: -3 / m, dy: -3 / m)
        let outline = NSBezierPath(roundedRect: box, xRadius: 3 / m, yRadius: 3 / m)
        outline.lineWidth = 1.25 / m
        outline.setLineDash([4 / m, 3 / m], count: 2, phase: 0)
        NSColor(srgbRed: 0.55, green: 0.5, blue: 1, alpha: 1).setStroke()
        outline.stroke()
        for (_, p) in a.handles {
            drawHandle(at: toView(p))
        }
    }

    private func drawHandle(at p: CGPoint) {
        let m = magnification
        let size = 9 / m
        let r = CGRect(x: p.x - size / 2, y: p.y - size / 2, width: size, height: size)
        let path = NSBezierPath(roundedRect: r, xRadius: 2.5 / m, yRadius: 2.5 / m)
        NSColor.white.setFill()
        path.fill()
        path.lineWidth = 1.5 / m
        NSColor(srgbRed: 0.357, green: 0.298, blue: 0.961, alpha: 1).setStroke()
        path.stroke()
    }

    private func drawCropOverlay() {
        let crop = toView(model.pendingCrop ?? model.fullRect)
        let dim = NSBezierPath(rect: bounds)
        dim.append(NSBezierPath(rect: crop).reversed)
        NSColor(srgbRed: 0.05, green: 0.04, blue: 0.07, alpha: 0.62).setFill()
        dim.fill()
        let m = magnification
        let edge = NSBezierPath(rect: crop)
        edge.lineWidth = 1.5 / m
        NSColor.white.setStroke()
        edge.stroke()
        NSColor.white.withAlphaComponent(0.35).setStroke()
        for i in 1...2 {
            let third = CGFloat(i) / 3
            let v = NSBezierPath()
            v.move(to: CGPoint(x: crop.minX + crop.width * third, y: crop.minY))
            v.line(to: CGPoint(x: crop.minX + crop.width * third, y: crop.maxY))
            let h = NSBezierPath()
            h.move(to: CGPoint(x: crop.minX, y: crop.minY + crop.height * third))
            h.line(to: CGPoint(x: crop.maxX, y: crop.minY + crop.height * third))
            v.lineWidth = 1 / m
            h.lineWidth = 1 / m
            v.stroke()
            h.stroke()
        }
        for handle in Handle.allCases { drawHandle(at: handle.point(on: crop)) }

        let pixels = model.pendingCrop ?? model.fullRect
        let label = NSAttributedString(string: "\(Int(pixels.width)) × \(Int(pixels.height))", attributes: [
            .font: NSFont.monospacedDigitSystemFont(ofSize: 11.5 / m, weight: .medium),
            .foregroundColor: NSColor.white,
        ])
        let size = label.size()
        let pill = CGRect(x: crop.minX + 8 / m, y: max(crop.minY + 8 / m, 8 / m), width: size.width + 14 / m, height: size.height + 6 / m)
        NSColor.black.withAlphaComponent(0.75).setFill()
        NSBezierPath(roundedRect: pill, xRadius: 5 / m, yRadius: 5 / m).fill()
        label.draw(at: CGPoint(x: pill.minX + 7 / m, y: pill.minY + 3 / m))
    }

    // MARK: - Cursor

    override func updateTrackingAreas() {
        super.updateTrackingAreas()
        if let trackingArea { removeTrackingArea(trackingArea) }
        let area = NSTrackingArea(rect: bounds, options: [.mouseMoved, .activeInKeyWindow, .inVisibleRect, .cursorUpdate], owner: self)
        addTrackingArea(area)
        trackingArea = area
    }

    override func mouseMoved(with event: NSEvent) {
        cursor(at: toImage(convert(event.locationInWindow, from: nil))).set()
    }

    override func cursorUpdate(with event: NSEvent) {
        cursor(at: toImage(convert(event.locationInWindow, from: nil))).set()
    }

    private func cursor(at p: CGPoint) -> NSCursor {
        if model.tool == .crop {
            let crop = model.pendingCrop ?? model.fullRect
            if let h = Handle.hit(crop, at: p, tolerance: tolerance * 1.6) { return resizeCursor(h) }
            return crop.contains(p) && crop != model.fullRect ? .openHand : .crosshair
        }
        if let a = model.selected, let h = a.handle(at: p, tolerance: tolerance * 1.4) {
            if case .rect(let rh) = h { return resizeCursor(rh) }
            return .openHand
        }
        switch model.tool {
        case .select: return model.document.annotations.last(where: { $0.hitTest(p, tolerance: tolerance) }) != nil ? .openHand : .arrow
        case .text: return .iBeam
        default: return .crosshair
        }
    }

    private func resizeCursor(_ handle: Handle) -> NSCursor {
        switch handle {
        case .left, .right: return .resizeLeftRight
        case .top, .bottom: return .resizeUpDown
        default: return .crosshair
        }
    }

    // MARK: - Mouse

    override func mouseDown(with event: NSEvent) {
        window?.makeFirstResponder(self)
        if editingText != nil {
            commitText()
            return
        }
        let raw = toImage(convert(event.locationInWindow, from: nil))
        let p = clampToImage(raw)
        let doc = model.document

        if model.tool == .crop {
            let crop = model.pendingCrop ?? model.fullRect
            if let h = Handle.hit(crop, at: raw, tolerance: tolerance * 1.6) {
                gesture = .cropResize(handle: h, base: crop)
            } else if crop.contains(raw) && crop != model.fullRect {
                gesture = .cropMove(origin: raw, base: crop)
            } else {
                gesture = .cropNew(origin: p)
            }
            return
        }

        if let a = model.selected, let h = a.handle(at: raw, tolerance: tolerance * 1.4) {
            model.beginGesture()
            gesture = .resize(id: a.id, handle: h, base: a, baseDoc: doc)
            return
        }

        switch model.tool {
        case .select:
            guard let hit = doc.annotations.last(where: { $0.hitTest(raw, tolerance: tolerance) }) else {
                model.selectedID = nil
                needsDisplay = true
                return
            }
            model.selectedID = hit.id
            if event.clickCount >= 2, case .text = hit.shape {
                beginEditing(hit)
                return
            }
            model.beginGesture()
            gesture = .move(id: hit.id, origin: raw, base: hit, baseDoc: doc, moved: false)
        case .text:
            if let hit = doc.annotations.last(where: { $0.isText && $0.hitTest(raw, tolerance: tolerance) }) {
                model.selectedID = hit.id
                beginEditing(hit)
                return
            }
            model.selectedID = nil
            let height = model.fontSize * (1.25 + TextLayout.paddingY * 2)
            startNewText(at: CGPoint(x: p.x, y: max(0, p.y - height / 2)))
        case .counter:
            model.add(Annotation(.counter(center: p, value: doc.nextCounterValue, color: model.color, radius: model.counterRadius)))
        default:
            model.selectedID = nil
            strokePoints = [p]
            draft = makeDraft(at: p)
            gesture = .draw(origin: p)
        }
        needsDisplay = true
    }

    override func mouseDragged(with event: NSEvent) {
        guard let gesture else { return }
        let raw = toImage(convert(event.locationInWindow, from: nil))
        let p = clampToImage(raw)
        let shift = event.modifierFlags.contains(.shift)
        _ = autoscroll(with: event)

        switch gesture {
        case .draw(let origin):
            if let d = draft { draft = updateDraft(d, origin: origin, to: p, shift: shift) }
        case .move(let id, let origin, let base, let baseDoc, let moved):
            let dx = raw.x - origin.x, dy = raw.y - origin.y
            if !moved, hypot(dx, dy) < 2 * pixelsPerPoint / magnification { return }
            self.gesture = .move(id: id, origin: origin, base: base, baseDoc: baseDoc, moved: true)
            var doc = baseDoc
            doc.replace(base.translated(dx: dx, dy: dy))
            model.previewGesture(doc)
        case .resize(_, let handle, let base, let baseDoc):
            var target = p
            if shift {
                switch (base.shape, handle) {
                case (.arrow(let a, _, _), .end), (.line(let a, _, _), .end): target = Geometry.snapAngle(from: a, to: p)
                case (.arrow(_, let b, _), .start), (.line(_, let b, _), .start): target = Geometry.snapAngle(from: b, to: p)
                default: break
                }
            }
            var doc = baseDoc
            doc.replace(base.resized(handle, to: target))
            model.previewGesture(doc)
        case .cropNew(let origin):
            let end = shift ? clampToImage(Geometry.square(from: origin, to: p)) : p
            model.pendingCrop = Geometry.rect(from: origin, to: end)
        case .cropMove(let origin, let base):
            model.pendingCrop = Geometry.keep(base.offsetBy(dx: raw.x - origin.x, dy: raw.y - origin.y), inside: model.fullRect)
        case .cropResize(let handle, let base):
            model.pendingCrop = Geometry.clamp(handle.resize(base, to: p), to: model.fullRect)
        }
        needsDisplay = true
    }

    override func mouseUp(with event: NSEvent) {
        guard let current = gesture else { return }
        gesture = nil
        switch current {
        case .draw:
            if var d = draft {
                switch d.shape {
                case .pencil(let pts, let s): d.shape = .pencil(points: simplifyStroke(pts, minDistance: max(1.5, s.width * 0.15)), stroke: s)
                case .highlighter(let pts, let s): d.shape = .highlighter(points: simplifyStroke(pts, minDistance: max(1.5, s.width * 0.15)), stroke: s)
                default: break
                }
                if !d.isNegligible { model.add(d) }
            }
            draft = nil
        case .move, .resize:
            model.endGesture()
        case .cropNew:
            if let c = model.pendingCrop, c.width < 8 || c.height < 8 { model.pendingCrop = model.fullRect }
        default:
            break
        }
        needsDisplay = true
    }

    /// Escape during a drag: undo the live preview, add nothing to history.
    func cancelGestureIfAny() -> Bool {
        guard let current = gesture else { return false }
        gesture = nil
        switch current {
        case .draw: draft = nil
        case .move, .resize: model.cancelGesture()
        default: break
        }
        needsDisplay = true
        return true
    }

    private func makeDraft(at p: CGPoint) -> Annotation? {
        let stroke = Stroke(color: model.color, width: model.strokeWidth)
        let rect = CGRect(origin: p, size: .zero)
        switch model.tool {
        case .arrow: return Annotation(.arrow(start: p, end: p, stroke: stroke))
        case .line: return Annotation(.line(start: p, end: p, stroke: stroke))
        case .rectangle: return Annotation(.rectangle(rect: rect, stroke: stroke, filled: false))
        case .filledRectangle: return Annotation(.rectangle(rect: rect, stroke: stroke, filled: true))
        case .ellipse: return Annotation(.ellipse(rect: rect, stroke: stroke))
        case .pencil: return Annotation(.pencil(points: [p], stroke: stroke))
        case .highlighter: return Annotation(.highlighter(points: [p], stroke: Stroke(color: model.color, width: model.strokeWidth * 3.4)))
        case .blur: return Annotation(.blur(rect: rect, radius: model.blurRadius))
        case .pixelate: return Annotation(.pixelate(rect: rect, block: model.pixelBlock))
        case .redact: return Annotation(.redact(rect: rect))
        default: return nil
        }
    }

    private func updateDraft(_ d: Annotation, origin: CGPoint, to p: CGPoint, shift: Bool) -> Annotation {
        var copy = d
        let rect = Geometry.rect(from: origin, to: shift ? Geometry.square(from: origin, to: p) : p)
        switch d.shape {
        case .arrow(let a, _, let s): copy.shape = .arrow(start: a, end: shift ? Geometry.snapAngle(from: a, to: p) : p, stroke: s)
        case .line(let a, _, let s): copy.shape = .line(start: a, end: shift ? Geometry.snapAngle(from: a, to: p) : p, stroke: s)
        case .rectangle(_, let s, let f): copy.shape = .rectangle(rect: rect, stroke: s, filled: f)
        case .ellipse(_, let s): copy.shape = .ellipse(rect: rect, stroke: s)
        case .blur(_, let r): copy.shape = .blur(rect: rect, radius: r)
        case .pixelate(_, let b): copy.shape = .pixelate(rect: rect, block: b)
        case .redact: copy.shape = .redact(rect: rect)
        case .pencil(_, let s):
            if shift, let first = strokePoints.first { strokePoints = [first, p] } else { strokePoints.append(p) }
            copy.shape = .pencil(points: strokePoints, stroke: s)
        case .highlighter(_, let s):
            if shift, let first = strokePoints.first { strokePoints = [first, p] } else { strokePoints.append(p) }
            copy.shape = .highlighter(points: strokePoints, stroke: s)
        default: break
        }
        return copy
    }

    // MARK: - Text

    private func makeField(string: String, origin: CGPoint, color: RGBA, size: CGFloat, label: Bool) -> NSTextField {
        let field = NSTextField(string: string)
        field.isBordered = false
        field.focusRingType = .none
        field.drawsBackground = label
        field.backgroundColor = label ? color.nsColor : .clear
        field.textColor = label ? color.contrastingInk.nsColor : color.nsColor
        field.font = TextLayout.font(size: size / pixelsPerPoint)
        field.placeholderString = "Type here"
        field.usesSingleLineMode = false
        field.lineBreakMode = .byClipping
        field.cell?.wraps = false
        field.cell?.isScrollable = true
        field.delegate = self
        field.setAccessibilityLabel("Annotation text")
        layoutField(field, origin: origin, size: size)
        return field
    }

    private func layoutField(_ field: NSTextField, origin: CGPoint, size: CGFloat) {
        let box = TextLayout.box(origin: origin, string: field.stringValue.isEmpty ? "Type here" : field.stringValue, size: size)
        var frame = toView(box)
        frame.size.width += 12
        field.frame = frame
    }

    private func startNewText(at origin: CGPoint) {
        let field = makeField(string: "", origin: origin, color: model.color, size: model.fontSize, label: model.textLabel)
        addSubview(field)
        editingText = (UUID(), true, field, origin, model.color, model.fontSize, model.textLabel)
        window?.makeFirstResponder(field)
    }

    private func beginEditing(_ a: Annotation) {
        guard case .text(let origin, let string, let color, let size, let label) = a.shape else { return }
        let field = makeField(string: string, origin: origin, color: color, size: size, label: label)
        addSubview(field)
        editingText = (a.id, false, field, origin, color, size, label)
        window?.makeFirstResponder(field)
        field.currentEditor()?.selectAll(nil)
        needsDisplay = true
    }

    func controlTextDidChange(_ obj: Notification) {
        guard let e = editingText else { return }
        layoutField(e.field, origin: e.origin, size: e.size)
    }

    func control(_ control: NSControl, textView: NSTextView, doCommandBy selector: Selector) -> Bool {
        if selector == #selector(NSResponder.insertNewline(_:)) {
            // Option-Return inserts a line break; Return commits.
            if NSApp.currentEvent?.modifierFlags.contains(.option) == true {
                textView.insertNewlineIgnoringFieldEditor(nil)
                return true
            }
            commitText()
            return true
        }
        if selector == #selector(NSResponder.cancelOperation(_:)) {
            cancelText()
            return true
        }
        return false
    }

    func controlTextDidEndEditing(_ obj: Notification) {
        commitText()
    }

    func commitText() {
        guard let e = editingText else { return }
        editingText = nil
        let text = e.field.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
        e.field.delegate = nil
        e.field.removeFromSuperview()
        window?.makeFirstResponder(self)
        if e.isNew {
            if !text.isEmpty {
                model.add(Annotation(id: e.id, .text(origin: e.origin, string: text, color: e.color, fontSize: e.size, label: e.label)))
                model.tool = .select
            }
        } else if let current = model.document.annotation(e.id), case .text(let o, let old, let c, let s, let l) = current.shape {
            if text.isEmpty { model.remove(e.id) } else if text != old {
                var copy = current
                copy.shape = .text(origin: o, string: text, color: c, fontSize: s, label: l)
                model.update(copy)
            }
        }
        needsDisplay = true
    }

    private func cancelText() {
        guard let e = editingText else { return }
        editingText = nil
        e.field.delegate = nil
        e.field.removeFromSuperview()
        window?.makeFirstResponder(self)
        needsDisplay = true
    }

    // MARK: - Keyboard

    override func keyDown(with event: NSEvent) {
        let flags = event.modifierFlags.intersection(.deviceIndependentFlagsMask)
        if flags.contains(.command) || flags.contains(.control) || flags.contains(.option) {
            super.keyDown(with: event)
            return
        }
        switch event.keyCode {
        case 53: // escape
            if cancelGestureIfAny() { return }
            if model.tool == .crop { model.cancelCrop() } else { model.selectedID = nil }
        case 36, 76: // return
            if model.tool == .crop { model.finishCrop() }
        case 51, 117: // delete, forward delete
            model.deleteSelection()
        case 123: model.nudgeSelection(dx: flags.contains(.shift) ? -10 : -1, dy: 0)
        case 124: model.nudgeSelection(dx: flags.contains(.shift) ? 10 : 1, dy: 0)
        case 125: model.nudgeSelection(dx: 0, dy: flags.contains(.shift) ? 10 : 1)
        case 126: model.nudgeSelection(dx: 0, dy: flags.contains(.shift) ? -10 : -1)
        default:
            if let c = event.charactersIgnoringModifiers?.first, let tool = Tool.forKey(c) {
                model.tool = tool
            } else {
                super.keyDown(with: event)
            }
        }
        needsDisplay = true
    }
}

/// SwiftUI wrapper: a magnifiable scroll view hosting the canvas.
struct CanvasContainer: NSViewRepresentable {
    @ObservedObject var model: EditorViewModel
    let pixelsPerPoint: CGFloat

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeNSView(context: Context) -> NSScrollView {
        let scroll = NSScrollView()
        scroll.contentView = CenteringClipView()
        scroll.hasVerticalScroller = true
        scroll.hasHorizontalScroller = true
        scroll.autohidesScrollers = true
        scroll.allowsMagnification = true
        scroll.minMagnification = 0.05
        scroll.maxMagnification = 8
        scroll.drawsBackground = true
        scroll.backgroundColor = NSColor(srgbRed: 0.11, green: 0.106, blue: 0.133, alpha: 1)
        let canvas = CanvasView(model: model, pixelsPerPoint: pixelsPerPoint)
        scroll.documentView = canvas
        context.coordinator.attach(scroll: scroll, canvas: canvas, model: model)
        return scroll
    }

    func updateNSView(_ nsView: NSScrollView, context: Context) {
        context.coordinator.canvas?.syncFrame()
    }

    @MainActor
    final class Coordinator {
        weak var scroll: NSScrollView?
        weak var canvas: CanvasView?
        private var cancellables: Set<AnyCancellable> = []
        private var didInitialFit = false
        private var lastVisible: CGRect = .zero

        func attach(scroll: NSScrollView, canvas: CanvasView, model: EditorViewModel) {
            self.scroll = scroll
            self.canvas = canvas
            lastVisible = model.visibleRect

            model.objectWillChange
                .receive(on: RunLoop.main)
                .sink { [weak self, weak model] in
                    guard let self, let model, let canvas = self.canvas else { return }
                    canvas.syncFrame()
                    if model.visibleRect != self.lastVisible {
                        self.lastVisible = model.visibleRect
                        self.fit()
                    }
                }
                .store(in: &cancellables)

            model.$zoomRequest
                .compactMap { $0 }
                .receive(on: RunLoop.main)
                .sink { [weak self] request in self?.perform(request.kind) }
                .store(in: &cancellables)

            NotificationCenter.default.publisher(for: NSScrollView.didEndLiveMagnifyNotification, object: scroll)
                .sink { [weak self, weak model] _ in
                    guard let self, let model else { return }
                    model.magnification = self.scroll?.magnification ?? 1
                    self.canvas?.needsDisplay = true
                }
                .store(in: &cancellables)

            NotificationCenter.default.publisher(for: NSView.frameDidChangeNotification, object: scroll)
                .sink { [weak self] _ in
                    guard let self, !self.didInitialFit else { return }
                    self.didInitialFit = true
                    self.fit()
                }
                .store(in: &cancellables)
            scroll.postsFrameChangedNotifications = true
            DispatchQueue.main.async { [weak self] in
                guard let self, !self.didInitialFit else { return }
                self.didInitialFit = true
                self.fit()
                self.canvas?.window?.makeFirstResponder(self.canvas)
            }
        }

        func perform(_ kind: EditorViewModel.ZoomRequest.Kind) {
            guard let scroll else { return }
            switch kind {
            case .fit: fit()
            case .actual: setMagnification(1)
            case .zoomIn: setMagnification(min(scroll.maxMagnification, scroll.magnification * 1.25))
            case .zoomOut: setMagnification(max(scroll.minMagnification, scroll.magnification / 1.25))
            }
        }

        private func setMagnification(_ value: CGFloat) {
            guard let scroll, let canvas else { return }
            let center = scroll.contentView.bounds.center
            scroll.setMagnification(value, centeredAt: center)
            canvas.model.magnification = scroll.magnification
            canvas.needsDisplay = true
        }

        func fit() {
            guard let scroll, let canvas, scroll.bounds.width > 0 else { return }
            let available = scroll.contentSize
            let doc = canvas.frame.size
            guard doc.width > 0, doc.height > 0 else { return }
            let inset: CGFloat = 48
            let scale = min((available.width - inset) / doc.width, (available.height - inset) / doc.height, 1)
            scroll.magnification = max(scroll.minMagnification, scale)
            canvas.model.magnification = scroll.magnification
            canvas.needsDisplay = true
        }
    }
}

private extension CGRect {
    var center: CGPoint { CGPoint(x: midX, y: midY) }
}
