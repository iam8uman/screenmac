import AppKit
import Combine
import UniformTypeIdentifiers

/// State for one editor window.
@MainActor
final class EditorViewModel: ObservableObject {
    let base: CGImage
    let baseImage: NSImage
    let effects: EffectCache
    /// The file this capture came from (in history), used for naming and "Reveal".
    let sourceURL: URL?
    let title: String

    @Published private(set) var history: DocumentHistory
    @Published var tool: Tool = .arrow {
        didSet { toolChanged(from: oldValue) }
    }
    @Published var color: RGBA = RGBA.palette[0].color
    @Published var strokeSize: StrokeSize = .medium
    @Published var textLabel = true
    @Published var effectStrength = 2
    @Published var selectedID: UUID?
    /// Crop rectangle being edited while the crop tool is active.
    @Published var pendingCrop: CGRect?
    @Published var message: EditorMessage?
    /// Bumped to ask the canvas to zoom; the canvas owns the actual magnification.
    @Published var zoomRequest: ZoomRequest?
    @Published var magnification: CGFloat = 1
    /// True once the current state has been copied, saved, or exported.
    @Published private(set) var isSaved = true

    struct ZoomRequest: Equatable {
        enum Kind: Equatable { case fit, actual, zoomIn, zoomOut }
        let kind: Kind
        let id = UUID()
    }

    struct EditorMessage: Identifiable, Equatable {
        enum Tone { case info, success, error }
        let id = UUID()
        let tone: Tone
        let text: String
    }

    var document: EditorDocument { history.present }
    var imageSize: CGSize { CGSize(width: base.width, height: base.height) }
    var fullRect: CGRect { CGRect(origin: .zero, size: imageSize) }

    /// Scale marks relative to a 1600-pixel-wide reference, so a Retina capture gets proportionally thicker strokes.
    var unit: CGFloat { min(4, max(0.5, max(imageSize.width, imageSize.height) / 1600)) }

    /// The region the canvas shows: the full image while cropping, otherwise the crop.
    var visibleRect: CGRect { tool == .crop ? fullRect : (document.crop ?? fullRect) }

    /// Output layout for the canvas and status bar. Crop mode hides the frame so the whole image is selectable.
    var outputLayout: OutputLayout {
        document.layout(imageSize: imageSize, ignoreBackdrop: tool == .crop)
    }

    var selected: Annotation? { selectedID.flatMap { document.annotation($0) } }

    init(image: CGImage, sourceURL: URL?, title: String) {
        base = image
        baseImage = NSImage(cgImage: image, size: CGSize(width: image.width, height: image.height))
        effects = EffectCache(base: image)
        self.sourceURL = sourceURL
        self.title = title
        history = DocumentHistory()
    }

    // MARK: - Editing

    func commit(_ document: EditorDocument) {
        let before = history
        history.commit(document)
        if history != before { isSaved = false }
        if let id = selectedID, document.annotation(id) == nil { selectedID = nil }
    }

    func add(_ annotation: Annotation, select: Bool = true) {
        var doc = document
        doc.annotations.append(annotation)
        commit(doc)
        if select { selectedID = annotation.id }
    }

    func update(_ annotation: Annotation) {
        var doc = document
        doc.replace(annotation)
        commit(doc)
    }

    func remove(_ id: UUID) {
        var doc = document
        doc.annotations.removeAll { $0.id == id }
        commit(doc)
        if selectedID == id { selectedID = nil }
    }

    func deleteSelection() {
        if let id = selectedID { remove(id) }
    }

    func duplicateSelection() {
        guard let a = selected else { return }
        let offset = 24 * unit
        let copy = Annotation(a.translated(dx: offset, dy: offset).shape)
        add(copy)
    }

    func bringToFront() { reorder(front: true) }
    func sendToBack() { reorder(front: false) }

    private func reorder(front: Bool) {
        guard let a = selected else { return }
        var doc = document
        doc.annotations.removeAll { $0.id == a.id }
        if front { doc.annotations.append(a) } else { doc.annotations.insert(a, at: 0) }
        commit(doc)
    }

    func nudgeSelection(dx: CGFloat, dy: CGFloat) {
        guard let a = selected else { return }
        update(a.translated(dx: dx * unit, dy: dy * unit))
    }

    // Gestures: live preview, one undo step.
    func beginGesture() { history.beginGesture() }
    func previewGesture(_ document: EditorDocument) { history.preview(document) }
    func endGesture() {
        let before = history.past
        history.endGesture()
        if history.past != before { isSaved = false }
    }
    func cancelGesture() { history.cancelGesture() }

    func undo() {
        guard history.canUndo else { return }
        history.undo()
        isSaved = false
        if let id = selectedID, document.annotation(id) == nil { selectedID = nil }
    }

    func redo() {
        guard history.canRedo else { return }
        history.redo()
        isSaved = false
        if let id = selectedID, document.annotation(id) == nil { selectedID = nil }
    }

    func reset() {
        guard document != EditorDocument() else {
            show(.info, "Nothing to reset.")
            return
        }
        pendingCrop = nil
        if tool == .crop { tool = .select }
        commit(EditorDocument())
        selectedID = nil
        show(.info, "Reset to the original capture. Undo brings your marks back.")
    }

    // MARK: - Style (applies to the selection too)

    func setColor(_ value: RGBA) {
        color = value
        if let a = selected, a.color != nil { update(a.recolored(value)) }
    }

