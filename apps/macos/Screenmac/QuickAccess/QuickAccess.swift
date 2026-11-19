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

    /// Newest first. Index 0 is the card that sits in the screen corner.
    @Published var cards: [Card] = []
    @Published var corner: QuickAccessCorner = .bottomRight
    @Published var feedback: [UUID: String] = [:]
    /// Collapsed, older captures sit as a deck behind the newest one. Hovering the deck opens
    /// every capture as one column along the screen edge, scrollable when it's taller than the screen.
    @Published var expanded = false
    /// The tallest the scrolling column may be on the current screen, padding included.
    @Published var maxScrollHeight: CGFloat = 600
}

/// Pure layout math for the Quick Access stack, shared by the panel sizing and the SwiftUI view.
enum QuickAccessLayout {
    static let card = CGSize(width: 232, height: 158)
    static let spacing: CGFloat = 10
    /// Room around the cards for their shadows, inside the scroll view so nothing gets clipped.
    static let padding: CGFloat = 12
    static let headerHeight: CGFloat = 24
    /// How far each card behind the front one peeks out of the deck.
    static let deckStep: CGFloat = 7
    static let deckDepth = 2

    static var panelWidth: CGFloat { card.width + 2 * padding }
    /// The header and the gap between it and the column.
    static var headerBlock: CGFloat { padding + headerHeight }

    static func deckPeek(count: Int) -> CGFloat {
        CGFloat(min(max(count - 1, 0), deckDepth)) * deckStep
    }

    /// Height of the cards themselves: the deck, or the full column.
    static func listHeight(count: Int, expanded: Bool) -> CGFloat {
        let n = max(count, 1)
        guard expanded, n > 1 else { return card.height + deckPeek(count: n) }
        return CGFloat(n) * card.height + CGFloat(n - 1) * spacing
    }

    /// Height of the scroll view's frame, padding included, capped to what the screen allows.
    static func scrollHeight(count: Int, expanded: Bool, max maxHeight: CGFloat) -> CGFloat {
        let full = listHeight(count: count, expanded: expanded) + 2 * padding
        return expanded && count > 1 ? min(full, maxHeight) : full
    }

    static func panelHeight(count: Int, expanded: Bool, maxScroll: CGFloat) -> CGFloat {
        let scroll = scrollHeight(count: count, expanded: expanded, max: maxScroll)
        return expanded && count > 1 ? headerBlock + scroll : scroll
    }
}

/// A floating, non-activating stack of recent captures in a screen corner.
/// It never takes keyboard focus away from the app you're working in.
@MainActor
final class QuickAccessController {
    static let maxCards = 30

    private let model = QuickAccessModel()
    private var panel: NSPanel?
    private var dismissTimer: Timer?
    private var collapseWork: DispatchWorkItem?
    private var resizeWork: DispatchWorkItem?
    private var stackHovering = false
    private var screen: NSScreen?
    private let preferences: Preferences
    var actions: QuickAccessActions?

    static let spring = Animation.spring(response: 0.34, dampingFraction: 0.84)

    init(preferences: Preferences) {
        self.preferences = preferences
    }

    func show(_ item: HistoryItem, thumbnail: NSImage, on screen: NSScreen?) {
        model.corner = preferences.quickAccessCorner
        self.screen = screen ?? NSScreen.underPointer
        withAnimation(Self.spring) {
            model.cards.removeAll { $0.item.id == item.id }
            model.cards.insert(.init(item: item, thumbnail: thumbnail), at: 0)
            if model.cards.count > Self.maxCards {
                model.cards = Array(model.cards.prefix(Self.maxCards))
            }
        }
        ensurePanel()
        layout()
        scheduleDismiss()
    }

    func dismiss(_ id: UUID) {
        withAnimation(Self.spring) {
            model.cards.removeAll { $0.id == id }
            if model.cards.count < 2 { model.expanded = false }
        }
        model.feedback[id] = nil
        if model.cards.isEmpty {
            dismissTimer?.invalidate()
            dismissTimer = nil
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { [weak self] in
                guard let self, self.model.cards.isEmpty else { return }
                self.panel?.orderOut(nil)
                self.stackHovering = false
            }
        } else {
            // Let the removal animate before the panel shrinks around what's left.
            layoutAfterAnimation()
        }
    }

    func dismissAll() {
        dismissTimer?.invalidate()
        dismissTimer = nil
        withAnimation(Self.spring) {
            model.cards.removeAll()
            model.expanded = false
        }
        model.feedback.removeAll()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { [weak self] in
            guard let self, self.model.cards.isEmpty else { return }
            self.panel?.orderOut(nil)
            self.stackHovering = false
        }
    }

