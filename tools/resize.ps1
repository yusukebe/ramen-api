# Windows counterpart of resize.sh, using the built-in System.Drawing instead of sips and jpegtran.
$ErrorActionPreference = 'Stop'

$cmdName = Split-Path -Leaf $PSCommandPath
if ($args.Count -ne 2) {
  [Console]::Error.WriteLine("Usage: $cmdName IMG_123.JPG yoshimuraya-001.jpg")
  exit 1
}

$orgPath = $args[0]
$newPath = $args[1]

Write-Output "Move: $orgPath to $newPath"
Move-Item -LiteralPath $orgPath -Destination $newPath -Force

Write-Output "Resize and Optimize: $newPath"
Add-Type -AssemblyName System.Drawing
$fullPath = (Resolve-Path -LiteralPath $newPath).Path

# Image.FromFile keeps the file locked, so read it into memory to be able to overwrite it in place.
$stream = [System.IO.MemoryStream]::new([System.IO.File]::ReadAllBytes($fullPath))
$image = [System.Drawing.Image]::FromStream($stream)

# The EXIF metadata is dropped below, so bake its orientation (tag 0x0112) into the pixels.
$orientationTag = 0x0112
if ($image.PropertyIdList -contains $orientationTag) {
  # EXIF orientation value -> System.Drawing.RotateFlipType
  $rotateFlipTypes = @{
    2 = [System.Drawing.RotateFlipType]::RotateNoneFlipX
    3 = [System.Drawing.RotateFlipType]::Rotate180FlipNone
    4 = [System.Drawing.RotateFlipType]::Rotate180FlipX
    5 = [System.Drawing.RotateFlipType]::Rotate90FlipX
    6 = [System.Drawing.RotateFlipType]::Rotate90FlipNone
    7 = [System.Drawing.RotateFlipType]::Rotate270FlipX
    8 = [System.Drawing.RotateFlipType]::Rotate270FlipNone
  }
  $orientation = [int]$image.GetPropertyItem($orientationTag).Value[0]
  if ($rotateFlipTypes.ContainsKey($orientation)) {
    $image.RotateFlip($rotateFlipTypes[$orientation])
  }
}

# Fit the longest side to 800px, like resize.swift. Smaller images are not upscaled.
$scale = [Math]::Min(1.0, 800 / [Math]::Max($image.Width, $image.Height))
$width = [int][Math]::Round($image.Width * $scale)
$height = [int][Math]::Round($image.Height * $scale)

# Drawing onto a new bitmap strips all metadata, like jpegtran -copy none.
# The white fill keeps transparent areas of a PNG from turning black in the JPEG.
$bitmap = [System.Drawing.Bitmap]::new($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::White)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.DrawImage($image, 0, 0, $width, $height)
$graphics.Dispose()
$image.Dispose()
$stream.Dispose()

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encoderParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]85)
$bitmap.Save($fullPath, $jpegEncoder, $encoderParams)
$bitmap.Dispose()

# Same format as sips -g pixelHeight -g pixelWidth.
Write-Output $fullPath
Write-Output "  pixelHeight: $height"
Write-Output "  pixelWidth: $width"
