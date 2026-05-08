$html = Get-Content -Path index.html -Raw

$headMatch = [regex]::Match($html, '(?s)<head>.*?</head>')
$head = if ($headMatch.Success) { $headMatch.Value } else { "" }

$headerMatch = [regex]::Match($html, '(?s)<header class="glass-header" id="main-header">.*?</header>')
$header = if ($headerMatch.Success) { $headerMatch.Value } else { "" }

$navMatch = [regex]::Match($html, '(?s)<nav class="bottom-nav">.*?</nav>')
$nav = if ($navMatch.Success) { $navMatch.Value } else { "" }

# Replace nav links
$nav = $nav.Replace('href="#home"', 'href="index.html"')
$nav = $nav.Replace('href="#videos"', 'href="videos.html"')
$nav = $nav.Replace('href="javascript:void(0)" class="nav-item" id="nav-news-btn"', 'href="news.html" class="nav-item" id="nav-news-btn"')
$nav = $nav.Replace('id="search-btn"', 'id="search-btn" onclick="window.location.href=''search.html''"')

# Make sure buttons that navigate highlight active class correctly via JS later.


function Get-Section($secId) {
    $pattern = '(?s)<section id="' + $secId + '".*?</section>'
    $match = [regex]::Match($html, $pattern)
    if ($match.Success) { return $match.Value } else { return "" }
}

$homeSec = Get-Section 'home'
$linksSec = Get-Section 'links'
$videosSec = Get-Section 'videos'
$newsSec = Get-Section 'news'
$supportSec = Get-Section 'support'

function New-Page($title, $bodyContent, $scripts) {
    $newHead = $head.Replace('<title>Smartify Tech - Be Smart By Tech</title>', "<title>$title | Smartify Tech</title>")
    return @"
<!DOCTYPE html>
<html lang="en">
$newHead
<body>
    $header
    $nav
    <main style="padding-bottom: 100px;">
        $bodyContent
    </main>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js"></script>
    <script src="js/nav.js"></script>
    $scripts
</body>
</html>
"@
}

New-Item -ItemType Directory -Force -Path js | Out-Null

$indexBody = "$homeSec`n$linksSec`n$supportSec"
$indexHtml = New-Page "Home" $indexBody '<script src="js/youtube.js"></script>'
Set-Content -Path index.html -Value $indexHtml -Encoding UTF8

$videosHtml = New-Page "Videos" $videosSec '<script src="js/youtube.js"></script>'
Set-Content -Path videos.html -Value $videosHtml -Encoding UTF8

$newsHtml = New-Page "News" $newsSec '<script src="js/news.js"></script>'
Set-Content -Path news.html -Value $newsHtml -Encoding UTF8

$searchBody = @"
<section class="section">
    <h2 class="section-title">Search</h2>
    <div class="glass-card" style="padding: 2rem; text-align: center;">
        <input type="text" id="main-search-input" placeholder="Search videos, news, articles..." style="width: 100%; max-width: 600px; padding: 1rem; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: white; font-size: 1.2rem; outline: none; text-align: center; backdrop-filter: blur(10px);">
        <div id="search-results" style="margin-top: 2rem; display: grid; gap: 1.5rem; text-align: left;"></div>
    </div>
</section>
"@
$searchHtml = New-Page "Search" $searchBody '<script src="js/search.js"></script>'
Set-Content -Path search.html -Value $searchHtml -Encoding UTF8





Write-Output "HTML pages generated successfully."
