import AppKit
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

enum ImageEncodingError: LocalizedError {
    case encodeFailed
    case decodeFailed(URL)

    var errorDescription: String? {
        switch self {
        case .encodeFailed: return "The image couldn't be encoded."
        case .decodeFailed(let url): return "\(url.lastPathComponent) couldn't be opened as an image."
        }
    }
}

enum ImageEncoding {
    static func data(for image: CGImage, format: ImageFormat, jpegQuality: Double = 0.9) throws -> Data {
        let data = NSMutableData()
        let type = (format == .png ? UTType.png : UTType.jpeg).identifier as CFString
        guard let destination = CGImageDestinationCreateWithData(data, type, 1, nil) else {
            throw ImageEncodingError.encodeFailed
        }
        var options: [CFString: Any] = [:]
        if format == .jpeg { options[kCGImageDestinationLossyCompressionQuality] = jpegQuality }
        CGImageDestinationAddImage(destination, image, options as CFDictionary)
        guard CGImageDestinationFinalize(destination) else { throw ImageEncodingError.encodeFailed }
        return data as Data
    }

    static func write(_ image: CGImage, to url: URL, format: ImageFormat) throws {
        try data(for: image, format: format).write(to: url, options: .atomic)
    }

    static func load(_ url: URL) throws -> CGImage {
        guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
              let image = CGImageSourceCreateImageAtIndex(source, 0, [kCGImageSourceShouldCache: true] as CFDictionary)
        else { throw ImageEncodingError.decodeFailed(url) }
        return image
    }

    /// Downscaled copy whose longest edge is at most `maxEdge` pixels.
    static func thumbnail(of image: CGImage, maxEdge: CGFloat = 480) -> CGImage? {
        let scale = min(1, maxEdge / CGFloat(max(image.width, image.height)))
        let width = max(1, Int(CGFloat(image.width) * scale))
        let height = max(1, Int(CGFloat(image.height) * scale))
        guard let ctx = CGContext(
            data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
            space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { return nil }
        ctx.interpolationQuality = .high
        ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
        return ctx.makeImage()
    }

    /// Crop `image` to `rect` (image pixels, top-left origin).
    static func crop(_ image: CGImage, to rect: CGRect) -> CGImage? {
        let bounds = CGRect(x: 0, y: 0, width: image.width, height: image.height)
        let r = rect.integral.intersection(bounds)
        guard !r.isNull, r.width >= 1, r.height >= 1 else { return nil }
        return image.cropping(to: r)
    }
}

enum Pasteboard {
    /// Put a flattened image on the general pasteboard as PNG (and TIFF for older apps).
    @discardableResult
    static func copy(_ image: CGImage) -> Bool {
        guard let png = try? ImageEncoding.data(for: image, format: .png) else { return false }
        let pb = NSPasteboard.general
        pb.clearContents()
        let item = NSPasteboardItem()
        item.setData(png, forType: .png)
        if let tiff = NSBitmapImageRep(cgImage: image).tiffRepresentation {
            item.setData(tiff, forType: .tiff)
        }
        return pb.writeObjects([item])
    }

    @discardableResult
    static func copyFile(_ url: URL) -> Bool {
        let pb = NSPasteboard.general
        pb.clearContents()
        return pb.writeObjects([url as NSURL])
    }
}
