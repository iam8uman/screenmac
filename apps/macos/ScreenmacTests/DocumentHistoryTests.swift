import XCTest
@testable import Screenmac

final class DocumentHistoryTests: XCTestCase {
    private func doc(_ count: Int) -> EditorDocument {
        var d = EditorDocument()
        for i in 0..<count {
            d.annotations.append(Annotation(id: UUID(uuidString: String(format: "00000000-0000-0000-0000-%012d", i))!, .redact(rect: CGRect(x: i, y: 0, width: 10, height: 10))))
        }
        return d
    }

    func testCommitUndoRedo() {
        var h = DocumentHistory()
        h.commit(doc(1))
        h.commit(doc(2))
        XCTAssertEqual(h.present.annotations.count, 2)
        h.undo()
        XCTAssertEqual(h.present.annotations.count, 1)
        h.undo()
        XCTAssertEqual(h.present.annotations.count, 0)
        XCTAssertFalse(h.canUndo)
        h.redo()
        h.redo()
        XCTAssertEqual(h.present.annotations.count, 2)
        XCTAssertFalse(h.canRedo)
    }

    func testCommittingSameDocumentIsNoOp() {
        var h = DocumentHistory()
        h.commit(EditorDocument())
        XCTAssertFalse(h.canUndo)
    }

    func testNewCommitClearsRedo() {
        var h = DocumentHistory()
        h.commit(doc(1))
        h.undo()
        h.commit(doc(3))
        XCTAssertFalse(h.canRedo)
    }

    func testGestureIsOneUndoStep() {
        var h = DocumentHistory(doc(1))
        h.beginGesture()
        for n in 2...6 { h.preview(doc(n)) }
        h.endGesture()
        XCTAssertEqual(h.present.annotations.count, 6)
        h.undo()
        XCTAssertEqual(h.present.annotations.count, 1)
    }

    func testCancelledGestureLeavesNoTrace() {
        var h = DocumentHistory(doc(1))
        h.beginGesture()
        h.preview(doc(4))
        h.cancelGesture()
        XCTAssertEqual(h.present, doc(1))
        XCTAssertFalse(h.canUndo)
    }

    func testUndoDuringGestureSettlesItFirst() {
        var h = DocumentHistory(doc(1))
        h.beginGesture()
        h.preview(doc(2))
        h.undo()
        XCTAssertEqual(h.present.annotations.count, 1)
        XCTAssertTrue(h.canRedo)
    }

    func testBackdropChangeIsUndoable() {
        var h = DocumentHistory()
        var next = EditorDocument()
        next.backdrop.id = .violet
        h.commit(next)
        XCTAssertEqual(h.present.backdrop.id, .violet)
        h.undo()
        XCTAssertEqual(h.present.backdrop.id, .none)
        h.redo()
        XCTAssertEqual(h.present.backdrop.id, .violet)
    }

    func testHistoryIsCapped() {
        var h = DocumentHistory()
        for n in 1...(DocumentHistory.limit + 20) { h.commit(doc(n % 7 == 0 ? n : n)) }
        XCTAssertEqual(h.past.count, DocumentHistory.limit)
    }
}
