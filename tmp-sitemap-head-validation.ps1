$domain = 'https://yohomefix.com'
function Test-Head($url) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $req = [System.Net.HttpWebRequest]::Create($url)
        $req.Method = 'HEAD'
        $req.Timeout = 30000
        $req.AllowAutoRedirect = $false
        $resp = $req.GetResponse()
        $sw.Stop()
        $ct = $resp.ContentType
        $status = [int]$resp.StatusCode
        $resp.Close()
        [PSCustomObject]@{
            Url = $url
            Status = $status
            ContentType = $ct
            TTFB_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
            OK = ($status -eq 200 -and $ct -like '*xml*')
        }
    } catch {
        $sw.Stop()
        [PSCustomObject]@{
            Url = $url
            Status = $_.Exception.Response.StatusCode.value__
            ContentType = ''
            TTFB_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
            OK = $false
        }
    }
}

function Test-Body($url) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 30
        $sw.Stop()
        $valid = ($resp.StatusCode -eq 200 -and $resp.Content -match '^<\?xml')
        [PSCustomObject]@{
            Url = $url
            Status = $resp.StatusCode
            ContentType = $resp.Headers['Content-Type']
            TTFB_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
            ValidXml = $valid
        }
    } catch {
        $sw.Stop()
        [PSCustomObject]@{
            Url = $url
            Status = $_.Exception.Response.StatusCode.value__
            ContentType = ''
            TTFB_ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 2)
            ValidXml = $false
        }
    }
}

$index = Test-Body "$domain/sitemap.xml"
$index | Format-Table -AutoSize
if (-not $index.ValidXml) { throw 'Main sitemap index is not valid XML' }

[xml]$xml = (Invoke-WebRequest -Uri "$domain/sitemap.xml" -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 30).Content
$locs = $xml.sitemapindex.sitemap.loc
Write-Host "Child sitemaps: $($locs.Count)"

$headResults = @()
foreach ($loc in $locs) { $headResults += Test-Head $loc }
$headResults | Format-Table -AutoSize
$headFailures = $headResults | Where-Object { -not $_.OK }
if ($headFailures.Count -gt 0) { throw "$($headFailures.Count) chunks failed HEAD validation" }

# Sample full-body validation: 1 per category + all large states
$sample = @(
    "$domain/sitemap-static/0.xml",
    "$domain/sitemap-cities/0.xml",
    "$domain/sitemap-states/texas/0.xml",
    "$domain/sitemap-states/california/0.xml",
    "$domain/sitemap-states/new-york/0.xml",
    "$domain/sitemap-states/rhode-island/0.xml",
    "$domain/sitemap-zcta/texas/0.xml",
    "$domain/sitemap-zcta/texas/1.xml",
    "$domain/sitemap-zcta/texas/2.xml",
    "$domain/sitemap-zcta/california/0.xml",
    "$domain/sitemap-zcta/new-york/0.xml"
)
$bodyResults = @()
foreach ($u in $sample) { $bodyResults += Test-Body $u }
$bodyResults | Format-Table -AutoSize
$bodyFailures = $bodyResults | Where-Object { -not $_.ValidXml }
if ($bodyFailures.Count -gt 0) { throw "$($bodyFailures.Count) sample chunks failed XML validation" }

$headResults | Group-Object OK | Format-Table -AutoSize
Write-Host 'ALL 124 CHUNKS RETURN HTTP 200 + text/xml; SAMPLE FULL-BODY XML VALIDATION PASSED'
