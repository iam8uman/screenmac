import AppKit
import AVFoundation
import ScreenCaptureKit

enum RecordingTarget {
    case display(SCDisplay)
    /// `rect` in the display's local points, top-left origin.
    case area(SCDisplay, rect: CGRect)
    case window(SCWindow)
}

struct RecordingOptions {
    var frameRate: Int = 30
    var showsCursor = true
    var microphone = false
    var microphoneID: String?
    var systemAudio = false
}

struct RecordingResult {
    let url: URL
    let duration: TimeInterval
    let size: CGSize
    let hasMicrophoneAudio: Bool
    let hasSystemAudio: Bool
    /// Microphone was requested but no audio arrived (no device, or permission revoked).
    let microphoneMissing: Bool
}

enum RecordingError: LocalizedError {
    case alreadyRecording
    case notRecording
    case noFrames
    case writer(String)
    case stream(String)

    var errorDescription: String? {
        switch self {
        case .alreadyRecording: return "A recording is already running."
        case .notRecording: return "No recording is running."
        case .noFrames: return "No video frames arrived, so nothing was saved. The window may have closed, or Screen Recording permission was turned off."
        case .writer(let reason): return "The video file couldn't be written: \(reason)"
        case .stream(let reason): return "Screen recording stopped: \(reason)"
        }
    }
}

/// Records a display, area, or window to an MP4 with H.264 video and AAC audio.
/// Sample handling runs on a private serial queue; public methods are main-actor.
final class RecordingSession: NSObject, SCStreamOutput, SCStreamDelegate, AVCaptureAudioDataOutputSampleBufferDelegate, @unchecked Sendable {
    private let queue = DispatchQueue(label: "app.screenmac.recording")
    private let url: URL
    private let options: RecordingOptions
    private var stream: SCStream?
    private var writer: AVAssetWriter?
    private var videoInput: AVAssetWriterInput?
    private var adaptor: AVAssetWriterInputPixelBufferAdaptor?
    private var micInput: AVAssetWriterInput?
    private var systemInput: AVAssetWriterInput?
    private var clock = RecordingClock()
    private var videoSize: CGSize = .zero
    private var lastVideoTime: CMTime = .zero
    private var hasVideo = false
    private var lastPixelBuffer: CVPixelBuffer?
    private var micSamples = 0
    private var systemSamples = 0
    private var failure: Error?
    private var finished = false

    // macOS 14 microphone path.
    private var captureSession: AVCaptureSession?

    /// Called on the main queue if the stream stops on its own (e.g. from the system's "Stop Sharing").
    var onUnexpectedStop: ((Error?) -> Void)?

    init(url: URL, options: RecordingOptions) {
        self.url = url
        self.options = options
    }

    // MARK: Lifecycle

    @MainActor
    func start(target: RecordingTarget, excludingWindowsOf ownApp: SCRunningApplication?) async throws {
        let filter: SCContentFilter
        let config = SCStreamConfiguration()
        switch target {
        case .display(let display):
            filter = SCContentFilter(display: display, excludingApplications: ownApp.map { [$0] } ?? [], exceptingWindows: [])
        case .area(let display, _):
            filter = SCContentFilter(display: display, excludingApplications: ownApp.map { [$0] } ?? [], exceptingWindows: [])
        case .window(let window):
            filter = SCContentFilter(desktopIndependentWindow: window)
        }
        let info = SCShareableContent.info(for: filter)
        let scale = CGFloat(info.pointPixelScale)
        var pointSize = info.contentRect.size
        if case .area(_, let rect) = target {
            config.sourceRect = rect
            pointSize = rect.size
        }
        config.width = Geometry.even(pointSize.width * scale)
        config.height = Geometry.even(pointSize.height * scale)
        config.minimumFrameInterval = CMTime(value: 1, timescale: CMTimeScale(max(1, options.frameRate)))
        config.showsCursor = options.showsCursor
        config.queueDepth = 6
        config.pixelFormat = kCVPixelFormatType_32BGRA
        config.capturesAudio = options.systemAudio
        config.sampleRate = 48_000
        config.channelCount = 2
        config.excludesCurrentProcessAudio = true

        var micViaStream = false
        if options.microphone, #available(macOS 15.0, *) {
            config.captureMicrophone = true
            if let id = options.microphoneID { config.microphoneCaptureDeviceID = id }
            micViaStream = true
        }

        videoSize = CGSize(width: config.width, height: config.height)
        try setUpWriter(width: config.width, height: config.height)

