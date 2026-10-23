import CoreMedia

/// Maps capture timestamps onto the output timeline, removing paused stretches.
/// Pure value type so pause/resume math is unit-tested.
struct RecordingClock: Equatable {
    private(set) var origin: CMTime?
    private(set) var pausedTotal: CMTime = .zero
    private(set) var pausedAt: CMTime?

    var isStarted: Bool { origin != nil }
    var isPaused: Bool { pausedAt != nil }

    mutating func start(at time: CMTime) {
        if origin == nil { origin = time }
    }

    mutating func pause(at time: CMTime) {
        guard origin != nil, pausedAt == nil else { return }
        pausedAt = time
    }

    mutating func resume(at time: CMTime) {
        guard let paused = pausedAt else { return }
        pausedTotal = CMTimeAdd(pausedTotal, CMTimeSubtract(time, paused))
        pausedAt = nil
    }

    /// Output time for a capture timestamp, or nil if it should be dropped
    /// (before the start, or while paused).
    func outputTime(for time: CMTime) -> CMTime? {
        guard let origin, pausedAt == nil, CMTimeCompare(time, origin) >= 0 else { return nil }
        let t = CMTimeSubtract(CMTimeSubtract(time, origin), pausedTotal)
        return CMTimeCompare(t, .zero) >= 0 ? t : nil
    }

    /// Recorded duration at `now`, excluding pauses.
    func elapsed(at now: CMTime) -> TimeInterval {
        guard let origin else { return 0 }
        let end = pausedAt ?? now
        let value = CMTimeSubtract(CMTimeSubtract(end, origin), pausedTotal)
        return max(0, CMTimeGetSeconds(value))
    }
}
