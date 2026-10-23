import Foundation

enum ImageFormat: String, CaseIterable, Codable, Identifiable, Sendable {
    case png
    case jpeg

    var id: String { rawValue }
    var fileExtension: String { self == .png ? "png" : "jpg" }
    var displayName: String { self == .png ? "PNG" : "JPEG" }
    var utType: String { self == .png ? "public.png" : "public.jpeg" }
}

/// Mac-style capture file names, e.g. "Screenmac 2026-10-23 at 09.05.07.png".
enum FileNaming {
    static func baseName(prefix: String = "Screenmac", date: Date = Date(), calendar: Calendar = .current) -> String {
        let c = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: date)
        func pad(_ v: Int?) -> String { String(format: "%02d", v ?? 0) }
        return "\(prefix) \(c.year ?? 0)-\(pad(c.month))-\(pad(c.day)) at \(pad(c.hour)).\(pad(c.minute)).\(pad(c.second))"
    }

    /// A URL in `folder` for `base` + `ext` that doesn't collide with an existing file.
    static func uniqueURL(in folder: URL, base: String, ext: String, fileManager: FileManager = .default) -> URL {
        var candidate = folder.appendingPathComponent("\(base).\(ext)")
        var counter = 2
        while fileManager.fileExists(atPath: candidate.path) {
            candidate = folder.appendingPathComponent("\(base) (\(counter)).\(ext)")
            counter += 1
        }
        return candidate
    }
}
