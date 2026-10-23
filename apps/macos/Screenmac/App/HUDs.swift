import AppKit
import SwiftUI

/// Floating controls shown while recording. Screenmac's own windows are left
/// out of the recording, so this never appears in the video.
@MainActor
final class RecordingHUD {
    private let panel: NSPanel

    init(model: AppModel) {
        panel = NSPanel(contentRect: CGRect(x: 0, y: 0, width: 236, height: 48), styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        panel.level = .statusBar
        panel.isFloatingPanel = true
        panel.becomesKeyOnlyIfNeeded = true
        panel.hidesOnDeactivate = false
        panel.backgroundColor = .clear
        panel.isOpaque = false
        panel.hasShadow = true
        panel.isMovableByWindowBackground = true
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        panel.contentView = NSHostingView(rootView: RecordingHUDView(model: model))
    }

    func show(on screen: NSScreen?) {
        guard let area = (screen ?? NSScreen.main)?.visibleFrame else { return }
        panel.setFrameOrigin(CGPoint(x: area.midX - panel.frame.width / 2, y: area.minY + 24))
        panel.orderFrontRegardless()
    }

    func close() {
        panel.orderOut(nil)
    }
}

private struct RecordingHUDView: View {
    @ObservedObject var model: AppModel

    private var paused: Bool {
        if case .recording(let p) = model.recordingState { return p }
        return false
    }

    var body: some View {
        HStack(spacing: 10) {
            Circle()
                .fill(paused ? Color.orange : Color.red)
                .frame(width: 10, height: 10)
                .opacity(paused ? 0.8 : 1)
            Text(formatDuration(model.recordingElapsed))
                .font(.system(size: 13, weight: .semibold, design: .monospaced))
                .foregroundStyle(.white)
                .frame(minWidth: 44, alignment: .leading)
                .accessibilityLabel("Recording time \(formatDuration(model.recordingElapsed))")
            Spacer(minLength: 0)
            Button { model.togglePause() } label: {
                Image(systemName: paused ? "play.fill" : "pause.fill").frame(width: 28, height: 28)
            }
            .buttonStyle(.plain)
            .foregroundStyle(.white)
            .help(paused ? "Resume" : "Pause")
            .accessibilityLabel(paused ? "Resume recording" : "Pause recording")
            Button { model.stopRecording() } label: {
                Image(systemName: "stop.fill").frame(width: 28, height: 28)
                    .background(Circle().fill(Color.red))
            }
            .buttonStyle(.plain)
            .foregroundStyle(.white)
            .help("Stop and save")
            .accessibilityLabel("Stop recording")
        }
        .padding(.horizontal, 14)
        .frame(width: 236, height: 48)
        .background(.ultraThinMaterial, in: Capsule())
        .environment(\.colorScheme, .dark)
    }
}

/// Big countdown digits for delayed captures.
@MainActor
final class CountdownHUD {
    private let panel: NSPanel
    private let label = NSTextField(labelWithString: "")

    init() {
        panel = NSPanel(contentRect: CGRect(x: 0, y: 0, width: 120, height: 120), styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        panel.level = .screenSaver
        panel.backgroundColor = .clear
        panel.isOpaque = false
        panel.ignoresMouseEvents = true
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        let background = NSVisualEffectView(frame: panel.contentLayoutRect)
        background.material = .hudWindow
        background.state = .active
        background.wantsLayer = true
        background.layer?.cornerRadius = 24
        label.font = .monospacedDigitSystemFont(ofSize: 56, weight: .semibold)
        label.alignment = .center
        label.textColor = .white
        label.frame = CGRect(x: 0, y: 26, width: 120, height: 68)
        background.addSubview(label)
        panel.contentView = background
    }

    func show(_ value: Int, on screen: NSScreen?) {
        label.stringValue = "\(value)"
        if let frame = (screen ?? NSScreen.main)?.frame {
            panel.setFrameOrigin(CGPoint(x: frame.midX - 60, y: frame.midY - 60))
        }
        panel.orderFrontRegardless()
    }

    func close() {
        panel.orderOut(nil)
    }
}
