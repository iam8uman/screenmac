import SwiftUI

struct EditorView: View {
    @ObservedObject var model: EditorViewModel
    @ObservedObject var preferences: Preferences
    let pixelsPerPoint: CGFloat
    /// Supplied by the window controller so Save As can attach a sheet.
    var window: () -> NSWindow?

    var body: some View {
        VStack(spacing: 0) {
            toolbar
            Divider().overlay(Color.white.opacity(0.06))
            HStack(spacing: 0) {
                ZStack(alignment: .bottom) {
                    CanvasContainer(model: model, pixelsPerPoint: pixelsPerPoint)
                        .accessibilityLabel("Capture canvas, \(model.document.annotations.count) annotations")
                    if let message = model.message {
                        MessageBanner(message: message)
                            .padding(.bottom, 16)
                            .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
                .animation(.spring(response: 0.3, dampingFraction: 0.85), value: model.message)
                Divider().overlay(Color.white.opacity(0.06))
                InspectorView(model: model)
                    .frame(width: 236)
            }
            Divider().overlay(Color.white.opacity(0.06))
            statusBar
        }
        .background(Color(nsColor: NSColor(srgbRed: 0.11, green: 0.106, blue: 0.133, alpha: 1)))
        .environment(\.colorScheme, .dark)
        .frame(minWidth: 760, minHeight: 480)
    }

    // MARK: Toolbar

    private var toolbar: some View {
        HStack(spacing: 4) {
            ForEach(Array(Tool.groups.enumerated()), id: \.offset) { index, group in
                if index > 0 {
                    Divider().frame(height: 18).padding(.horizontal, 4)
                }
                ForEach(group) { tool in
                    ToolButton(tool: tool, isActive: model.tool == tool) { model.tool = tool }
                }
            }
            Spacer(minLength: 12)
            IconButton(symbol: "arrow.uturn.backward", label: "Undo", disabled: !model.history.canUndo) { model.undo() }
                .keyboardShortcut("z", modifiers: .command)
            IconButton(symbol: "arrow.uturn.forward", label: "Redo", disabled: !model.history.canRedo) { model.redo() }
                .keyboardShortcut("z", modifiers: [.command, .shift])
        }
        .padding(.horizontal, 12)
        .frame(height: 46)
        .background(Color(nsColor: NSColor(srgbRed: 0.125, green: 0.122, blue: 0.153, alpha: 1)))
    }

    // MARK: Status bar

    private var statusBar: some View {
        HStack(spacing: 10) {
            Text(hint)
                .font(.system(size: 11.5))
                .foregroundStyle(.secondary)
                .lineLimit(1)
            Spacer(minLength: 8)
            HStack(spacing: 2) {
                IconButton(symbol: "minus.magnifyingglass", label: "Zoom Out", small: true) { model.zoomRequest = .init(kind: .zoomOut) }
                    .keyboardShortcut("-", modifiers: .command)
                Button { model.zoomRequest = .init(kind: .actual) } label: {
                    Text("\(Int((model.magnification * 100).rounded()))%")
                        .font(.system(size: 11.5, design: .monospaced))
                        .frame(minWidth: 44)
                }
                .buttonStyle(.plain)
                .help("Actual size (⌘1)")
                .keyboardShortcut("1", modifiers: .command)
                IconButton(symbol: "plus.magnifyingglass", label: "Zoom In", small: true) { model.zoomRequest = .init(kind: .zoomIn) }
                    .keyboardShortcut("=", modifiers: .command)
                IconButton(symbol: "arrow.up.left.and.down.right.magnifyingglass", label: "Zoom to Fit", small: true) { model.zoomRequest = .init(kind: .fit) }
                    .keyboardShortcut("0", modifiers: .command)
            }
            .padding(2)
            .background(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.white.opacity(0.1)))

            let size = (model.document.crop ?? model.fullRect).size
            Text("\(Int(size.width)) × \(Int(size.height))")
                .font(.system(size: 11.5, design: .monospaced))
                .foregroundStyle(.secondary)

            Button("Reset") { model.reset() }
                .buttonStyle(.borderless)
            Button {
                model.copyToClipboard()
            } label: {
                Label("Copy", systemImage: "doc.on.doc")
            }
            .keyboardShortcut("c", modifiers: .command)
            Button {
                model.saveAs(in: window(), preferences: preferences)
            } label: {
                Text("Save As…")
            }
            .keyboardShortcut("s", modifiers: [.command, .shift])
            Button {
                model.saveToDefaultFolder(preferences: preferences)
            } label: {
                Label("Save", systemImage: "square.and.arrow.down")
            }
            .keyboardShortcut("s", modifiers: .command)
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0.357, green: 0.298, blue: 0.961))
        }
        .controlSize(.regular)
        .padding(.horizontal, 12)
        .frame(height: 44)
        .background(Color(nsColor: NSColor(srgbRed: 0.125, green: 0.122, blue: 0.153, alpha: 1)))
    }

    private var hint: String {
        switch model.tool {
        case .select: return "Click to select, drag to move. Double-click text to edit. Arrow keys nudge."
        case .crop: return "Drag to choose the area to keep. Return applies, Esc cancels."
        case .arrow, .line: return "Drag to draw. Hold Shift for 45°."
        case .rectangle, .ellipse: return "Drag to draw. Hold Shift for a square or circle."
        case .filledRectangle: return "Drag to draw a solid block."
        case .text: return "Click to place text. Return finishes, Option-Return adds a line."
        case .counter: return "Click to drop numbered steps."
        case .highlighter: return "Drag across text to highlight it."
        case .pencil: return "Draw freehand. Hold Shift for a straight line."
        case .blur, .pixelate: return "Drag over anything private. For secrets, use Redact."
        case .redact: return "Drag to black out. The pixels are replaced in the saved file."
        }
    }
}

