import Foundation

/// Where Screenmac keeps media and metadata. Media files live on disk; only paths go in metadata.
struct StoragePaths: Sendable {
    static let shared = StoragePaths()

    let root: URL
    let captures: URL
    let thumbnails: URL
    let database: URL

    init(root: URL) {
        self.root = root
        captures = root.appendingPathComponent("Captures", isDirectory: true)
        thumbnails = root.appendingPathComponent("Thumbnails", isDirectory: true)
        database = root.appendingPathComponent("history.json")
    }

    init(fileManager: FileManager = .default) {
        let appSupport = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? fileManager.temporaryDirectory
        self.init(root: appSupport.appendingPathComponent("Screenmac", isDirectory: true))
    }

    func ensureDirectories() throws {
        try FileManager.default.createDirectory(at: captures, withIntermediateDirectories: true)
        try FileManager.default.createDirectory(at: thumbnails, withIntermediateDirectories: true)
    }

    func thumbnailURL(id: UUID) -> URL {
        thumbnails.appendingPathComponent("\(id.uuidString).png")
    }
}
