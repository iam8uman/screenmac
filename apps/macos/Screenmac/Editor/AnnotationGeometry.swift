import AppKit
import CoreGraphics

/// Text layout shared by the renderer and hit testing, so selection matches what's drawn.
enum TextLayout {
    static let paddingX: CGFloat = 0.35 // × font size
    static let paddingY: CGFloat = 0.2

    static func font(size: CGFloat) -> NSFont {
        NSFont.systemFont(ofSize: size, weight: .semibold)
    }

    static func attributed(_ string: String, size: CGFloat, color: NSColor) -> NSAttributedString {
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineHeightMultiple = 1.05
        return NSAttributedString(string: string.isEmpty ? " " : string, attributes: [
            .font: font(size: size),
            .foregroundColor: color,
            .paragraphStyle: paragraph,
        ])
    }

    static func textSize(_ string: String, size: CGFloat) -> CGSize {
        let bounds = attributed(string, size: size, color: .black)
            .boundingRect(with: CGSize(width: 100_000, height: 100_000), options: [.usesLineFragmentOrigin, .usesFontLeading])
        return CGSize(width: ceil(bounds.width), height: ceil(bounds.height))
    }

    static func box(origin: CGPoint, string: String, size: CGFloat) -> CGRect {
        let text = textSize(string, size: size)
        return CGRect(x: origin.x, y: origin.y, width: text.width + size * paddingX * 2, height: text.height + size * paddingY * 2)
    }
}

/// What a pointer press can grab on a selected annotation.
enum AnnotationHandle: Equatable {
    case start
    case end
    case rect(Handle)
}

extension Annotation {
    /// Bounding box in image pixels.
    var bounds: CGRect {
        switch shape {
        case .arrow(let a, let b, let s), .line(let a, let b, let s):
            return Geometry.rect(from: a, to: b).insetBy(dx: -s.width * 2, dy: -s.width * 2)
        case .rectangle(let r, _, _), .ellipse(let r, _), .blur(let r, _), .pixelate(let r, _), .redact(let r):
            return r
        case .pencil(let points, let s), .highlighter(let points, let s):
            guard let first = points.first else { return .zero }
            var r = CGRect(origin: first, size: .zero)
            for p in points { r = r.union(CGRect(origin: p, size: .zero)) }
            return r.insetBy(dx: -s.width / 2, dy: -s.width / 2)
        case .text(let origin, let string, _, let size, _):
            return TextLayout.box(origin: origin, string: string, size: size)
        case .counter(let c, _, _, let radius):
            return CGRect(x: c.x - radius, y: c.y - radius, width: radius * 2, height: radius * 2)
        }
    }

    func hitTest(_ p: CGPoint, tolerance: CGFloat) -> Bool {
        switch shape {
        case .arrow(let a, let b, let s), .line(let a, let b, let s):
            return Geometry.distance(from: p, toSegment: a, b) <= s.width / 2 + tolerance
        case .pencil(let points, let s), .highlighter(let points, let s):
            let reach = s.width / 2 + tolerance
            if points.count == 1 { return hypot(p.x - points[0].x, p.y - points[0].y) <= reach }
            for i in 1..<max(points.count, 1) where Geometry.distance(from: p, toSegment: points[i - 1], points[i]) <= reach {
                return true
            }
            return false
        case .rectangle(let r, let s, let filled):
            if filled { return r.insetBy(dx: -tolerance, dy: -tolerance).contains(p) }
            let reach = s.width / 2 + tolerance
            let outer = r.insetBy(dx: -reach, dy: -reach)
            let inner = r.insetBy(dx: reach, dy: reach)
            return outer.contains(p) && (inner.isEmpty || !inner.contains(p))
        case .ellipse(let r, let s):
            let rx = r.width / 2, ry = r.height / 2
            guard rx > 0, ry > 0 else { return false }
            let n = hypot((p.x - r.midX) / rx, (p.y - r.midY) / ry)
            return abs(n - 1) * min(rx, ry) <= s.width / 2 + tolerance
        case .counter(let c, _, _, let radius):
            return hypot(p.x - c.x, p.y - c.y) <= radius + tolerance
        case .text, .blur, .pixelate, .redact:
            return bounds.insetBy(dx: -tolerance, dy: -tolerance).contains(p)
        }
    }

    func translated(dx: CGFloat, dy: CGFloat) -> Annotation {
        func m(_ p: CGPoint) -> CGPoint { CGPoint(x: p.x + dx, y: p.y + dy) }
        func m(_ r: CGRect) -> CGRect { r.offsetBy(dx: dx, dy: dy) }
        var copy = self
        switch shape {
        case .arrow(let a, let b, let s): copy.shape = .arrow(start: m(a), end: m(b), stroke: s)
        case .line(let a, let b, let s): copy.shape = .line(start: m(a), end: m(b), stroke: s)
        case .rectangle(let r, let s, let f): copy.shape = .rectangle(rect: m(r), stroke: s, filled: f)
        case .ellipse(let r, let s): copy.shape = .ellipse(rect: m(r), stroke: s)
        case .pencil(let pts, let s): copy.shape = .pencil(points: pts.map(m), stroke: s)
        case .highlighter(let pts, let s): copy.shape = .highlighter(points: pts.map(m), stroke: s)
        case .text(let o, let str, let c, let size, let label): copy.shape = .text(origin: m(o), string: str, color: c, fontSize: size, label: label)
        case .counter(let c, let v, let color, let r): copy.shape = .counter(center: m(c), value: v, color: color, radius: r)
        case .blur(let r, let radius): copy.shape = .blur(rect: m(r), radius: radius)
        case .pixelate(let r, let block): copy.shape = .pixelate(rect: m(r), block: block)
        case .redact(let r): copy.shape = .redact(rect: m(r))
        }
        return copy
    }

