import CoreMedia
import XCTest
@testable import Screenmac

final class RecordingClockTests: XCTestCase {
    private func t(_ s: Double) -> CMTime { CMTime(seconds: s, preferredTimescale: 600) }

    func testOutputStartsAtZero() {
        var c = RecordingClock()
        c.start(at: t(100))
        XCTAssertEqual(c.outputTime(for: t(100)), .zero)
        XCTAssertEqual(c.outputTime(for: t(102.5)), t(2.5))
        XCTAssertNil(c.outputTime(for: t(99)), "samples before the start are dropped")
    }

    func testPauseRemovesTheGap() {
        var c = RecordingClock()
        c.start(at: t(0))
        c.pause(at: t(5))
        XCTAssertNil(c.outputTime(for: t(6)), "samples while paused are dropped")
        c.resume(at: t(9))
        XCTAssertEqual(c.outputTime(for: t(10)), t(6))
        XCTAssertEqual(c.elapsed(at: t(12)), 8, accuracy: 0.001)
    }

    func testElapsedFreezesWhilePaused() {
        var c = RecordingClock()
        c.start(at: t(0))
        c.pause(at: t(3))
        XCTAssertEqual(c.elapsed(at: t(30)), 3, accuracy: 0.001)
    }

    func testDoublePauseAndResumeAreIgnored() {
        var c = RecordingClock()
        c.start(at: t(0))
        c.pause(at: t(1))
        c.pause(at: t(2))
        c.resume(at: t(4))
        c.resume(at: t(10))
        XCTAssertEqual(c.elapsed(at: t(5)), 2, accuracy: 0.001)
    }
}
