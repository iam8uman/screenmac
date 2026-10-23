import AppKit
import Combine
import SwiftUI

/// Actions Quick Access can trigger. Supplied by the app model.
struct QuickAccessActions {
    var annotate: (HistoryItem) -> Void
    var copy: (HistoryItem) -> Void
    var save: (HistoryItem) -> Void
    var reveal: (HistoryItem) -> Void
    var delete: (HistoryItem) -> Void
}

@MainActor
final class QuickAccessModel: ObservableObject {
    struct Card: Identifiable, Equatable {
        let item: HistoryItem
        let thumbnail: NSImage
        var id: UUID { item.id }
        static func == (a: Card, b: Card) -> Bool { a.item.id == b.item.id }
    }

    @Published var cards: [Card] = []
    @Published var corner: QuickAccessCorner = .bottomRight
    @Published var feedback: [UUID: String] = [:]
    var hovering: Set<UUID> = []
}

/// A floating, non-activating stack of recent captures in a screen corner.
/// It never takes keyboard focus away from the app you're working in.
@MainActor
final class QuickAccessController {
    static let cardSize = CGSize(width: 232, height: 158)
    static let maxCards = 5

    private let model = QuickAccessModel()
    private var panel: NSPanel?
    private var timers: [UUID: Timer] = [:]
    private var screen: NSScreen?
    private let preferences: Preferences
    var actions: QuickAccessActions?

    init(preferences: Preferences) {
        self.preferences = preferences
    }

    func show(_ item: HistoryItem, thumbnail: NSImage, on screen: NSScreen?) {
        model.corner = preferences.quickAccessCorner
        self.screen = screen ?? NSScreen.underPointer
        model.cards.removeAll { $0.item.id == item.id }
        model.cards.insert(.init(item: item, thumbnail: thumbnail), at: 0)
        if model.cards.count > Self.maxCards {
            for card in model.cards.suffix(from: Self.maxCards) { timers[card.id]?.invalidate() }
            model.cards = Array(model.cards.prefix(Self.maxCards))
        }
        ensurePanel()
        layout()
        scheduleDismiss(item.id)
    }

    func dismiss(_ id: UUID) {
        timers[id]?.invalidate()
        timers[id] = nil
        withAnimation(.spring(response: 0.32, dampingFraction: 0.86)) {
            model.cards.removeAll { $0.id == id }
        }
        model.feedback[id] = nil
        if model.cards.isEmpty {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { [weak self] in
                guard let self, self.model.cards.isEmpty else { return }
                self.panel?.orderOut(nil)
            }
        } else {
            layout()
        }
    }

    func dismissAll() {
        for id in model.cards.map(\.id) { dismiss(id) }
    }

    func flash(_ id: UUID, _ message: String) {
        model.feedback[id] = message
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) { [weak self] in
            if self?.model.feedback[id] == message { self?.model.feedback[id] = nil }
        }
    }

    func setHovering(_ id: UUID, _ hovering: Bool) {
        if hovering {
            model.hovering.insert(id)
            timers[id]?.invalidate()
            timers[id] = nil
        } else {
            model.hovering.remove(id)
            scheduleDismiss(id)
        }
    }

    private func scheduleDismiss(_ id: UUID) {
        timers[id]?.invalidate()
        let seconds = preferences.quickAccessDismissSeconds
        guard seconds > 0 else { return }
        timers[id] = Timer.scheduledTimer(withTimeInterval: TimeInterval(seconds), repeats: false) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self, !self.model.hovering.contains(id) else { return }
                self.dismiss(id)
            }
        }
    }

    private func ensurePanel() {
        if panel == nil {
            let p = NSPanel(contentRect: .zero, styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
            p.level = .floating
            p.isFloatingPanel = true
            p.becomesKeyOnlyIfNeeded = true
            p.hidesOnDeactivate = false
            p.backgroundColor = .clear
            p.isOpaque = false
            p.hasShadow = false
            p.isMovableByWindowBackground = false
            p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
            p.isReleasedWhenClosed = false
            p.setAccessibilityLabel("Screenmac Quick Access")
            let root = QuickAccessStack(model: model, controller: self)
            p.contentView = NSHostingView(rootView: root)
            panel = p
        }
        panel?.orderFrontRegardless()
    }

    private func layout() {
        guard let panel, let screen = screen ?? NSScreen.main else { return }
        let spacing: CGFloat = 12
        let margin: CGFloat = 16
        let count = CGFloat(max(1, model.cards.count))
        let size = CGSize(width: Self.cardSize.width + 24, height: count * Self.cardSize.height + (count - 1) * spacing + 24)
        let area = screen.visibleFrame
        let x: CGFloat
        let y: CGFloat
        switch model.corner {
        case .bottomRight: x = area.maxX - size.width - margin + 12; y = area.minY + margin - 12
        case .bottomLeft: x = area.minX + margin - 12; y = area.minY + margin - 12
        case .topRight: x = area.maxX - size.width - margin + 12; y = area.maxY - size.height - margin + 12
        case .topLeft: x = area.minX + margin - 12; y = area.maxY - size.height - margin + 12
        }
        panel.setFrame(CGRect(x: x, y: y, width: size.width, height: size.height), display: true, animate: false)
    }

    // Called from the SwiftUI view.
    func perform(_ action: KeyPath<QuickAccessActions, (HistoryItem) -> Void>, _ item: HistoryItem) {
        actions?[keyPath: action](item)
    }
}