    func flash(_ id: UUID, _ message: String) {
        model.feedback[id] = message
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) { [weak self] in
            if self?.model.feedback[id] == message { self?.model.feedback[id] = nil }
        }
    }

    /// The pointer entered or left the whole stack. While it's inside, nothing dismisses and a
    /// deck of two or more fans out so every capture can be reached.
    func setStackHovering(_ inside: Bool) {
        stackHovering = inside
        if inside {
            dismissTimer?.invalidate()
            dismissTimer = nil
            collapseWork?.cancel()
            collapseWork = nil
            if model.cards.count > 1 && !model.expanded {
                resizeWork?.cancel()
                layout(expanded: true) // Grow the panel first so the cards have room to fan out.
                withAnimation(Self.spring) { model.expanded = true }
            }
        } else {
            scheduleDismiss()
            let work = DispatchWorkItem { [weak self] in self?.collapse() }
            collapseWork = work
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3, execute: work)
        }
    }

    private func collapse() {
        guard model.expanded, !stackHovering else { return }
        withAnimation(Self.spring) { model.expanded = false }
        layoutAfterAnimation()
    }

    /// One timer for the whole stack: it restarts on every capture and pauses while hovered,
    /// so an older card never disappears out from under a newer one.
    private func scheduleDismiss() {
        dismissTimer?.invalidate()
        dismissTimer = nil
        let seconds = preferences.quickAccessDismissSeconds
        guard seconds > 0, !stackHovering else { return }
        dismissTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval(seconds), repeats: false) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self, !self.stackHovering else { return }
                self.dismissAll()
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

    private func layoutAfterAnimation() {
        resizeWork?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.layout() }
        resizeWork = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4, execute: work)
    }

    private func layout(expanded: Bool? = nil) {
        guard let panel, let screen = screen ?? NSScreen.main else { return }
        let margin: CGFloat = 16
        let area = screen.visibleFrame
        let pad = QuickAccessLayout.padding

        // The panel may run from margin to margin along the screen's height; the column scrolls past that.
        let maxPanel = area.height - 2 * margin + 2 * pad
        let maxScroll = max(QuickAccessLayout.card.height + 2 * pad, maxPanel - QuickAccessLayout.headerBlock)
        if model.maxScrollHeight != maxScroll { model.maxScrollHeight = maxScroll }

        let height = QuickAccessLayout.panelHeight(count: model.cards.count, expanded: expanded ?? model.expanded, maxScroll: maxScroll)
        let size = CGSize(width: QuickAccessLayout.panelWidth, height: height)
        let x: CGFloat
        let y: CGFloat
        switch model.corner {
        case .bottomRight: x = area.maxX - size.width - margin + pad; y = area.minY + margin - pad
        case .bottomLeft: x = area.minX + margin - pad; y = area.minY + margin - pad
        case .topRight: x = area.maxX - size.width - margin + pad; y = area.maxY - size.height - margin + pad
        case .topLeft: x = area.minX + margin - pad; y = area.maxY - size.height - margin + pad
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

    private var isBottom: Bool { model.corner == .bottomRight || model.corner == .bottomLeft }
    private var isLeading: Bool { model.corner == .bottomLeft || model.corner == .topLeft }
    private var cornerAlignment: Alignment {
        switch model.corner {
        case .bottomRight: .bottomTrailing
        case .bottomLeft: .bottomLeading
        case .topRight: .topTrailing
        case .topLeft: .topLeading
        }
    }
    /// The newest card sits at the corner; older ones run away from it, toward the far edge.
    private var listAlignment: Alignment { isBottom ? .bottom : .top }
    private var showsColumn: Bool { model.expanded && model.cards.count > 1 }

    var body: some View {
        let count = model.cards.count
        let scrollHeight = QuickAccessLayout.scrollHeight(count: count, expanded: showsColumn, max: model.maxScrollHeight)

        VStack(spacing: 0) {
            if showsColumn && isBottom { header.padding(.top, QuickAccessLayout.padding).transition(.opacity) }
            ScrollView(.vertical, showsIndicators: showsColumn) {
                cards(count: count)
                    .padding(QuickAccessLayout.padding)
            }
            .scrollDisabled(!showsColumn)
            // Open at the corner end, so the newest capture stays under the pointer; scroll for older ones.
            .defaultScrollAnchor(isBottom ? .bottom : .top)
            .frame(width: QuickAccessLayout.panelWidth, height: scrollHeight)
            if showsColumn && !isBottom { header.padding(.bottom, QuickAccessLayout.padding).transition(.opacity) }
        }
        .onHover { controller.setStackHovering($0) }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: cornerAlignment)
        .animation(QuickAccessController.spring, value: model.cards)
        .animation(QuickAccessController.spring, value: model.expanded)
    }

    private func cards(count: Int) -> some View {
        ZStack(alignment: listAlignment) {
            ForEach(Array(model.cards.enumerated()), id: \.element.id) { index, card in
                let placement = placement(index: index)
                QuickAccessCard(
                    card: card,
                    feedback: model.feedback[card.id],
                    controller: controller,
                    badge: !showsColumn && index == 0 && count > 1 ? count : nil
                )
                .scaleEffect(placement.scale, anchor: isBottom ? .top : .bottom)
                .brightness(placement.dim)
                .opacity(placement.opacity)
                .offset(y: placement.offset)
                .zIndex(Double(-index))
                .allowsHitTesting(showsColumn || index == 0)
                .transition(.asymmetric(
                    insertion: .move(edge: isLeading ? .leading : .trailing).combined(with: .opacity),
                    removal: .opacity.combined(with: .scale(scale: 0.92))
                ))
            }
        }
        .frame(
            width: QuickAccessLayout.card.width,
            height: QuickAccessLayout.listHeight(count: count, expanded: showsColumn),
            alignment: listAlignment
        )
    }

    private struct Placement {
        var offset: CGFloat
        var scale: CGFloat = 1
        var opacity: Double = 1
        var dim: Double = 0
    }

    /// Where card `index` sits: in the deck behind the newest one, or in its slot in the column.
    private func placement(index: Int) -> Placement {
        let direction: CGFloat = isBottom ? -1 : 1
        if showsColumn {
            return Placement(offset: direction * CGFloat(index) * (QuickAccessLayout.card.height + QuickAccessLayout.spacing))
        }
        let depth = min(index, QuickAccessLayout.deckDepth)
        return Placement(
            offset: direction * CGFloat(depth) * QuickAccessLayout.deckStep,
            scale: 1 - CGFloat(depth) * 0.05,
            opacity: index > QuickAccessLayout.deckDepth ? 0 : 1,
            dim: -Double(depth) * 0.12
        )
    }

    private var header: some View {
        HStack(spacing: 8) {
            Text(model.cards.count == 1 ? "1 capture" : "\(model.cards.count) captures")
                .font(.system(size: 11.5, weight: .semibold))
                .monospacedDigit()
                .padding(.horizontal, 10)
                .frame(height: QuickAccessLayout.headerHeight)
                .background(.ultraThinMaterial, in: Capsule())
            Spacer(minLength: 0)
            Button {
                controller.dismissAll()
            } label: {
                Label("Close All", systemImage: "xmark")
                    .font(.system(size: 11.5, weight: .semibold))
                    .padding(.horizontal, 10)
                    .frame(height: QuickAccessLayout.headerHeight)
                    .background(.ultraThinMaterial, in: Capsule())
            }
            .buttonStyle(.plain)
            .help("Dismiss every capture")
        }
        .foregroundStyle(.white)
        .environment(\.colorScheme, .dark)
        .padding(.horizontal, QuickAccessLayout.padding)
        .frame(width: QuickAccessLayout.panelWidth, height: QuickAccessLayout.headerHeight)
        .shadow(color: .black.opacity(0.25), radius: 6, y: 3)
    }
}

