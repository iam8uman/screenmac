import AppKit
import SwiftUI

struct HistoryView: View {
    @ObservedObject var store: HistoryStore
    let actions: HistoryActions

    enum Filter: String, CaseIterable, Identifiable {
        case all = "All", screenshots = "Screenshots", recordings = "Recordings"
        var id: String { rawValue }
    }

    enum Layout: String { case grid, list }

    @State private var search = ""
    @State private var filter: Filter = .all
    @AppStorage("sm.historyLayout") private var layout: Layout = .grid
    @State private var selection: HistoryItem.ID?

    private var filtered: [HistoryItem] {
        store.items.filter { item in
            switch filter {
            case .all: break
            case .screenshots: if item.kind != .screenshot { return false }
            case .recordings: if item.kind != .recording { return false }
            }
            return search.isEmpty || item.displayName.localizedCaseInsensitiveContains(search)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 10) {
                TextField("Search by file name", text: $search)
                    .textFieldStyle(.roundedBorder)
                    .frame(maxWidth: 220)
                Picker("Show", selection: $filter) {
                    ForEach(Filter.allCases) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                .labelsHidden()
                .frame(width: 280)
                Spacer()
                Button {
                    if let item = selectedItem { actions.copy(item) }
                } label: { Image(systemName: "doc.on.doc") }
                    .disabled(selectedItem?.fileExists != true)
                    .help("Copy")
                    .accessibilityLabel("Copy")
                Button {
                    if let item = selectedItem { NSWorkspace.shared.activateFileViewerSelecting([item.url]) }
                } label: { Image(systemName: "folder") }
                    .disabled(selectedItem?.fileExists != true)
                    .help("Show in Finder")
                    .accessibilityLabel("Show in Finder")
                Button {
                    if let item = selectedItem { store.delete(item); selection = nil }
                } label: { Image(systemName: "trash") }
                    .disabled(selectedItem == nil)
                    .help("Move to Trash")
                    .accessibilityLabel("Move to Trash")
                Picker("Layout", selection: $layout) {
                    Image(systemName: "square.grid.2x2").tag(Layout.grid).accessibilityLabel("Grid")
                    Image(systemName: "list.bullet").tag(Layout.list).accessibilityLabel("List")
                }
                .pickerStyle(.segmented)
                .labelsHidden()
                .frame(width: 90)
            }
            .padding(12)
            Divider()
            if let error = store.lastError {
                Text(error).font(.callout).foregroundStyle(.orange).padding(8)
            }
            if store.items.isEmpty {
                empty(title: "No captures yet", detail: "Press \(ShortcutAction.captureArea.defaultShortcut.displayString) or choose Capture Area from the menu bar. Captures appear here.")
            } else if filtered.isEmpty {
                empty(title: "No matches", detail: "Nothing matches \"\(search)\" in \(filter.rawValue.lowercased()).")
            } else if layout == .grid {
                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 180, maximum: 260), spacing: 14)], spacing: 14) {
                        ForEach(filtered) { item in
                            HistoryCard(item: item, selected: selection == item.id)
                                .onTapGesture { selection = item.id }
                                .simultaneousGesture(TapGesture(count: 2).onEnded { actions.open(item) })
                                .contextMenu { menu(for: item) }
                        }
                    }
                    .padding(14)
                }
            } else {
                List(filtered, selection: $selection) { item in
                    HistoryRow(item: item)
                        .contextMenu { menu(for: item) }
                        .tag(item.id)
                }
                .listStyle(.inset)
            }
        }
        .frame(minWidth: 640, minHeight: 420)
        .onDeleteCommand {
            if let item = selectedItem { store.delete(item); selection = nil }
        }
    }

    private var selectedItem: HistoryItem? { selection.flatMap { id in store.items.first { $0.id == id } } }

    @ViewBuilder
    private func menu(for item: HistoryItem) -> some View {
        if item.fileExists {
            if item.kind == .screenshot {
                Button("Open in Editor") { actions.open(item) }
            }
            Button(item.kind == .screenshot ? "Open in Preview" : "Play") { NSWorkspace.shared.open(item.url) }
            Button("Copy") { actions.copy(item) }
            Button("Show in Finder") { NSWorkspace.shared.activateFileViewerSelecting([item.url]) }
            Divider()
            Button("Move to Trash", role: .destructive) { store.delete(item) }
        } else {
            Text("The file was moved or deleted")
            Button("Remove from History") { store.delete(item) }
            Button("Remove All Missing") { store.removeMissing() }
        }
    }

    private func empty(title: String, detail: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: "photo.on.rectangle.angled").font(.system(size: 34)).foregroundStyle(.secondary)
            Text(title).font(.headline)
            Text(detail).font(.callout).foregroundStyle(.secondary).multilineTextAlignment(.center).frame(maxWidth: 360)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

