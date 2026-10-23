import XCTest
@testable import Screenmac

/// Redaction must be flattened into exported pixels, not layered on top.
@MainActor
final class RendererTests: XCTestCase {
    private func solidImage(width: Int = 200, height: Int = 100, red: UInt8 = 255, green: UInt8 = 0, blue: UInt8 = 0) -> CGImage {
        let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
                            space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        ctx.setFillColor(red: CGFloat(red) / 255, green: CGFloat(green) / 255, blue: CGFloat(blue) / 255, alpha: 1)
        ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))
        // A white stripe so blur has detail to destroy.
        ctx.setFillColor(red: 1, green: 1, blue: 1, alpha: 1)
        ctx.fill(CGRect(x: 0, y: height / 2, width: width, height: 2))
        return ctx.makeImage()!
    }

    /// RGBA of one pixel, with (x, y) measured from the top-left.
    private func pixel(_ image: CGImage, _ x: Int, _ y: Int) -> [UInt8] {
        var data = [UInt8](repeating: 0, count: 4)
        let ctx = CGContext(data: &data, width: 1, height: 1, bitsPerComponent: 8, bytesPerRow: 4,
                            space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        ctx.draw(image, in: CGRect(x: -x, y: -(image.height - 1 - y), width: image.width, height: image.height))
        return data
    }

    func testFlattenWithoutMarksKeepsSize() throws {
        let base = solidImage()
        let out = try XCTUnwrap(Renderer.flatten(EditorDocument(), base: base, effects: EffectCache(base: base)))
        XCTAssertEqual(out.width, 200)
        XCTAssertEqual(out.height, 100)
        XCTAssertEqual(Array(pixel(out, 10, 10).prefix(3)), [255, 0, 0])
    }

    func testRedactionReplacesPixels() throws {
        let base = solidImage()
        var doc = EditorDocument()
        doc.annotations.append(Annotation(.redact(rect: CGRect(x: 20, y: 10, width: 60, height: 40))))
        let out = try XCTUnwrap(Renderer.flatten(doc, base: base, effects: EffectCache(base: base)))
        XCTAssertEqual(pixel(out, 50, 30), [0x0E, 0x0E, 0x12, 255], "inside the redaction must be solid fill")
        XCTAssertEqual(Array(pixel(out, 150, 10).prefix(3)), [255, 0, 0], "outside is untouched")
    }

    func testRedactionSurvivesEncodingRoundTrip() throws {
        let base = solidImage()
        var doc = EditorDocument()
        doc.annotations.append(Annotation(.redact(rect: CGRect(x: 0, y: 0, width: 200, height: 100))))
        let out = try XCTUnwrap(Renderer.flatten(doc, base: base, effects: EffectCache(base: base)))
        let data = try ImageEncoding.data(for: out, format: .png)
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("\(UUID().uuidString).png")
        try data.write(to: url)
        defer { try? FileManager.default.removeItem(at: url) }
        let decoded = try ImageEncoding.load(url)
        for (x, y) in [(5, 5), (100, 51), (199, 99)] {
            XCTAssertEqual(Array(pixel(decoded, x, y).prefix(3)), [0x0E, 0x0E, 0x12], "no original pixels at \(x),\(y)")
        }
    }

    func testBlurChangesPixelsInsideOnly() throws {
        let base = solidImage()
        var doc = EditorDocument()
        doc.annotations.append(Annotation(.blur(rect: CGRect(x: 40, y: 30, width: 80, height: 40), radius: 12)))
        let out = try XCTUnwrap(Renderer.flatten(doc, base: base, effects: EffectCache(base: base)))
        // The white stripe (rows 48–49) is smeared inside the blurred region…
        let inside = pixel(out, 80, 49)
        XCTAssertLessThan(Int(inside[1]), 200, "stripe should be blurred into the red")
        // …and stays crisp outside it.
        XCTAssertEqual(Array(pixel(out, 10, 49).prefix(3)), [255, 255, 255])
    }

    func testCropChangesOutputSize() throws {
        let base = solidImage()
        var doc = EditorDocument()
        doc.crop = CGRect(x: 10, y: 10, width: 50, height: 30)
        let out = try XCTUnwrap(Renderer.flatten(doc, base: base, effects: EffectCache(base: base)))
        XCTAssertEqual(out.width, 50)
        XCTAssertEqual(out.height, 30)
    }
}
