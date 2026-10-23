import Foundation

/// Undo/redo over whole-document snapshots.
///
/// A pointer gesture (drag, resize) previews changes live with `preview(_:)` and
/// becomes exactly one undo step when it ends. `cancelGesture()` restores the
/// document as it was when the gesture began.
struct DocumentHistory: Equatable {
    static let limit = 100

    private(set) var present: EditorDocument
    private(set) var past: [EditorDocument] = []
    private(set) var future: [EditorDocument] = []
    private var gestureBase: EditorDocument?

    init(_ document: EditorDocument = EditorDocument()) {
        present = document
    }

    var canUndo: Bool { !past.isEmpty }
    var canRedo: Bool { !future.isEmpty }
    var isInGesture: Bool { gestureBase != nil }

    /// Record `document` as a new undoable step. No-op if nothing changed.
    mutating func commit(_ document: EditorDocument) {
        settle()
        guard document != present else { return }
        push(present)
        present = document
        future.removeAll()
    }

    mutating func beginGesture() {
        if gestureBase == nil { gestureBase = present }
    }

    mutating func preview(_ document: EditorDocument) {
        guard gestureBase != nil else { return }
        present = document
    }

    mutating func endGesture() {
        guard let base = gestureBase else { return }
        gestureBase = nil
        guard base != present else { return }
        push(base)
        future.removeAll()
    }

    mutating func cancelGesture() {
        guard let base = gestureBase else { return }
        present = base
        gestureBase = nil
    }

    mutating func undo() {
        settle()
        guard let previous = past.popLast() else { return }
        future.insert(present, at: 0)
        present = previous
    }

    mutating func redo() {
        settle()
        guard !future.isEmpty else { return }
        let next = future.removeFirst()
        push(present)
        present = next
    }

    private mutating func settle() {
        if gestureBase != nil { endGesture() }
    }

    private mutating func push(_ document: EditorDocument) {
        past.append(document)
        if past.count > Self.limit { past.removeFirst(past.count - Self.limit) }
    }
}