    func setStrokeSize(_ value: StrokeSize) {
        strokeSize = value
        if let a = selected { update(a.resizedStroke(value, unit: unit)) }
    }

    func setTextLabel(_ value: Bool) {
        textLabel = value
        if let a = selected, case .text(let o, let s, let c, let size, _) = a.shape {
            var copy = a
            copy.shape = .text(origin: o, string: s, color: c, fontSize: size, label: value)
            update(copy)
        }
    }

    func setEffectStrength(_ value: Int) {
        effectStrength = value
        guard let a = selected else { return }
        var copy = a
        switch a.shape {
        case .blur(let r, _): copy.shape = .blur(rect: r, radius: blurRadius)
        case .pixelate(let r, _): copy.shape = .pixelate(rect: r, block: pixelBlock)
        default: return
        }
        update(copy)
    }

    var strokeWidth: CGFloat { CGFloat(strokeSize.rawValue) * unit }
    var fontSize: CGFloat { strokeSize.fontSize * unit }
    var counterRadius: CGFloat { strokeSize.counterRadius * unit }
    private static let blurTable: [Int: CGFloat] = [1: 8, 2: 14, 3: 24]
    private static let pixelTable: [Int: CGFloat] = [1: 9, 2: 15, 3: 26]
    var blurRadius: CGFloat { Self.blurTable[effectStrength, default: 14] * unit }
    var pixelBlock: CGFloat { Self.pixelTable[effectStrength, default: 15] * unit }

    func setBackdrop(_ backdrop: Backdrop) {
        var doc = document
        guard doc.backdrop != backdrop else { return }
        doc.backdrop = backdrop
        commit(doc)
    }

    func setBackdropID(_ id: BackdropID) {
        var next = document.backdrop
        next.id = id
        setBackdrop(next)
    }

    // MARK: - Crop

    private func toolChanged(from old: Tool) {
        if old == .crop, tool != .crop { applyCrop() }
        if tool == .crop {
            pendingCrop = document.crop ?? fullRect
            selectedID = nil
        }
        if !tool.isStyled, tool != .select { selectedID = nil }
    }

    func applyCrop() {
        guard let pending = pendingCrop else { return }
        let rounded = pending.integral.intersection(fullRect)
        let next: CGRect? = (rounded.width >= imageSize.width - 0.5 && rounded.height >= imageSize.height - 0.5) || rounded.width < 4 || rounded.height < 4
            ? nil : rounded
        pendingCrop = nil
        if next != document.crop {
            var doc = document
            doc.crop = next
            commit(doc)
        }
    }

    func finishCrop() {
        applyCrop()
        if tool == .crop { tool = .select }
    }

    /// Leave crop mode without applying the pending rectangle.
    func cancelCrop() {
        pendingCrop = nil
        if tool == .crop { tool = .select }
    }

    func removeCrop() {
        var doc = document
        doc.crop = nil
        commit(doc)
        pendingCrop = fullRect
    }

    // MARK: - Output

    func flattened() -> CGImage? {
        Renderer.flatten(document, base: base, effects: effects)
    }

    func copyToClipboard() {
        guard let image = flattened(), Pasteboard.copy(image) else {
            show(.error, "Couldn't copy the image. Try Save instead.")
            return
        }
        isSaved = true
        show(.success, "Copied to the clipboard.")
    }

    /// Save into the configured folder with a Mac-style name.
    func saveToDefaultFolder(preferences: Preferences) {
        guard let image = flattened() else {
            show(.error, "Couldn't render the image.")
            return
        }
        let folder = preferences.saveFolder
        do {
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
            let url = FileNaming.uniqueURL(in: folder, base: FileNaming.baseName(), ext: preferences.imageFormat.fileExtension)
            try ImageEncoding.write(image, to: url, format: preferences.imageFormat)
            isSaved = true
            show(.success, "Saved \(url.lastPathComponent) to \(folder.lastPathComponent).")
        } catch {
            show(.error, "Couldn't save to \(folder.path): \(error.localizedDescription)")
        }
    }

    func saveAs(in window: NSWindow?, preferences: Preferences) {
        guard let image = flattened() else {
            show(.error, "Couldn't render the image.")
            return
        }
        let panel = NSSavePanel()
        panel.nameFieldStringValue = "\(FileNaming.baseName()).\(preferences.imageFormat.fileExtension)"
        panel.allowedContentTypes = [.png, .jpeg]
        panel.canCreateDirectories = true
        panel.directoryURL = preferences.saveFolder
        let handler: (NSApplication.ModalResponse) -> Void = { [weak self] response in
            guard let self, response == .OK, let url = panel.url else { return }
            let format: ImageFormat = ["jpg", "jpeg"].contains(url.pathExtension.lowercased()) ? .jpeg : .png
            do {
                try ImageEncoding.write(image, to: url, format: format)
                self.isSaved = true
                self.show(.success, "Saved \(url.lastPathComponent).")
            } catch {
                self.show(.error, "Couldn't save: \(error.localizedDescription)")
            }
        }
        if let window { panel.beginSheetModal(for: window, completionHandler: handler) } else { handler(panel.runModal()) }
    }

    func show(_ tone: EditorMessage.Tone, _ text: String) {
        let next = EditorMessage(tone: tone, text: text)
        message = next
        DispatchQueue.main.asyncAfter(deadline: .now() + (tone == .error ? 6 : 2.6)) { [weak self] in
            if self?.message?.id == next.id { self?.message = nil }
        }
    }
}
