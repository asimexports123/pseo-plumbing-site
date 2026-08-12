Add-Type -AssemblyName System.Drawing

$src = "C:\Users\91998\Downloads\ChatGPT Image Aug 11, 2026, 06_35_54 AM.png"
$dst = "C:\Users\91998\CascadeProjects\pseo-plumbing-site-main\public\images\plumber-service.jpg"

# Load original (1536x1024)
$img = [System.Drawing.Image]::FromFile($src)
Write-Output "Original: $($img.Width)x$($img.Height)"

# The left text panel occupies roughly the left 44% of the image.
# Crop from x=680 to x=1536 to get the pure photographic scene.
$cropX = 680
$cropY = 0
$cropW = $img.Width - $cropX   # 856
$cropH = $img.Height            # 1024

# Create cropped bitmap
$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $img.Clone($cropRect, $img.PixelFormat)

# Now resize to 800px wide, maintaining aspect ratio
$targetW = 800
$ratio = $targetW / $cropped.Width
$targetH = [int]($cropped.Height * $ratio)

$bmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gfx.DrawImage($cropped, 0, 0, $targetW, $targetH)

# Save as JPEG quality 85
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)
$bmp.Save($dst, $jpegCodec, $encoderParams)

$gfx.Dispose()
$bmp.Dispose()
$cropped.Dispose()
$img.Dispose()

$outSize = (Get-Item $dst).Length
Write-Output "Cropped: ${cropW}x${cropH} -> ${targetW}x${targetH}, $([math]::Round($outSize/1024, 1))KB"
