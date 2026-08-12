Add-Type -AssemblyName System.Drawing

$src = "C:\Users\91998\Downloads\ChatGPT Image Aug 11, 2026, 06_35_54 AM.png"
$dst = "C:\Users\91998\CascadeProjects\pseo-plumbing-site-main\public\images\plumber-service.jpg"

# Load original
$img = [System.Drawing.Image]::FromFile($src)

# Target width 800px, maintain aspect ratio
$targetW = 800
$ratio = $targetW / $img.Width
$targetH = [int]($img.Height * $ratio)

# Create resized bitmap
$bmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$gfx.DrawImage($img, 0, 0, $targetW, $targetH)

# Save as JPEG with quality 85
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85L)
$bmp.Save($dst, $jpegCodec, $encoderParams)

$gfx.Dispose()
$bmp.Dispose()
$img.Dispose()

$outSize = (Get-Item $dst).Length
Write-Output "Optimized: ${targetW}x${targetH}, $([math]::Round($outSize/1024, 1))KB"
