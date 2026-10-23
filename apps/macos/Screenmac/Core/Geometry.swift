import CoreGraphics
import Foundation

/// Coordinate helpers.
///
/// Three spaces show up in this app:
/// - **Cocoa global** (AppKit, `NSScreen.frame`): origin at the bottom-left of the primary display, y up.
/// - **Quartz global** (ScreenCaptureKit, `SCWindow.frame`, `CGDisplayBounds`): origin at the top-left of the primary display, y down.
/// - **Image pixels**: origin top-left of a captured image, y down, in physical pixels.
enum Geometry {
    /// Convert a rect between Cocoa global and Quartz global coordinates.
    /// The conversion is its own inverse. `primaryHeight` is the height of the primary display in points.
    static func flip(_ rect: CGRect, primaryHeight: CGFloat) -> CGRect {
        CGRect(x: rect.minX, y: primaryHeight - rect.maxY, width: rect.width, height: rect.height)
    }

    static func flip(_ point: CGPoint, primaryHeight: CGFloat) -> CGPoint {
        CGPoint(x: point.x, y: primaryHeight - point.y)
    }

    /// Rect spanned by two points, with non-negative size.
    static func rect(from a: CGPoint, to b: CGPoint) -> CGRect {
        CGRect(x: min(a.x, b.x), y: min(a.y, b.y), width: abs(b.x - a.x), height: abs(b.y - a.y))
    }

    /// Clamp `rect` so it lies inside `bounds`.
    static func clamp(_ rect: CGRect, to bounds: CGRect) -> CGRect {
        let r = rect.standardized.intersection(bounds)
        return r.isNull ? .zero : r
    }

    /// Move `rect` so it stays fully inside `bounds` without resizing it (if it fits).
    static func keep(_ rect: CGRect, inside bounds: CGRect) -> CGRect {
        var r = rect
        r.size.width = min(r.width, bounds.width)
        r.size.height = min(r.height, bounds.height)
        r.origin.x = min(max(r.minX, bounds.minX), bounds.maxX - r.width)
        r.origin.y = min(max(r.minY, bounds.minY), bounds.maxY - r.height)
        return r
    }

    /// Map a rect in a display's local point space (top-left origin) to that display's image pixels.
    static func pixelRect(for pointRect: CGRect, scale: CGFloat) -> CGRect {
        CGRect(
            x: (pointRect.minX * scale).rounded(),
            y: (pointRect.minY * scale).rounded(),
            width: (pointRect.width * scale).rounded(),
            height: (pointRect.height * scale).rounded()
        )
    }

    /// Distance from `p` to the segment `a`–`b`.
    static func distance(from p: CGPoint, toSegment a: CGPoint, _ b: CGPoint) -> CGFloat {
        let dx = b.x - a.x
        let dy = b.y - a.y
        let lengthSquared = dx * dx + dy * dy
        if lengthSquared == 0 { return hypot(p.x - a.x, p.y - a.y) }
        let t = max(0, min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared))
        return hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
    }

    /// Snap the end of a segment to 45° steps.
    static func snapAngle(from start: CGPoint, to end: CGPoint) -> CGPoint {
        let dx = end.x - start.x
        let dy = end.y - start.y
        let length = hypot(dx, dy)
        let step = CGFloat.pi / 4
        let angle = (atan2(dy, dx) / step).rounded() * step
        return CGPoint(x: start.x + cos(angle) * length, y: start.y + sin(angle) * length)
    }

    /// Constrain a drag to a square.
    static func square(from start: CGPoint, to end: CGPoint) -> CGPoint {
        let dx = end.x - start.x
        let dy = end.y - start.y
        let side = max(abs(dx), abs(dy))
        return CGPoint(x: start.x + (dx < 0 ? -side : side), y: start.y + (dy < 0 ? -side : side))
    }

    /// Even dimensions for video encoders.
    static func even(_ value: CGFloat) -> Int {
        let v = Int(value.rounded())
        return max(2, v - v % 2)
    }
}

/// The eight resize handles of a rectangle.
enum Handle: String, CaseIterable, Sendable {
    case topLeft, top, topRight, right, bottomRight, bottom, bottomLeft, left

    /// Position of the handle on `rect` (y down: "top" is minY).
    func point(on rect: CGRect) -> CGPoint {
        switch self {
        case .topLeft: return CGPoint(x: rect.minX, y: rect.minY)
        case .top: return CGPoint(x: rect.midX, y: rect.minY)
        case .topRight: return CGPoint(x: rect.maxX, y: rect.minY)
        case .right: return CGPoint(x: rect.maxX, y: rect.midY)
        case .bottomRight: return CGPoint(x: rect.maxX, y: rect.maxY)
        case .bottom: return CGPoint(x: rect.midX, y: rect.maxY)
        case .bottomLeft: return CGPoint(x: rect.minX, y: rect.maxY)
        case .left: return CGPoint(x: rect.minX, y: rect.midY)
        }
    }

    /// Resize `rect` by dragging this handle to `point`. Flips cleanly past the opposite edge.
    func resize(_ rect: CGRect, to point: CGPoint) -> CGRect {
        var minX = rect.minX, minY = rect.minY, maxX = rect.maxX, maxY = rect.maxY
        switch self {
        case .topLeft: minX = point.x; minY = point.y
        case .top: minY = point.y
        case .topRight: maxX = point.x; minY = point.y
        case .right: maxX = point.x
        case .bottomRight: maxX = point.x; maxY = point.y
        case .bottom: maxY = point.y
        case .bottomLeft: minX = point.x; maxY = point.y
        case .left: minX = point.x
        }
        return Geometry.rect(from: CGPoint(x: minX, y: minY), to: CGPoint(x: maxX, y: maxY))
    }

    static func hit(_ rect: CGRect, at point: CGPoint, tolerance: CGFloat) -> Handle? {
        allCases.first { handle in
            let p = handle.point(on: rect)
            return abs(p.x - point.x) <= tolerance && abs(p.y - point.y) <= tolerance
        }
    }
}
