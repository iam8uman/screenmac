import XCTest
@testable import Screenmac

@MainActor
final class HistoryStoreTests: XCTestCase {
    private var root: URL!

    override func setUp() async throws {
        root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString, isDirectory: true)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
    }

    override func tearDown() async throws {
        try? FileManager.default.removeItem(at: root)
    }

    private func image() -> CGImage {
        let ctx = CGContext(data: nil, width: 40, height: 20, bitsPerComponent: 8, bytesPerRow: 0,
                            space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        ctx.setFillColor(red: 0, green: 0, blue: 1, alpha: 1)
        ctx.fill(CGRect(x: 0, y: 0, width: 40, height: 20))
        return ctx.makeImage()!
    }

    func testScreenshotIsWrittenAndSurvivesReload() throws {
        let store = HistoryStore(paths: StoragePaths(root: root))
        let item = try store.addScreenshot(image(), format: .png)
        XCTAssertTrue(item.fileExists)
        XCTAssertNotNil(item.thumbnailPath)
        XCTAssertEqual(item.pixelWidth, 40)
        XCTAssertGreaterThan(item.fileSize, 0)

        let reloaded = HistoryStore(paths: StoragePaths(root: root))
        XCTAssertEqual(reloaded.items.map(\.id), [item.id])
    }

    func testMetadataHoldsPathsNotPixels() throws {
        let store = HistoryStore(paths: StoragePaths(root: root))
        _ = try store.addScreenshot(image(), format: .jpeg)
        let json = try Data(contentsOf: StoragePaths(root: root).database)
        XCTAssertLessThan(json.count, 2_000, "image bytes must not be stored in metadata")
    }

    func testMissingFilesAreReportedAndRemovable() throws {
        let store = HistoryStore(paths: StoragePaths(root: root))
        let item = try store.addScreenshot(image(), format: .png)
        try FileManager.default.removeItem(at: item.url)
        XCTAssertFalse(store.items[0].fileExists)
        store.removeMissing()
        XCTAssertTrue(store.items.isEmpty)
    }

    func testCorruptDatabaseIsSetAsideNotCrashing() throws {
        let paths = StoragePaths(root: root)
        try paths.ensureDirectories()
        try Data("not json".utf8).write(to: paths.database)
        let store = HistoryStore(paths: paths)
        XCTAssertTrue(store.items.isEmpty)
        XCTAssertNotNil(store.lastError)
    }
}