private struct QuickAccessStack: View {
    @ObservedObject var model: QuickAccessModel
    let controller: QuickAccessController

    var body: some View {
        VStack(spacing: 12) {
            if model.corner == .bottomRight || model.corner == .bottomLeft { Spacer(minLength: 0) }
            ForEach(model.cards) { card in
                QuickAccessCard(card: card, feedback: model.feedback[card.id], controller: controller)
                    .transition(.asymmetric(
                        insertion: .move(edge: model.corner == .bottomLeft || model.corner == .topLeft ? .leading : .trailing).combined(with: .opacity),
                        removal: .opacity.combined(with: .scale(scale: 0.92))
                    ))
            }
            if model.corner == .topRight || model.corner == .topLeft { Spacer(minLength: 0) }
        }
        .padding(12)
        .animation(.spring(response: 0.34, dampingFraction: 0.84), value: model.cards)
    }
}

private struct QuickAccessCard: View {
    let card: QuickAccessModel.Card
    let feedback: String?
    let controller: QuickAccessController
    @State private var hovering = false

    private var item: HistoryItem { card.item }

    var body: some View {
        ZStack {
            Image(nsImage: card.thumbnail)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: QuickAccessController.cardSize.width, height: QuickAccessController.cardSize.height)
                .clipped()
                .onDrag {
                    NSItemProvider(contentsOf: item.url) ?? NSItemProvider()
                }
                .accessibilityLabel(item.kind == .recording ? "Recording preview. Drag to share." : "Screenshot preview. Drag to share.")

            if hovering || feedback != nil {
                Color.black.opacity(0.42)
                    .allowsHitTesting(false)
            }

            if let feedback {
                Label(feedback, systemImage: "checkmark.circle.fill")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.white)
            } else if hovering {
                VStack(spacing: 8) {
                    if item.kind == .screenshot {
                        cardButton("Annotate", "pencil.tip.crop.circle") { controller.perform(\.annotate, item) }
                    } else {
                        cardButton("Play", "play.fill") { NSWorkspace.shared.open(item.url) }
                    }
                    HStack(spacing: 8) {
                        cardButton("Copy", "doc.on.doc") { controller.perform(\.copy, item) }
                        cardButton("Save", "square.and.arrow.down") { controller.perform(\.save, item) }
                    }
                }
            }

            VStack {
                HStack {
                    if hovering {
                        roundButton("xmark", label: "Dismiss") { controller.dismiss(item.id) }
                    }
                    Spacer()
                    if hovering {
                        roundButton("folder", label: "Show in Finder") { controller.perform(\.reveal, item) }
                        roundButton("trash", label: "Delete") { controller.perform(\.delete, item) }
                    }
                }
                Spacer()
            }
            .padding(8)
        }
        .frame(width: QuickAccessController.cardSize.width, height: QuickAccessController.cardSize.height)
        .background(Color.black)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Color.white.opacity(0.14)))
        .shadow(color: .black.opacity(0.35), radius: 14, y: 8)
        .onHover { inside in
            hovering = inside
            controller.setHovering(item.id, inside)
        }
        .contextMenu {
            if item.kind == .screenshot { Button("Annotate") { controller.perform(\.annotate, item) } }
            Button("Copy") { controller.perform(\.copy, item) }
            Button("Save to Folder") { controller.perform(\.save, item) }
            Button("Show in Finder") { controller.perform(\.reveal, item) }
            Divider()
            Button("Delete", role: .destructive) { controller.perform(\.delete, item) }
            Button("Dismiss") { controller.dismiss(item.id) }
        }
        .accessibilityElement(children: .contain)
    }

    private func cardButton(_ title: String, _ symbol: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: symbol)
                .font(.system(size: 12, weight: .semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(.ultraThinMaterial, in: Capsule())
        }
        .buttonStyle(.plain)
        .foregroundStyle(.white)
        .environment(\.colorScheme, .dark)
    }

    private func roundButton(_ symbol: String, label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol)
                .font(.system(size: 10.5, weight: .bold))
                .frame(width: 22, height: 22)
                .background(.ultraThinMaterial, in: Circle())
        }
        .buttonStyle(.plain)
        .foregroundStyle(.white)
        .environment(\.colorScheme, .dark)
        .help(label)
        .accessibilityLabel(label)
    }
}
