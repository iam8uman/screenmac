import AppKit
import CoreImage
import CoreImage.CIFilterBuiltins

/// Computes blur and pixelate patches from the **source** pixels and caches them.
/// Effects are always derived from the original capture, so the result never
/// depends on what was drawn on top, and the exported patch fully replaces the
/// pixels underneath.
@MainActor
final class EffectCache {
    private struct Key: Hashable {
        let kind: Int
        let rect: CGRect
        let value: CGFloat
    }

    private let source: CIImage
    private let height: CGFloat
    private let context = CIContext(options: [.cacheIntermediates: false])
    private var cache: [Key: CGImage] = [:]

    init(base: CGImage) {
        source = CIImage(cgImage: base)
        height = CGFloat(base.height)
    }

    func patch(for annotation: Annotation) -> CGImage? {
        switch annotation.shape {
        case .blur(let rect, let radius): return patch(kind: 0, rect: rect, value: radius)
        case .pixelate(let rect, let block): return patch(kind: 1, rect: rect, value: block)
        default: return nil
        }
    }

    private func patch(kind: Int, rect: CGRect, value: CGFloat) -> CGImage? {
        let bounds = source.extent
        // Image-pixel rect (y down) → Core Image rect (y up).
        let ciRect = CGRect(x: rect.minX, y: height - rect.maxY, width: rect.width, height: rect.height)
            .integral.intersection(bounds)
        guard !ciRect.isNull, ciRect.width >= 1, ciRect.height >= 1 else { return nil }
        let key = Key(kind: kind, rect: ciRect, value: value.rounded())
        if let hit = cache[key] { return hit }

        let input = source.cropped(to: ciRect).clampedToExtent()
        let output: CIImage?
        if kind == 0 {
            let filter = CIFilter.gaussianBlur()
            filter.inputImage = input
            filter.radius = Float(max(1, value))
            output = filter.outputImage
        } else {
            let filter = CIFilter.pixellate()
            filter.inputImage = input
            filter.scale = Float(max(4, value))
            filter.center = CGPoint(x: ciRect.minX, y: ciRect.minY)
            output = filter.outputImage
        }
        guard let output, let image = context.createCGImage(output.cropped(to: ciRect), from: ciRect) else { return nil }
        if cache.count > 64 { cache.removeAll() }
        cache[key] = image
        return image
    }
}

/// One renderer for the editor view and for export, so what you see is exactly
/// what you save. Draws in image pixels into the *current* `NSGraphicsContext`,
/// which must be flipped (origin top-left).
@MainActor
enum Renderer {
    struct Options {
        var hiddenIDs: Set<UUID> = []
        var extra: Annotation?
    }

    static func draw(_ document: EditorDocument, base: CGImage, baseImage: NSImage, effects: EffectCache, options: Options = Options()) {
        let size = CGRect(x: 0, y: 0, width: base.width, height: base.height)
        baseImage.draw(in: size, from: .zero, operation: .copy, fraction: 1, respectFlipped: true, hints: [.interpolation: NSImageInterpolation.high.rawValue])

        var all = document.annotations
        if let extra = options.extra { all.append(extra) }
        let visible = all.filter { !options.hiddenIDs.contains($0.id) }

        // Effects first, from source pixels, so marks drawn later stay crisp on top.
        for a in visible where a.isEffect {
            drawEffect(a, effects: effects, bounds: size)
        }
        for a in visible where !a.isEffect {
            drawMark(a)
        }
    }

    /// Flatten the document into a new bitmap at full resolution (crop applied).
    static func flatten(_ document: EditorDocument, base: CGImage, effects: EffectCache) -> CGImage? {
        let full = CGRect(x: 0, y: 0, width: base.width, height: base.height)
        let crop = (document.crop ?? full).integral.intersection(full)
        guard crop.width >= 1, crop.height >= 1 else { return nil }
        let width = Int(crop.width), height = Int(crop.height)
        guard let space = CGColorSpace(name: CGColorSpace.sRGB),
              let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: space,
                                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
        else { return nil }
        ctx.translateBy(x: 0, y: CGFloat(height))
        ctx.scaleBy(x: 1, y: -1)
        ctx.translateBy(x: -crop.minX, y: -crop.minY)
        let nsContext = NSGraphicsContext(cgContext: ctx, flipped: true)
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = nsContext
        draw(document, base: base, baseImage: NSImage(cgImage: base, size: full.size), effects: effects)
        NSGraphicsContext.restoreGraphicsState()
        return ctx.makeImage()
    }

