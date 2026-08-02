$domain = 'https://yohomefix.com'
function Test-Sitemap($url) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 60
        $sw.Stop()
        $valid = $false
        if ($resp.StatusCode -eq 200 -and $resp.Content -match '^<\?xml') { $valid = $true }
        [PSCustomObject]@{
            Url = $url
            Status = $resp.StatusCode
            ContentType = $resp.Headers['Content-Type']
            Cache = $resp.Headers['X-Vercel-Cache']
            TTFB_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
            ValidXml = $valid
            Error = ''
        }
    } catch {
        $sw.Stop()
        [PSCustomObject]@{
            Url = $url
            Status = $_.Exception.Response.StatusCode.value__
            ContentType = ''
            Cache = ''
            TTFB_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
            ValidXml = $false
            Error = $_.Exception.Message
        }
    }
}

$index = Test-Sitemap "$domain/sitemap.xml"
$index | Format-Table -AutoSize
if ($index.Status -ne 200 -or -not $index.ValidXml) { throw 'Main index failed' }

[xml]$xml = (Invoke-WebRequest -Uri "$domain/sitemap.xml" -UseBasicParsing -MaximumRedirection 0).Content
$locs = $xml.sitemapindex.sitemap.loc
Write-Host "Child sitemaps in index: $($locs.Count)"

$failures = @()
$ok = @()
foreach ($loc in $locs) {
    $r = Test-Sitemap $loc
    if ($r.Status -eq 200 -and $r.ValidXml -and $r.ContentType -like '*xml*') { $ok += $r } else { $failures += $r }
}
Write-Host "OK: $($ok.Count), Failures: $($failures.Count)"
if ($failures.Count -gt 0) { $failures | Format-Table -AutoSize; throw 'Some sitemaps failed' }

$ok | Group-Object Cache | Select-Object Name, Count | Format-Table -AutoSize
$ok | Sort-Object TTFB_ms -Descending | Select-Object -First 10 | Format-Table -AutoSize
Write-Host 'ALL SITEMAP CHUNKS VALIDATED'