    /// Resize handles. Freehand, text, and counters only move.
    var handles: [(AnnotationHandle, CGPoint)] {
        switch shape {
        case .arrow(let a, let b, _), .line(let a, let b, _):
            return [(.start, a), (.end, b)]
        case .rectangle(let r, _, _), .ellipse(let r, _), .blur(let r, _), .pixelate(let r, _), .redact(let r):
            return Handle.allCases.map { (.rect($0), $0.point(on: r)) }
        default:
            return []
        }
    }

    func handle(at p: CGPoint, tolerance: CGFloat) -> AnnotationHandle? {
        handles.first { abs($0.1.x - p.x) <= tolerance && abs($0.1.y - p.y) <= tolerance }?.0
    }

    func resized(_ handle: AnnotationHandle, to p: CGPoint) -> Annotation {
        var copy = self
        switch (shape, handle) {
        case (.arrow(_, let b, let s), .start): copy.shape = .arrow(start: p, end: b, stroke: s)
        case (.arrow(let a, _, let s), .end): copy.shape = .arrow(start: a, end: p, stroke: s)
        case (.line(_, let b, let s), .start): copy.shape = .line(start: p, end: b, stroke: s)
        case (.line(let a, _, let s), .end): copy.shape = .line(start: a, end: p, stroke: s)
        case (.rectangle(let r, let s, let f), .rect(let h)): copy.shape = .rectangle(rect: h.resize(r, to: p), stroke: s, filled: f)
        case (.ellipse(let r, let s), .rect(let h)): copy.shape = .ellipse(rect: h.resize(r, to: p), stroke: s)
        case (.blur(let r, let v), .rect(let h)): copy.shape = .blur(rect: h.resize(r, to: p), radius: v)
        case (.pixelate(let r, let v), .rect(let h)): copy.shape = .pixelate(rect: h.resize(r, to: p), block: v)
        case (.redact(let r), .rect(let h)): copy.shape = .redact(rect: h.resize(r, to: p))
        default: break
        }
        return copy
    }

    /// A freshly drawn mark too small to keep (an accidental click).
    var isNegligible: Bool {
        switch shape {
        case .arrow(let a, let b, _), .line(let a, let b, _):
            return hypot(b.x - a.x, b.y - a.y) < 6
        case .rectangle(let r, _, _), .ellipse(let r, _), .blur(let r, _), .pixelate(let r, _), .redact(let r):
            return r.width < 6 || r.height < 6
        case .pencil(let pts, _), .highlighter(let pts, _):
            return pts.count < 2
        case .text(_, let s, _, _, _):
            return s.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        case .counter:
            return false
        }
    }

    /// Apply a new color where the shape has one.
    func recolored(_ color: RGBA) -> Annotation {
        var copy = self
        switch shape {
        case .arrow(let a, let b, var s): s.color = color; copy.shape = .arrow(start: a, end: b, stroke: s)
        case .line(let a, let b, var s): s.color = color; copy.shape = .line(start: a, end: b, stroke: s)
        case .rectangle(let r, var s, let f): s.color = color; copy.shape = .rectangle(rect: r, stroke: s, filled: f)
        case .ellipse(let r, var s): s.color = color; copy.shape = .ellipse(rect: r, stroke: s)
        case .pencil(let p, var s): s.color = color; copy.shape = .pencil(points: p, stroke: s)
        case .highlighter(let p, var s): s.color = color; copy.shape = .highlighter(points: p, stroke: s)
        case .text(let o, let str, _, let size, let label): copy.shape = .text(origin: o, string: str, color: color, fontSize: size, label: label)
        case .counter(let c, let v, _, let r): copy.shape = .counter(center: c, value: v, color: color, radius: r)
        default: break
        }
        return copy
    }

    /// Apply a Fine/Medium/Bold size where the shape has one.
    func resizedStroke(_ size: StrokeSize, unit: CGFloat) -> Annotation {
        var copy = self
        let w = CGFloat(size.rawValue) * unit
        switch shape {
        case .arrow(let a, let b, var s): s.width = w; copy.shape = .arrow(start: a, end: b, stroke: s)
        case .line(let a, let b, var s): s.width = w; copy.shape = .line(start: a, end: b, stroke: s)
        case .rectangle(let r, var s, let f): s.width = w; copy.shape = .rectangle(rect: r, stroke: s, filled: f)
        case .ellipse(let r, var s): s.width = w; copy.shape = .ellipse(rect: r, stroke: s)
        case .pencil(let p, var s): s.width = w; copy.shape = .pencil(points: p, stroke: s)
        case .highlighter(let p, var s): s.width = w * 3.4; copy.shape = .highlighter(points: p, stroke: s)
        case .text(let o, let str, let c, _, let label): copy.shape = .text(origin: o, string: str, color: c, fontSize: size.fontSize * unit, label: label)
        case .counter(let c, let v, let color, _): copy.shape = .counter(center: c, value: v, color: color, radius: size.counterRadius * unit)
        default: break
        }
        return copy
    }
}

/// Drop near-duplicate points from freehand input.
func simplifyStroke(_ points: [CGPoint], minDistance: CGFloat) -> [CGPoint] {
    guard points.count > 2, let first = points.first, let last = points.last else { return points }
    var result = [first]
    for p in points.dropFirst().dropLast() {
        let q = result[result.count - 1]
        if hypot(p.x - q.x, p.y - q.y) >= minDistance { result.append(p) }
    }
    result.append(last)
    return result
}