    // MARK: - Effects

    private static func drawEffect(_ a: Annotation, effects: EffectCache, bounds: CGRect) {
        switch a.shape {
        case .redact(let rect):
            RGBA.redactFill.nsColor.setFill()
            rect.intersection(bounds).fill(using: .copy)
        case .blur(let rect, _), .pixelate(let rect, _):
            let clipped = rect.integral.intersection(bounds)
            guard let patch = effects.patch(for: a), !clipped.isNull else { return }
            NSImage(cgImage: patch, size: clipped.size)
                .draw(in: clipped, from: .zero, operation: .copy, fraction: 1, respectFlipped: true, hints: nil)
        default:
            break
        }
    }

    // MARK: - Marks

    private static func withShadow(blur: CGFloat, offset: CGFloat, alpha: CGFloat = 0.28, _ body: () -> Void) {
        NSGraphicsContext.saveGraphicsState()
        let shadow = NSShadow()
        shadow.shadowColor = NSColor.black.withAlphaComponent(alpha)
        shadow.shadowBlurRadius = blur
        // Flipped context: positive height moves the shadow down.
        shadow.shadowOffset = NSSize(width: 0, height: offset)
        shadow.set()
        body()
        NSGraphicsContext.restoreGraphicsState()
    }

    static func drawMark(_ a: Annotation) {
        switch a.shape {
        case .arrow(let start, let end, let stroke):
            withShadow(blur: max(3, stroke.width * 0.9), offset: max(1, stroke.width * 0.2)) {
                arrowPath(from: start, to: end, width: stroke.width).fill(with: stroke.color)
            }
        case .line(let start, let end, let stroke):
            withShadow(blur: max(3, stroke.width * 0.9), offset: max(1, stroke.width * 0.2)) {
                let path = NSBezierPath()
                path.move(to: start)
                path.line(to: end)
                path.lineWidth = stroke.width
                path.lineCapStyle = .round
                stroke.color.nsColor.setStroke()
                path.stroke()
            }
        case .rectangle(let rect, let stroke, let filled):
            withShadow(blur: max(3, stroke.width * 0.9), offset: max(1, stroke.width * 0.2)) {
                let radius = max(4, stroke.width * 1.1)
                let path = NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
                if filled {
                    stroke.color.nsColor.setFill()
                    path.fill()
                } else {
                    path.lineWidth = stroke.width
                    stroke.color.nsColor.setStroke()
                    path.stroke()
                }
            }
        case .ellipse(let rect, let stroke):
            withShadow(blur: max(3, stroke.width * 0.9), offset: max(1, stroke.width * 0.2)) {
                let path = NSBezierPath(ovalIn: rect)
                path.lineWidth = stroke.width
                stroke.color.nsColor.setStroke()
                path.stroke()
            }
        case .pencil(let points, let stroke):
            withShadow(blur: max(2, stroke.width * 0.5), offset: max(1, stroke.width * 0.12)) {
                let path = smoothPath(points)
                path.lineWidth = stroke.width
                path.lineCapStyle = .round
                path.lineJoinStyle = .round
                stroke.color.nsColor.setStroke()
                path.stroke()
            }
        case .highlighter(let points, let stroke):
            NSGraphicsContext.saveGraphicsState()
            NSGraphicsContext.current?.cgContext.setBlendMode(.multiply)
            let path = smoothPath(points)
            path.lineWidth = stroke.width
            path.lineCapStyle = .round
            path.lineJoinStyle = .round
            stroke.color.nsColor.withAlphaComponent(0.42).setStroke()
            path.stroke()
            NSGraphicsContext.restoreGraphicsState()
        case .text(let origin, let string, let color, let size, let label):
            drawText(origin: origin, string: string, color: color, size: size, label: label)
        case .counter(let center, let value, let color, let radius):
            let circle = CGRect(x: center.x - radius, y: center.y - radius, width: radius * 2, height: radius * 2)
            withShadow(blur: radius * 0.4, offset: radius * 0.1) {
                color.nsColor.setFill()
                NSBezierPath(ovalIn: circle).fill()
            }
            let ring = NSBezierPath(ovalIn: circle)
            ring.lineWidth = max(2, radius * 0.14)
            NSColor.white.withAlphaComponent(0.92).setStroke()
            ring.stroke()
            let text = NSAttributedString(string: "\(value)", attributes: [
                .font: NSFont.systemFont(ofSize: radius * 1.05, weight: .bold),
                .foregroundColor: color.contrastingInk.nsColor,
            ])
            let s = text.size()
            text.draw(at: CGPoint(x: center.x - s.width / 2, y: center.y - s.height / 2))
        case .blur, .pixelate, .redact:
            break
        }
    }

