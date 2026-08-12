Add-Type -AssemblyName System.Drawing

$src = "C:\Users\91998\Downloads\ChatGPT Image Aug 11, 2026, 06_35_54 AM.png"
$dst = "C:\Users\91998\CascadeProjects\pseo-plumbing-site-main\public\images\plumber-service-hero-tight.jpg"

$img = [System.Drawing.Image]::FromFile($src)

# Tighter crop: remove left background floor/wall, trim top/bottom empty space
# Keep plumber + homeowner clearly visible
$cropX = 760
$cropY = 60
$cropW = 700
$cropH = 900

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $img.Clone($cropRect, $img.PixelFormat)

# Resize to 640px wide for the 30-35% hero column
$targetW = 640
$ratio = $targetW / $cropped.Width
$targetH = [int]($cropped.Height * $ratio)

$bmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gfx.DrawImage($cropped, 0, 0, $targetW, $targetH)

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80L)
$bmp.Save($dst, $jpegCodec, $encoderParams)

$gfx.Dispose()
$bmp.Dispose()
$cropped.Dispose()
$img.Dispose()

$outSize = (Get-Item $dst).Length
Write-Output "Tight crop: ${cropW}x${cropH} -> ${targetW}x${targetH}, $([math]::Round($outSize/1024, 1))KB"