// MARK: - Inspector

private struct InspectorView: View {
    @ObservedObject var model: EditorViewModel

    private var subject: Tool {
        guard let a = model.selected else { return model.tool }
        switch a.shape {
        case .arrow: return .arrow
        case .line: return .line
        case .rectangle(_, _, let filled): return filled ? .filledRectangle : .rectangle
        case .ellipse: return .ellipse
        case .pencil: return .pencil
        case .highlighter: return .highlighter
        case .text: return .text
        case .counter: return .counter
        case .blur: return .blur
        case .pixelate: return .pixelate
        case .redact: return .redact
        }
    }

    private var currentColor: RGBA { model.selected?.color ?? model.color }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                if model.tool == .crop {
                    cropSection
                } else {
                    if subject.isStyled {
                        colorSection
                        sizeSection
                    }
                    if subject == .text { textSection }
                    if subject == .blur || subject == .pixelate { strengthSection }
                    if subject == .redact {
                        section("Redact") {
                            Text("Replaces the pixels with solid black in the saved file. Nothing underneath survives.")
                                .font(.system(size: 11.5)).foregroundStyle(.secondary)
                        }
                    }
                    if model.selected != nil { selectionSection }
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Color(nsColor: NSColor(srgbRed: 0.118, green: 0.114, blue: 0.141, alpha: 1)))
    }

    private func section<Content: View>(_ title: String, @ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.system(size: 11.5, weight: .medium)).foregroundStyle(.secondary)
            content()
        }
    }

    private var colorSection: some View {
        section("Color") {
            HStack(spacing: 6) {
                ForEach(RGBA.palette.indices, id: \.self) { index in
                    let entry = RGBA.palette[index]
                    let active = entry.color == currentColor
                    Button { model.setColor(entry.color) } label: {
                        Circle()
                            .fill(Color(nsColor: entry.color.nsColor))
                            .frame(width: 22, height: 22)
                            .overlay(Circle().strokeBorder(Color.white.opacity(active ? 1 : 0.18), lineWidth: active ? 2 : 1))
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(entry.name)
                    .accessibilityAddTraits(active ? .isSelected : [])
                    .help(entry.name)
                }
            }
        }
    }

    private var sizeSection: some View {
        section(subject == .text ? "Text size" : subject == .counter ? "Marker size" : "Stroke") {
            Picker("Size", selection: Binding(get: { currentSize }, set: { model.setStrokeSize($0) })) {
                ForEach(StrokeSize.allCases) { Text($0.label).tag($0) }
            }
            .pickerStyle(.segmented)
            .labelsHidden()
        }
    }

    private var currentSize: StrokeSize {
        guard let a = model.selected else { return model.strokeSize }
        let unit = model.unit
        let raw: CGFloat
        switch a.shape {
        case .arrow(_, _, let s), .line(_, _, let s), .rectangle(_, let s, _), .ellipse(_, let s), .pencil(_, let s): raw = s.width / unit
        case .highlighter(_, let s): raw = s.width / 3.4 / unit
        case .text(_, _, _, let size, _):
            return StrokeSize.allCases.min { abs($0.fontSize - size / unit) < abs($1.fontSize - size / unit) } ?? model.strokeSize
        case .counter(_, _, _, let r):
            return StrokeSize.allCases.min { abs($0.counterRadius - r / unit) < abs($1.counterRadius - r / unit) } ?? model.strokeSize
        default: return model.strokeSize
        }
        return StrokeSize.allCases.min { abs(CGFloat($0.rawValue) - raw) < abs(CGFloat($1.rawValue) - raw) } ?? model.strokeSize
    }

    private var textSection: some View {
        section("Text style") {
            Picker("Text style", selection: Binding(get: {
                if let a = model.selected, case .text(_, _, _, _, let label) = a.shape { return label }
                return model.textLabel
            }, set: { model.setTextLabel($0) })) {
                Text("Label").tag(true)
                Text("Plain").tag(false)
            }
            .pickerStyle(.segmented)
            .labelsHidden()
        }
    }

    private var strengthSection: some View {
        section(subject == .blur ? "Blur strength" : "Block size") {
            Picker("Strength", selection: Binding(get: { model.effectStrength }, set: { model.setEffectStrength($0) })) {
                Text("Light").tag(1)
                Text("Medium").tag(2)
                Text("Strong").tag(3)
            }
            .pickerStyle(.segmented)
            .labelsHidden()
            Text("Applied to the saved pixels. For passwords and card numbers, use Redact.")
                .font(.system(size: 11.5)).foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private var selectionSection: some View {
        section("Selection") {
            HStack(spacing: 6) {
                IconButton(symbol: "plus.square.on.square", label: "Duplicate") { model.duplicateSelection() }
                    .keyboardShortcut("d", modifiers: .command)
                IconButton(symbol: "square.3.layers.3d.top.filled", label: "Bring to Front") { model.bringToFront() }
                IconButton(symbol: "square.3.layers.3d.bottom.filled", label: "Send to Back") { model.sendToBack() }
                IconButton(symbol: "trash", label: "Delete") { model.deleteSelection() }
            }
        }
    }

    private var cropSection: some View {
        section("Crop") {
            let r = model.pendingCrop ?? model.fullRect
            Text("\(Int(r.width)) × \(Int(r.height)) px")
                .font(.system(size: 12, design: .monospaced))
            HStack {
                Button("Apply") { model.finishCrop() }
                    .buttonStyle(.borderedProminent)
                    .tint(Color(red: 0.357, green: 0.298, blue: 0.961))
                Button("Cancel") { model.cancelCrop() }
            }
            if model.document.crop != nil {
                Button("Remove crop") { model.removeCrop() }
                    .buttonStyle(.link)
            }
        }
    }
}

// MARK: - Controls

private struct ToolButton: View {
    let tool: Tool
    let isActive: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: tool.symbol)
                .font(.system(size: 14, weight: .medium))
                .frame(width: 32, height: 30)
                .foregroundStyle(isActive ? Color.white : Color.white.opacity(0.7))
                .background(
                    RoundedRectangle(cornerRadius: 7)
                        .fill(isActive ? Color(red: 0.357, green: 0.298, blue: 0.961) : Color.clear)
                )
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .help("\(tool.label) (\(String(tool.key).uppercased()))")
        .accessibilityLabel(tool.label)
        .accessibilityAddTraits(isActive ? .isSelected : [])
    }
}

struct IconButton: View {
    let symbol: String
    let label: String
    var disabled = false
    var small = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: small ? 12 : 14, weight: .medium))
                .frame(width: small ? 26 : 32, height: small ? 24 : 30)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .foregroundStyle(Color.white.opacity(disabled ? 0.3 : 0.75))
        .disabled(disabled)
        .help(label)
        .accessibilityLabel(label)
    }
}

private struct MessageBanner: View {
    let message: EditorViewModel.EditorMessage

    var body: some View {
        HStack(spacing: 8) {
            if message.tone == .success {
                Circle().fill(Color.green).frame(width: 6, height: 6)
            } else if message.tone == .error {
                Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.yellow)
            }
            Text(message.text).font(.system(size: 12.5))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 9)
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(Capsule().strokeBorder(Color.white.opacity(0.1)))
        .shadow(color: .black.opacity(0.35), radius: 12, y: 6)
        .accessibilityElement(children: .combine)
    }
}