    private static func drawText(origin: CGPoint, string: String, color: RGBA, size: CGFloat, label: Bool) {
        let box = TextLayout.box(origin: origin, string: string, size: size)
        let textOrigin = CGPoint(x: origin.x + size * TextLayout.paddingX, y: origin.y + size * TextLayout.paddingY)
        if label {
            withShadow(blur: size * 0.3, offset: size * 0.06) {
                color.nsColor.setFill()
                NSBezierPath(roundedRect: box, xRadius: size * 0.42, yRadius: size * 0.42).fill()
            }
            TextLayout.attributed(string, size: size, color: color.contrastingInk.nsColor).draw(at: textOrigin)
        } else {
            withShadow(blur: size * 0.18, offset: size * 0.04, alpha: 0.35) {
                TextLayout.attributed(string, size: size, color: color.nsColor).draw(at: textOrigin)
            }
        }
    }

    /// Tapered shaft with a curved-back head, matching the web editor.
    static func arrowPath(from start: CGPoint, to end: CGPoint, width w: CGFloat) -> NSBezierPath {
        let angle = atan2(end.y - start.y, end.x - start.x)
        let length = hypot(end.x - start.x, end.y - start.y)
        let head = min(max(w * 3.4, 16), length * 0.6)
        let spread = CGFloat.pi / 7
        let base = CGPoint(x: end.x - cos(angle) * head * 0.82, y: end.y - sin(angle) * head * 0.82)
        let tail = w * 0.35
        let nx = sin(angle), ny = -cos(angle)

        let path = NSBezierPath()
        path.move(to: CGPoint(x: start.x + nx * tail, y: start.y + ny * tail))
        path.line(to: CGPoint(x: base.x + nx * w / 2, y: base.y + ny * w / 2))
        path.line(to: CGPoint(x: base.x - nx * w / 2, y: base.y - ny * w / 2))
        path.line(to: CGPoint(x: start.x - nx * tail, y: start.y - ny * tail))
        path.close()
        path.appendOval(in: CGRect(x: start.x - tail, y: start.y - tail, width: tail * 2, height: tail * 2))

        let left = CGPoint(x: end.x - cos(angle - spread) * head, y: end.y - sin(angle - spread) * head)
        let right = CGPoint(x: end.x - cos(angle + spread) * head, y: end.y - sin(angle + spread) * head)
        path.move(to: end)
        path.line(to: left)
        path.curve(to: right, controlPoint1: base, controlPoint2: base)
        path.close()
        return path
    }

    static func smoothPath(_ points: [CGPoint]) -> NSBezierPath {
        let path = NSBezierPath()
        guard let first = points.first else { return path }
        path.move(to: first)
        if points.count == 1 {
            path.line(to: CGPoint(x: first.x + 0.01, y: first.y))
            return path
        }
        for i in 1..<(points.count - 1) {
            let mid = CGPoint(x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2)
            path.curve(to: mid, controlPoint1: points[i], controlPoint2: points[i])
        }
        path.line(to: points[points.count - 1])
        return path
    }
}

private extension NSBezierPath {
    func fill(with color: RGBA) {
        color.nsColor.setFill()
        windingRule = .nonZero
        fill()
    }
}
