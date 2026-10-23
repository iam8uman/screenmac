import XCTest
@testable import Screenmac

final class AnnotationTests: XCTestCase {
    private let stroke = Stroke(color: RGBA(hex: 0xF0443A), width: 6)

    func testHitTestingOutlinedRectangleOnlyNearEdges() {
        let a = Annotation(.rectangle(rect: CGRect(x: 0, y: 0, width: 100, height: 100), stroke: stroke, filled: false))
        XCTAssertTrue(a.hitTest(CGPoint(x: 1, y: 50), tolerance: 2))
        XCTAssertFalse(a.hitTest(CGPoint(x: 50, y: 50), tolerance: 2))
        let filled = Annotation(.rectangle(rect: CGRect(x: 0, y: 0, width: 100, height: 100), stroke: stroke, filled: true))
        XCTAssertTrue(filled.hitTest(CGPoint(x: 50, y: 50), tolerance: 2))
    }

    func testTranslateMovesEveryPoint() {
        let a = Annotation(.arrow(start: .zero, end: CGPoint(x: 10, y: 10), stroke: stroke)).translated(dx: 5, dy: -5)
        guard case .arrow(let s, let e, _) = a.shape else { return XCTFail("expected arrow") }
        XCTAssertEqual(s, CGPoint(x: 5, y: -5))
        XCTAssertEqual(e, CGPoint(x: 15, y: 5))
    }

    func testResizeArrowEnd() {
        let a = Annotation(.arrow(start: .zero, end: CGPoint(x: 10, y: 10), stroke: stroke)).resized(.end, to: CGPoint(x: 40, y: 0))
        guard case .arrow(_, let e, _) = a.shape else { return XCTFail("expected arrow") }
        XCTAssertEqual(e, CGPoint(x: 40, y: 0))
    }

    func testNegligibleMarksAreDropped() {
        XCTAssertTrue(Annotation(.rectangle(rect: CGRect(x: 0, y: 0, width: 3, height: 80), stroke: stroke, filled: false)).isNegligible)
        XCTAssertTrue(Annotation(.text(origin: .zero, string: "  ", color: stroke.color, fontSize: 20, label: true)).isNegligible)
        XCTAssertFalse(Annotation(.counter(center: .zero, value: 1, color: stroke.color, radius: 10)).isNegligible)
    }

    func testCountersNumberThemselves() {
        var doc = EditorDocument()
        XCTAssertEqual(doc.nextCounterValue, 1)
        doc.annotations.append(Annotation(.counter(center: .zero, value: 1, color: stroke.color, radius: 10)))
        doc.annotations.append(Annotation(.counter(center: .zero, value: 4, color: stroke.color, radius: 10)))
        XCTAssertEqual(doc.nextCounterValue, 5)
    }

    func testRecolorAndResizeStroke() {
        let a = Annotation(.line(start: .zero, end: CGPoint(x: 1, y: 1), stroke: stroke))
        let b = a.recolored(RGBA(hex: 0x19C08A)).resizedStroke(.bold, unit: 2)
        guard case .line(_, _, let s) = b.shape else { return XCTFail("expected line") }
        XCTAssertEqual(s.color, RGBA(hex: 0x19C08A))
        XCTAssertEqual(s.width, 22)
    }

    func testToolShortcutsAreUnique() {
        XCTAssertEqual(Set(Tool.allCases.map(\.key)).count, Tool.allCases.count)
        XCTAssertEqual(Tool.forKey("R"), .rectangle)
        XCTAssertEqual(Tool.allCases.count, 14)
    }

    func testSimplifyKeepsEndpoints() {
        let points = (0...100).map { CGPoint(x: CGFloat($0) * 0.1, y: 0) }
        let simplified = simplifyStroke(points, minDistance: 2)
        XCTAssertEqual(simplified.first, points.first)
        XCTAssertEqual(simplified.last, points.last)
        XCTAssertLessThan(simplified.count, points.count)
    }
}
