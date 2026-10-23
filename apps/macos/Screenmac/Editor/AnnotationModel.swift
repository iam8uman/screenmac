import AppKit
import CoreGraphics

/// All annotation geometry is stored in **image pixels** with a top-left origin.
/// Zoom, crop, and window size never change stored coordinates.

enum Tool: String, CaseIterable, Identifiable, Sendable {
    case select, crop, arrow, line, rectangle, filledRectangle, ellipse, text, counter, highlighter, pencil, blur, pixelate, redact

    var id: String { rawValue }

    var label: String {
        switch self {
        case .select: return "Select"
        case .crop: return "Crop"
        case .arrow: return "Arrow"
        case .line: return "Line"
        case .rectangle: return "Rectangle"
        case .filledRectangle: return "Filled Rectangle"
        case .ellipse: return "Ellipse"
        case .text: return "Text"
        case .counter: return "Counter"
        case .highlighter: return "Highlighter"
        case .pencil: return "Pencil"
        case .blur: return "Blur"
        case .pixelate: return "Pixelate"
        case .redact: return "Redact"
        }
    }

    /// Single-key shortcut, matching the web editor.
    var key: Character {
        switch self {
        case .select: return "v"
        case .crop: return "c"
        case .arrow: return "a"
        case .line: return "l"
        case .rectangle: return "r"
        case .filledRectangle: return "f"
        case .ellipse: return "o"
        case .text: return "t"
        case .counter: return "n"
        case .highlighter: return "h"
        case .pencil: return "p"
        case .blur: return "b"
        case .pixelate: return "x"
        case .redact: return "d"
        }
    }

    var symbol: String {
        switch self {
        case .select: return "cursorarrow"
        case .crop: return "crop"
        case .arrow: return "arrow.up.right"
        case .line: return "line.diagonal"
        case .rectangle: return "rectangle"
        case .filledRectangle: return "rectangle.fill"
        case .ellipse: return "circle"
        case .text: return "textformat"
        case .counter: return "1.circle"
        case .highlighter: return "highlighter"
        case .pencil: return "pencil.tip"
        case .blur: return "drop"
        case .pixelate: return "square.grid.3x3"
        case .redact: return "rectangle.inset.filled"
        }
    }

    static func forKey(_ character: Character) -> Tool? {
        let lower = Character(character.lowercased())
        return allCases.first { $0.key == lower }
    }

    /// Tools whose output uses the color and size controls.
    var isStyled: Bool {
        switch self {
        case .arrow, .line, .rectangle, .filledRectangle, .ellipse, .text, .counter, .highlighter, .pencil: return true
        default: return false
        }
    }

    static let groups: [[Tool]] = [
        [.select, .crop],
        [.arrow, .line, .rectangle, .filledRectangle, .ellipse],
        [.text, .counter, .highlighter, .pencil],
        [.blur, .pixelate, .redact],
    ]
}

struct RGBA: Equatable, Hashable, Sendable {
    var red: CGFloat
    var green: CGFloat
    var blue: CGFloat
    var alpha: CGFloat = 1

    init(red: CGFloat, green: CGFloat, blue: CGFloat, alpha: CGFloat = 1) {
        self.red = red
        self.green = green
        self.blue = blue
        self.alpha = alpha
    }

    init(hex: UInt32) {
        red = CGFloat((hex >> 16) & 0xFF) / 255
        green = CGFloat((hex >> 8) & 0xFF) / 255
        blue = CGFloat(hex & 0xFF) / 255
        alpha = 1
    }

    var nsColor: NSColor { NSColor(srgbRed: red, green: green, blue: blue, alpha: alpha) }

    /// Black or white, whichever reads better on this color.
    var contrastingInk: RGBA {
        let luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
        return luminance > 0.6 ? RGBA(hex: 0x15141A) : RGBA(hex: 0xFFFFFF)
    }

    static let palette: [(name: String, color: RGBA)] = [
        ("Signal Red", RGBA(hex: 0xF0443A)),
        ("Amber", RGBA(hex: 0xFFB020)),
        ("Mint", RGBA(hex: 0x19C08A)),
        ("Iris", RGBA(hex: 0x5B4CF5)),
        ("Sky", RGBA(hex: 0x2E9BFF)),
        ("Ink", RGBA(hex: 0x15141A)),
        ("Paper", RGBA(hex: 0xFFFFFF)),
    ]

    static let redactFill = RGBA(hex: 0x0E0E12)
}

/// Fine / Medium / Bold, scaled to the image so marks look the same on 1× and Retina captures.
enum StrokeSize: Int, CaseIterable, Identifiable, Sendable {
    case fine = 4, medium = 7, bold = 11

    var id: Int { rawValue }
    var label: String { self == .fine ? "Fine" : self == .medium ? "Medium" : "Bold" }
    var fontSize: CGFloat { self == .fine ? 26 : self == .medium ? 34 : 46 }
    var counterRadius: CGFloat { self == .fine ? 15 : self == .medium ? 19 : 25 }
}

struct Stroke: Equatable, Sendable {
    var color: RGBA
    var width: CGFloat
}

struct Annotation: Identifiable, Equatable, Sendable {
    enum Shape: Equatable, Sendable {
        case arrow(start: CGPoint, end: CGPoint, stroke: Stroke)
        case line(start: CGPoint, end: CGPoint, stroke: Stroke)
        case rectangle(rect: CGRect, stroke: Stroke, filled: Bool)
        case ellipse(rect: CGRect, stroke: Stroke)
        case pencil(points: [CGPoint], stroke: Stroke)
        case highlighter(points: [CGPoint], stroke: Stroke)
        case text(origin: CGPoint, string: String, color: RGBA, fontSize: CGFloat, label: Bool)
        case counter(center: CGPoint, value: Int, color: RGBA, radius: CGFloat)
        case blur(rect: CGRect, radius: CGFloat)
        case pixelate(rect: CGRect, block: CGFloat)
        case redact(rect: CGRect)
    }

    let id: UUID
    var shape: Shape

    init(id: UUID = UUID(), _ shape: Shape) {
        self.id = id
        self.shape = shape
    }

    var isEffect: Bool {
        switch shape {
        case .blur, .pixelate, .redact: return true
        default: return false
        }
    }

    var isText: Bool {
        if case .text = shape { return true }
        return false
    }

    var color: RGBA? {
        switch shape {
        case .arrow(_, _, let s), .line(_, _, let s), .rectangle(_, let s, _), .ellipse(_, let s), .pencil(_, let s), .highlighter(_, let s):
            return s.color
        case .text(_, _, let c, _, _), .counter(_, _, let c, _):
            return c
        default:
            return nil
        }
    }
}

/// Everything undo/redo restores and export renders. The source image is not part of it.
struct EditorDocument: Equatable, Sendable {
    var annotations: [Annotation] = []
    /// Crop in image pixels, or nil for the whole image.
    var crop: CGRect?

    func annotation(_ id: UUID) -> Annotation? { annotations.first { $0.id == id } }

    mutating func replace(_ annotation: Annotation) {
        if let index = annotations.firstIndex(where: { $0.id == annotation.id }) {
            annotations[index] = annotation
        }
    }

    var nextCounterValue: Int {
        annotations.reduce(0) { result, a in
            if case .counter(_, let v, _, _) = a.shape { return max(result, v) }
            return result
        } + 1
    }
}