/// Things history can ask the app to do.
struct HistoryActions {
    var open: (HistoryItem) -> Void
    var copy: (HistoryItem) -> Void
}

private struct Thumbnail: View {
    let item: HistoryItem

    var body: some View {
        ZStack {
            Rectangle().fill(Color(nsColor: .quaternaryLabelColor))
            if !item.fileExists {
                VStack(spacing: 4) {
                    Image(systemName: "exclamationmark.triangle")
                    Text("File missing").font(.caption)
                }
                .foregroundStyle(.secondary)
            } else if let path = item.thumbnailPath, let image = NSImage(contentsOfFile: path) {
                Image(nsImage: image).resizable().aspectRatio(contentMode: .fit)
            } else {
                Image(systemName: item.kind == .recording ? "video" : "photo").font(.title).foregroundStyle(.secondary)
            }
            if item.kind == .recording, item.fileExists {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Text(formatDuration(item.duration ?? 0))
                            .font(.system(size: 10.5, weight: .medium, design: .monospaced))
                            .padding(.horizontal, 6).padding(.vertical, 2)
                            .background(.black.opacity(0.65), in: Capsule())
                            .foregroundStyle(.white)
                            .padding(6)
                    }
                }
            }
        }
    }
}

private struct HistoryCard: View {
    let item: HistoryItem
    let selected: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Thumbnail(item: item)
                .aspectRatio(16 / 10, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(selected ? Color.accentColor : Color.primary.opacity(0.08), lineWidth: selected ? 2 : 1))
            Text(item.displayName).font(.system(size: 11.5)).lineLimit(1).truncationMode(.middle)
            Text(item.createdAt.formatted(date: .abbreviated, time: .shortened)).font(.system(size: 10.5)).foregroundStyle(.secondary)
        }
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(item.kind == .recording ? "Recording" : "Screenshot"), \(item.displayName)\(item.fileExists ? "" : ", file missing")")
    }
}

private struct HistoryRow: View {
    let item: HistoryItem

    var body: some View {
        HStack(spacing: 10) {
            Thumbnail(item: item).frame(width: 64, height: 40).clipShape(RoundedRectangle(cornerRadius: 5))
            VStack(alignment: .leading, spacing: 2) {
                Text(item.displayName).lineLimit(1).truncationMode(.middle)
                Text(details).font(.caption).foregroundStyle(item.fileExists ? Color.secondary : Color.orange)
            }
        }
        .padding(.vertical, 2)
    }

    private var details: String {
        guard item.fileExists else { return "File missing" }
        var parts = [item.createdAt.formatted(date: .abbreviated, time: .shortened)]
        if let w = item.pixelWidth, let h = item.pixelHeight { parts.append("\(w) × \(h)") }
        if let d = item.duration { parts.append(formatDuration(d)) }
        if item.kind == .recording { parts.append(item.hasAudio == true ? "with audio" : "no audio") }
        parts.append(ByteCountFormatter.string(fromByteCount: item.fileSize, countStyle: .file))
        return parts.joined(separator: ", ")
    }
}

func formatDuration(_ seconds: TimeInterval) -> String {
    let total = Int(seconds.rounded(.down))
    return String(format: "%d:%02d", total / 60, total % 60)
}
