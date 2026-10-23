import XCTest
@testable import Screenmac

final class FileNamingTests: XCTestCase {
    func testMacStyleName() {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "UTC")!
        let date = DateComponents(calendar: calendar, year: 2026, month: 10, day: 23, hour: 9, minute: 5, second: 7).date!
        XCTAssertEqual(FileNaming.baseName(date: date, calendar: calendar), "Screenmac 2026-10-23 at 09.05.07")
    }

    func testUniqueURLDoesNotOverwrite() throws {
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: folder) }
        let first = FileNaming.uniqueURL(in: folder, base: "Shot", ext: "png")
        try Data().write(to: first)
        let second = FileNaming.uniqueURL(in: folder, base: "Shot", ext: "png")
        XCTAssertEqual(second.lastPathComponent, "Shot (2).png")
    }
}