        let stream = SCStream(filter: filter, configuration: config, delegate: self)
        try stream.addStreamOutput(self, type: .screen, sampleHandlerQueue: queue)
        if options.systemAudio { try stream.addStreamOutput(self, type: .audio, sampleHandlerQueue: queue) }
        if micViaStream, #available(macOS 15.0, *) {
            try stream.addStreamOutput(self, type: .microphone, sampleHandlerQueue: queue)
        }
        self.stream = stream

        if options.microphone && !micViaStream { try startLegacyMicrophone() }

        do {
            try await stream.startCapture()
        } catch {
            captureSession?.stopRunning()
            throw RecordingError.stream(error.localizedDescription)
        }
    }

    func pause() {
        queue.async { self.clock.pause(at: Self.now) }
    }

    func resume() {
        queue.async { self.clock.resume(at: Self.now) }
    }

    /// Recorded time so far, excluding pauses. Safe to call from any thread.
    func elapsed() -> TimeInterval {
        queue.sync { clock.elapsed(at: Self.now) }
    }

    @MainActor
    func stop() async throws -> RecordingResult {
        if let stream {
            try? await stream.stopCapture()
        }
        stream = nil
        captureSession?.stopRunning()
        captureSession = nil
        return try await finishWriting()
    }

    private static var now: CMTime { CMClockGetTime(CMClockGetHostTimeClock()) }

    // MARK: Writer

    private func setUpWriter(width: Int, height: Int) throws {
        try? FileManager.default.removeItem(at: url)
        let writer: AVAssetWriter
        do {
            writer = try AVAssetWriter(outputURL: url, fileType: .mp4)
        } catch {
            throw RecordingError.writer(error.localizedDescription)
        }
        let bitrate = max(4_000_000, Int(Double(width * height) * Double(options.frameRate) * 0.12))
        let video = AVAssetWriterInput(mediaType: .video, outputSettings: [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: width,
            AVVideoHeightKey: height,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: bitrate,
                AVVideoExpectedSourceFrameRateKey: options.frameRate,
                AVVideoMaxKeyFrameIntervalKey: options.frameRate * 2,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
            ] as [String: Any],
        ])
        video.expectsMediaDataInRealTime = true
        let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: video, sourcePixelBufferAttributes: [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
            kCVPixelBufferWidthKey as String: width,
            kCVPixelBufferHeightKey as String: height,
        ])
        guard writer.canAdd(video) else { throw RecordingError.writer("The video track couldn't be added.") }
        writer.add(video)

        let audioSettings: [String: Any] = [
            AVFormatIDKey: kAudioFormatMPEG4AAC,
            AVNumberOfChannelsKey: 2,
            AVSampleRateKey: 48_000,
            AVEncoderBitRateKey: 160_000,
        ]
        if options.microphone {
            let mic = AVAssetWriterInput(mediaType: .audio, outputSettings: audioSettings)
            mic.expectsMediaDataInRealTime = true
            if writer.canAdd(mic) { writer.add(mic); micInput = mic }
        }
        if options.systemAudio {
            let system = AVAssetWriterInput(mediaType: .audio, outputSettings: audioSettings)
            system.expectsMediaDataInRealTime = true
            if writer.canAdd(system) { writer.add(system); systemInput = system }
        }
        guard writer.startWriting() else {
            throw RecordingError.writer(writer.error?.localizedDescription ?? "unknown error")
        }
        self.writer = writer
        self.videoInput = video
        self.adaptor = adaptor
    }

    private func finishWriting() async throws -> RecordingResult {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<RecordingResult, Error>) in
            queue.async {
                guard !self.finished else {
                    continuation.resume(throwing: RecordingError.notRecording)
                    return
                }
                self.finished = true
                guard let writer = self.writer else {
                    continuation.resume(throwing: RecordingError.writer("Writer was not created."))
                    return
                }
                guard self.clock.isStarted, self.hasVideo else {
                    writer.cancelWriting()
                    try? FileManager.default.removeItem(at: self.url)
                    continuation.resume(throwing: self.failure ?? RecordingError.noFrames)
                    return
                }
                // The screen may not have changed for a while: hold the last frame until the real end.
                let end = CMTime(seconds: self.clock.elapsed(at: Self.now), preferredTimescale: 600)
                if let last = self.lastPixelBuffer, let adaptor = self.adaptor, let video = self.videoInput,
                   CMTimeCompare(end, CMTimeAdd(self.lastVideoTime, CMTime(value: 1, timescale: 30))) > 0, video.isReadyForMoreMediaData,
                   adaptor.append(last, withPresentationTime: end) {
                    self.lastVideoTime = end
                }
                let duration = CMTimeGetSeconds(self.lastVideoTime)
                writer.endSession(atSourceTime: self.lastVideoTime)
                self.videoInput?.markAsFinished()
                self.micInput?.markAsFinished()
                self.systemInput?.markAsFinished()
                let micSamples = self.micSamples
                let systemSamples = self.systemSamples
                let size = self.videoSize
                let url = self.url
                let wantedMic = self.options.microphone
                writer.finishWriting {
                    if writer.status == .completed {
                        continuation.resume(returning: RecordingResult(
                            url: url,
                            duration: duration,
                            size: size,
                            hasMicrophoneAudio: micSamples > 0,
                            hasSystemAudio: systemSamples > 0,
                            microphoneMissing: wantedMic && micSamples == 0
                        ))
                    } else {
                        continuation.resume(throwing: RecordingError.writer(writer.error?.localizedDescription ?? "unknown error"))
                    }
                }
            }
        }
    }

    // MARK: Samples (on `queue`)

    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard !finished, sampleBuffer.isValid else { return }
        switch type {
        case .screen:
            handleVideo(sampleBuffer)
        case .audio:
            append(audio: sampleBuffer, to: systemInput) { self.systemSamples += 1 }
        default:
            if #available(macOS 15.0, *), type == .microphone {
                append(audio: sampleBuffer, to: micInput) { self.micSamples += 1 }
            }
        }
    }

    private func handleVideo(_ sampleBuffer: CMSampleBuffer) {
        guard let attachments = CMSampleBufferGetSampleAttachmentsArray(sampleBuffer, createIfNecessary: false) as? [[SCStreamFrameInfo: Any]],
              let rawStatus = attachments.first?[.status] as? Int,
              let status = SCFrameStatus(rawValue: rawStatus), status == .complete,
              let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer),
              let writer, let videoInput, let adaptor
        else { return }

        let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
        if !clock.isStarted {
            clock.start(at: pts)
            writer.startSession(atSourceTime: .zero)
        }
        guard let t = clock.outputTime(for: pts), !hasVideo || CMTimeCompare(t, lastVideoTime) > 0 else { return }
        guard videoInput.isReadyForMoreMediaData else { return }
        if adaptor.append(pixelBuffer, withPresentationTime: t) {
            lastVideoTime = t
            hasVideo = true
            lastPixelBuffer = pixelBuffer
        } else if let error = writer.error {
            failure = RecordingError.writer(error.localizedDescription)
        }
    }

    private func append(audio sampleBuffer: CMSampleBuffer, to input: AVAssetWriterInput?, counted: () -> Void) {
        guard let input, clock.isStarted, input.isReadyForMoreMediaData else { return }
        let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
        guard let t = clock.outputTime(for: pts), let retimed = Self.retime(sampleBuffer, to: t) else { return }
        if input.append(retimed) { counted() }
    }

    private static func retime(_ buffer: CMSampleBuffer, to time: CMTime) -> CMSampleBuffer? {
        var count: CMItemCount = 0
        CMSampleBufferGetSampleTimingInfoArray(buffer, entryCount: 0, arrayToFill: nil, entriesNeededOut: &count)
        guard count > 0 else { return nil }
        var timing = [CMSampleTimingInfo](repeating: CMSampleTimingInfo(), count: count)
        CMSampleBufferGetSampleTimingInfoArray(buffer, entryCount: count, arrayToFill: &timing, entriesNeededOut: &count)
        let offset = CMTimeSubtract(time, timing[0].presentationTimeStamp)
        for i in 0..<count {
            timing[i].presentationTimeStamp = CMTimeAdd(timing[i].presentationTimeStamp, offset)
            if timing[i].decodeTimeStamp.isValid {
                timing[i].decodeTimeStamp = CMTimeAdd(timing[i].decodeTimeStamp, offset)
            }
        }
        var out: CMSampleBuffer?
        CMSampleBufferCreateCopyWithNewTiming(allocator: nil, sampleBuffer: buffer, sampleTimingEntryCount: count,
                                              sampleTimingArray: &timing, sampleBufferOut: &out)
        return out
    }

    func stream(_ stream: SCStream, didStopWithError error: Error) {
        let callback = onUnexpectedStop
        DispatchQueue.main.async { callback?(error) }
    }

    // MARK: Microphone on macOS 14

    private func startLegacyMicrophone() throws {
        let device = options.microphoneID.flatMap { AVCaptureDevice(uniqueID: $0) } ?? AVCaptureDevice.default(for: .audio)
        guard let device else { return } // Reported after stopping as "microphone missing".
        let session = AVCaptureSession()
        do {
            let input = try AVCaptureDeviceInput(device: device)
            guard session.canAddInput(input) else { return }
            session.addInput(input)
        } catch {
            return
        }
        let output = AVCaptureAudioDataOutput()
        output.setSampleBufferDelegate(self, queue: queue)
        guard session.canAddOutput(output) else { return }
        session.addOutput(output)
        captureSession = session
        session.startRunning()
    }

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard !finished, let session = captureSession else { return }
        // Bring capture-session time onto the host clock that ScreenCaptureKit uses.
        let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
        let hostTime = CMSyncConvertTime(pts, from: session.synchronizationClock ?? CMClockGetHostTimeClock(), to: CMClockGetHostTimeClock())
        guard let input = micInput, clock.isStarted, input.isReadyForMoreMediaData,
              let t = clock.outputTime(for: hostTime), let retimed = Self.retime(sampleBuffer, to: t)
        else { return }
        if input.append(retimed) { micSamples += 1 }
    }
}

enum MicrophonePermission {
    static var status: AVAuthorizationStatus { AVCaptureDevice.authorizationStatus(for: .audio) }

    static func request() async -> Bool {
        switch status {
        case .authorized: return true
        case .notDetermined: return await AVCaptureDevice.requestAccess(for: .audio)
        default: return false
        }
    }

    static var devices: [AVCaptureDevice] {
        AVCaptureDevice.DiscoverySession(deviceTypes: [.microphone, .external], mediaType: .audio, position: .unspecified).devices
    }

    static func openPrivacySettings() {
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone") {
            NSWorkspace.shared.open(url)
        }
    }
}
