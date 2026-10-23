import XCTest
@testable import Screenmac

final class GeometryTests: XCTestCase {
    func testFlipIsItsOwnInverse() {
        let r = CGRect(x: 10, y: 20, width: 300, height: 200)
        let flipped = Geometry.flip(r, primaryHeight: 1000)
        XCTAssertEqual(flipped, CGRect(x: 10, y: 780, width: 300, height: 200))
        XCTAssertEqual(Geometry.flip(flipped, primaryHeight: 1000), r)
    }

    func testRectFromPointsIsNormalized() {
        XCTAssertEqual(Geometry.rect(from: CGPoint(x: 50, y: 80), to: CGPoint(x: 10, y: 20)), CGRect(x: 10, y: 20, width: 40, height: 60))
    }

    func testPixelRectScalesForRetina() {
        XCTAssertEqual(Geometry.pixelRect(for: CGRect(x: 10.2, y: 5, width: 100, height: 50), scale: 2), CGRect(x: 20, y: 10, width: 200, height: 100))
    }

    func testKeepInsideMovesWithoutResizing() {
        let bounds = CGRect(x: 0, y: 0, width: 100, height: 100)
        XCTAssertEqual(Geometry.keep(CGRect(x: 80, y: -10, width: 40, height: 30), inside: bounds), CGRect(x: 60, y: 0, width: 40, height: 30))
    }

    func testHandleResizeFlipsPastOppositeEdge() {
        let r = CGRect(x: 10, y: 10, width: 50, height: 50)
        XCTAssertEqual(Handle.right.resize(r, to: CGPoint(x: 0, y: 30)), CGRect(x: 0, y: 10, width: 10, height: 50))
        XCTAssertEqual(Handle.topLeft.resize(r, to: CGPoint(x: 0, y: 0)), CGRect(x: 0, y: 0, width: 60, height: 60))
    }

    func testSnapAngleTo45Degrees() {
        let p = Geometry.snapAngle(from: .zero, to: CGPoint(x: 100, y: 8))
        XCTAssertEqual(p.y, 0, accuracy: 0.001)
        XCTAssertEqual(p.x, hypot(100, 8), accuracy: 0.001)
    }

    func testEvenDimensionsForVideo() {
        XCTAssertEqual(Geometry.even(101), 100)
        XCTAssertEqual(Geometry.even(1), 2)
    }

    func testDistanceToSegment() {
        XCTAssertEqual(Geometry.distance(from: CGPoint(x: 5, y: 5), toSegment: .zero, CGPoint(x: 10, y: 0)), 5, accuracy: 0.0001)
        XCTAssertEqual(Geometry.distance(from: CGPoint(x: 20, y: 0), toSegment: .zero, CGPoint(x: 10, y: 0)), 10, accuracy: 0.0001)
    }
}
