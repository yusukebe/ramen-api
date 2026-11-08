import Foundation
import ImageIO

let args = CommandLine.arguments
guard args.count == 3 else {
  FileHandle.standardError.write("Usage: swift resize.swift input.jpg output.jpg\n".data(using: .utf8)!)
  exit(1)
}

let options = [
  kCGImageSourceCreateThumbnailFromImageAlways: true,
  kCGImageSourceCreateThumbnailWithTransform: true,
  kCGImageSourceThumbnailMaxPixelSize: 800,
] as CFDictionary

guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: args[1]) as CFURL, nil),
  let image = CGImageSourceCreateThumbnailAtIndex(source, 0, options),
  let destination = CGImageDestinationCreateWithURL(
    URL(fileURLWithPath: args[2]) as CFURL, "public.jpeg" as CFString, 1, nil)
else {
  FileHandle.standardError.write("Failed to resize \(args[1])\n".data(using: .utf8)!)
  exit(1)
}

CGImageDestinationAddImage(destination, image, nil)
guard CGImageDestinationFinalize(destination) else {
  FileHandle.standardError.write("Failed to write \(args[2])\n".data(using: .utf8)!)
  exit(1)
}
