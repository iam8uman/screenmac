import SwiftUI

/// First-run and permission help. Shown when Screen Recording permission is missing.
struct OnboardingView: View {
    @ObservedObject var model: AppModel
    let close: () -> Void
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(spacing: 14) {
                Image(nsImage: NSApp.applicationIconImage)
                    .resizable()
                    .frame(width: 56, height: 56)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Welcome to Screenmac").font(.title2.weight(.semibold))
                    Text("It lives in your menu bar.").foregroundStyle(.secondary)
                }
            }

            VStack(alignment: .leading, spacing: 12) {
                step(1, "Allow Screen Recording", "macOS requires this before any app can capture the screen, even for a single screenshot.", done: model.hasScreenPermission)
                step(2, "Quit and reopen Screenmac", "macOS applies the permission after a relaunch.", done: model.hasScreenPermission)
                step(3, "Press \(ShortcutAction.captureArea.defaultShortcut.displayString)", "Drag over anything on screen, then annotate, copy, or save it.", done: false)
            }

            if model.hasScreenPermission {
                Label("Screen Recording is allowed. You're ready.", systemImage: "checkmark.circle.fill")
                    .foregroundStyle(.green)
            } else {
                Text("Open System Settings → Privacy & Security → Screen & System Audio Recording and turn on Screenmac.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }

            Spacer(minLength: 0)
            HStack {
                if model.hasScreenPermission {
                    Button("Try Capture Area") {
                        close()
                        model.captureArea()
                    }
                    .keyboardShortcut(.defaultAction)
                } else {
                    Button("Open System Settings") {
                        ScreenCapturer.requestPermission()
                        ScreenCapturer.openPrivacySettings()
                    }
                    .keyboardShortcut(.defaultAction)
                    Button("Quit & Reopen") { relaunch() }
                }
                Spacer()
                Button("Close", action: close)
            }
        }
        .padding(24)
        .frame(width: 520, height: 460)
        .onReceive(timer) { _ in model.refreshPermission() }
    }

    private func step(_ n: Int, _ title: String, _ detail: String, done: Bool) -> some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle().fill(done ? Color.green : Color.accentColor).frame(width: 24, height: 24)
                if done {
                    Image(systemName: "checkmark").font(.system(size: 11, weight: .bold)).foregroundStyle(.white)
                } else {
                    Text("\(n)").font(.system(size: 12, weight: .bold)).foregroundStyle(.white)
                }
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.headline)
                Text(detail).font(.callout).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private func relaunch() {
        let url = Bundle.main.bundleURL
        let configuration = NSWorkspace.OpenConfiguration()
        configuration.createsNewApplicationInstance = true
        NSWorkspace.shared.openApplication(at: url, configuration: configuration) { _, _ in
            DispatchQueue.main.async { NSApp.terminate(nil) }
        }
    }
}
