import ScreenCaptureKit
import XCTest
@testable import Screenmac

final class CaptureErrorTests: XCTestCase {
    private func isPermission(_ error: CaptureError) -> Bool {
        if case .permissionDenied = error { return true }
        return false
    }

    func testDeclinedStreamErrorMeansPermission() {
        let error = NSError(domain: SCStreamErrorDomain, code: SCStreamError.Code.userDeclined.rawValue)
        XCTAssertTrue(isPermission(CaptureError.from(error)))
    }

    func testDeclinedMessageMeansPermission() {
        // The exact text macOS 15 shows when the entry belongs to an older build.
        let error = NSError(domain: "SomeOtherDomain", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "The user declined TCCs for application, window, display capture",
        ])
        XCTAssertTrue(isPermission(CaptureError.from(error)))
    }

    func testWrappedRefusalMeansPermission() {
        let inner = NSError(domain: SCStreamErrorDomain, code: SCStreamError.Code.userDeclined.rawValue)
        let outer = NSError(domain: NSCocoaErrorDomain, code: 42, userInfo: [NSUnderlyingErrorKey: inner])
        XCTAssertTrue(isPermission(CaptureError.from(outer)))
    }

    func testAlreadyMappedFailureIsRemapped() {
        let error = CaptureError.failed("The user declined TCCs for application, window, display capture")
        XCTAssertTrue(isPermission(CaptureError.from(error)))
    }

    func testOtherFailuresStayFailures() {
        let error = NSError(domain: NSCocoaErrorDomain, code: 4, userInfo: [NSLocalizedDescriptionKey: "Disk full"])
        XCTAssertFalse(isPermission(CaptureError.from(error)))
    }
}
