Add-Type -AssemblyName System.Drawing

$src = "C:\Users\91998\Downloads\ChatGPT Image Aug 11, 2026, 06_35_54 AM.png"
$dst = "C:\Users\91998\CascadeProjects\pseo-plumbing-site-main\public\images\plumber-service-hero.jpg"

$img = [System.Drawing.Image]::FromFile($src)

# Full-height crop of the right-side photographic scene, excluding text panel
$cropX = 730
$cropY = 0
$cropW = $img.Width - $cropX
$cropH = $img.Height

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $img.Clone($cropRect, $img.PixelFormat)

# Resize to 720px wide for the right half of a split hero
$targetW = 720
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
# Quality 80 for faster LCP while retaining good appearance
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80L)
$bmp.Save($dst, $jpegCodec, $encoderParams)

$gfx.Dispose()
$bmp.Dispose()
$cropped.Dispose()
$img.Dispose()

$outSize = (Get-Item $dst).Length
Write-Output "Hero crop: ${targetW}x${targetH}, $([math]::Round($outSize/1024, 1))KB"