private struct QuickAccessCard: View {
    let card: QuickAccessModel.Card
    let feedback: String?
    let controller: QuickAccessController
    /// Total captures in the deck, shown on the front card while it's collapsed.
    let badge: Int?
    @State private var hovering = false

    private var item: HistoryItem { card.item }
    private var size: CGSize { QuickAccessLayout.card }

    var body: some View {
        ZStack {
            Image(nsImage: card.thumbnail)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: size.width, height: size.height)
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
                    } else if let badge {
                        Text("\(badge)")
                            .font(.system(size: 11, weight: .bold))
                            .monospacedDigit()
                            .foregroundStyle(.white)
                            .padding(.horizontal, 7)
                            .frame(minWidth: 22, minHeight: 22)
                            .background(Color.accentColor, in: Capsule())
                            .overlay(Capsule().strokeBorder(Color.white.opacity(0.35)))
                            .help("\(badge) captures. Hover to see them all.")
                            .accessibilityLabel("\(badge) captures")
                            .transition(.scale.combined(with: .opacity))
                    }
                }
                Spacer()
            }
            .padding(8)
        }
        .frame(width: size.width, height: size.height)
        .background(Color.black)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Color.white.opacity(0.14)))
        .shadow(color: .black.opacity(0.35), radius: 14, y: 8)
        .onHover { hovering = $0 }
        .contextMenu {
            if item.kind == .screenshot { Button("Annotate") { controller.perform(\.annotate, item) } }
            Button("Copy") { controller.perform(\.copy, item) }
            Button("Save to Folder") { controller.perform(\.save, item) }
            Button("Show in Finder") { controller.perform(\.reveal, item) }
            Divider()
            Button("Delete", role: .destructive) { controller.perform(\.delete, item) }
            Button("Dismiss") { controller.dismiss(item.id) }
            Button("Dismiss All") { controller.dismissAll() }
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
