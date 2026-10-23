import AppKit
import Combine

enum CaptureKind: String, Codable, Sendable {
    case screenshot
    case recording
}

struct HistoryItem: Codable, Identifiable, Hashable, Sendable {
    let id: UUID
    let kind: CaptureKind
    let createdAt: Date
    var filePath: String
    var thumbnailPath: String?
    let format: String
    var fileSize: Int64
    var pixelWidth: Int?
    var pixelHeight: Int?
    /// Seconds, for recordings.
    var duration: TimeInterval?
    /// For recordings: whether an audio track was actually written.
    var hasAudio: Bool?

    var url: URL { URL(fileURLWithPath: filePath) }
    var fileExists: Bool { FileManager.default.fileExists(atPath: filePath) }
    var displayName: String { url.lastPathComponent }
}

/// Local capture history. Metadata is a small JSON file; media stays as separate files.
@MainActor
final class HistoryStore: ObservableObject {
    @Published private(set) var items: [HistoryItem] = []
    @Published private(set) var lastError: String?

    let paths: StoragePaths
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    init(paths: StoragePaths = .shared) {
        self.paths = paths
        encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        load()
    }

    /// Store a captured image: writes the file and thumbnail, then records it.
    func addScreenshot(_ image: CGImage, format: ImageFormat, date: Date = Date()) throws -> HistoryItem {
        try paths.ensureDirectories()
        let id = UUID()
        let url = FileNaming.uniqueURL(in: paths.captures, base: FileNaming.baseName(date: date), ext: format.fileExtension)
        try ImageEncoding.write(image, to: url, format: format)
        var thumbPath: String?
        if let thumb = ImageEncoding.thumbnail(of: image) {
            let thumbURL = paths.thumbnailURL(id: id)
            if (try? ImageEncoding.write(thumb, to: thumbURL, format: .png)) != nil { thumbPath = thumbURL.path }
        }
        let item = HistoryItem(
            id: id, kind: .screenshot, createdAt: date, filePath: url.path, thumbnailPath: thumbPath,
            format: format.rawValue, fileSize: fileSize(url), pixelWidth: image.width, pixelHeight: image.height,
            duration: nil, hasAudio: nil
        )
        add(item)
        return item
    }

    func add(_ item: HistoryItem) {
        items.insert(item, at: 0)
        persist()
    }

    func update(_ item: HistoryItem) {
        guard let index = items.firstIndex(where: { $0.id == item.id }) else { return }
        items[index] = item
        persist()
    }

    /// Moves the media to the Trash (recoverable) and forgets the item.
    func delete(_ item: HistoryItem) {
        items.removeAll { $0.id == item.id }
        if item.fileExists { try? FileManager.default.trashItem(at: item.url, resultingItemURL: nil) }
        if let thumb = item.thumbnailPath { try? FileManager.default.removeItem(atPath: thumb) }
        persist()
    }

    /// Forget items whose files were moved or deleted outside Screenmac.
    func removeMissing() {
        let missing = items.filter { !$0.fileExists }
        for item in missing { if let thumb = item.thumbnailPath { try? FileManager.default.removeItem(atPath: thumb) } }
        items.removeAll { !$0.fileExists }
        persist()
    }

    func load() {
        guard FileManager.default.fileExists(atPath: paths.database.path) else {
            items = []
            return
        }
        do {
            items = try decoder.decode([HistoryItem].self, from: Data(contentsOf: paths.database))
            lastError = nil
        } catch {
            // Keep the unreadable file aside instead of overwriting it.
            let backup = paths.database.deletingPathExtension().appendingPathExtension("corrupt-\(Int(Date().timeIntervalSince1970)).json")
            try? FileManager.default.moveItem(at: paths.database, to: backup)
            items = []
            lastError = "History couldn't be read and was reset. The old file was kept as \(backup.lastPathComponent)."
        }
    }

    private func persist() {
        do {
            try paths.ensureDirectories()
            try encoder.encode(items).write(to: paths.database, options: .atomic)
            lastError = nil
        } catch {
            lastError = "History couldn't be saved: \(error.localizedDescription)"
        }
    }

    private func fileSize(_ url: URL) -> Int64 {
        ((try? FileManager.default.attributesOfItem(atPath: url.path)[.size]) as? NSNumber)?.int64Value ?? 0
    }

    func fileSize(at url: URL) -> Int64 { fileSize(url) }
}
