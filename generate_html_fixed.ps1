function New-STPage($title, $bodyContent, $scripts) {
    $header = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title | Smartify Tech</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Outfit:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="icon" type="image/png" href="cover.png">
    <link rel="stylesheet" href="style.css">
    <script src="js/search.js"></script>
    <script src="js/weather.js"></script>
</head>
<body>
    <!-- Floating Header -->
    <header class="glass-header" id="main-header">
        <div id="weather-effect-layer" class="weather-overlay"></div>
        <div id="celestial-body" class="celestial-body"></div>
        
        <a href="index.html" class="header-left glass-pill" style="display: flex; align-items: center; gap: 0.5rem; padding-top: 0.4rem; padding-bottom: 0.4rem; text-decoration: none;">
            <img src="cover.png" alt="Smartify Tech Logo" class="header-logo">
            <div style="display: flex; flex-direction: column; justify-content: center;">
                <span class="header-title" style="line-height: 1.1;">Smartify Tech</span>
                <span style="font-size: 0.65rem; color: var(--text-secondary); letter-spacing: 1.5px; font-weight: 600; margin-top: 2px;">BE SMART | BY TECH</span>
            </div>
        </a>

        <!-- Minimalist Clock/Weather Pill -->
        <div class="header-center glass-pill" style="display: flex; align-items: center; gap: 0.8rem; padding: 0.4rem 1rem; font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.85rem;">
            <span id="header-clock">--:--</span>
            <span style="opacity: 0.3;">|</span>
            <span id="weather-info-text">--°C</span>
        </div>

        <div class="header-right glass-pill" id="header-right-actions">
            <button id="theme-toggle" class="glass-btn theme-toggle-btn" title="Toggle Light/Dark Mode">
                <div class="half-moon-icon"></div>
            </button>

        </div>
    </header>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
        <div class="bottom-nav-container glass-card">
            <a href="index.html" class="nav-item">
                <i class="fa-solid fa-house"></i>
                <span>Home</span>
            </a>
            <a href="videos.html" class="nav-item">
                <i class="fa-solid fa-video"></i>
                <span>Videos</span>
            </a>
            <a href="news.html" class="nav-item" id="nav-news-btn">
                <i class="fa-solid fa-newspaper"></i>
                <span>News</span>
            </a>
            
            <div class="nav-divider"></div>

            <button class="nav-item search-btn" id="search-btn">
                <i class="fa-solid fa-magnifying-glass"></i>
                <span>Search</span>
            </button>

            <button class="nav-item" id="bottom-menu-btn">
                <i class="fa-solid fa-bars"></i>
                <span>Menu</span>
            </button>

            <!-- Inline Search Input Wrapper -->
            <div class="nav-search-wrapper" id="nav-search-wrapper">
                <i class="fa-solid fa-magnifying-glass search-icon"></i>
                <input type="text" id="nav-search-input" placeholder="Search videos, news...">
                <button class="close-search-btn" id="close-search-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>

        </div>
    </nav>

    <!-- Secondary Navigation Popup Menu (Moved outside for clean stacking) -->
    <div class="side-drawer-overlay" id="side-drawer-overlay"></div>
    <div class="side-drawer glass-card" id="side-drawer">
        <div class="drawer-header">
            <h3 style="font-size: 1.2rem; font-weight: 700;">Menu</h3>
            <button class="glass-btn close-drawer" id="close-drawer-btn" style="width: 32px; height: 32px;"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="drawer-links">
            <a href="index.html#admin-posts" class="drawer-item"><i class="fa-solid fa-bullhorn"></i> <span>Admin Updates</span></a>
            <a href="index.html#links" class="drawer-item"><i class="fa-solid fa-link"></i> <span>Connect</span></a>
            <a href="index.html#support" class="drawer-item"><i class="fa-solid fa-hand-holding-dollar"></i> <span>Support My Work</span></a>
        </div>
    </div>
    <main style="padding-bottom: 100px;">
        $bodyContent
    </main>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js"></script>
    <script src="js/nav.js"></script>
    $scripts
</body>
</html>
"@
    $footer = @"
    <footer class="reveal" style="padding: 1rem 0 120px; margin-top: 0; border-top: 1px solid var(--glass-border); text-align: center;">
        <div style="width: var(--container-width); margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <div style="font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: 800; opacity: 0.8;">SMARTIFY TECH</div>
            <div style="display: flex; gap: 2rem; font-size: 0.9rem; color: var(--text-secondary); justify-content: center;">
                <a href="index.html" style="color: inherit; text-decoration: none;">Home</a>
                <a href="videos.html" style="color: inherit; text-decoration: none;">Videos</a>
                <a href="news.html" style="color: inherit; text-decoration: none;">News</a>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted);">&copy; 2026 Smartify Tech. All rights reserved. <br> <span style="font-size: 0.7rem; opacity: 0.5;">v2.1.0 Polish Pass</span></p>
        </div>
    </footer>
"@
    
    $fullHtml = $header.Replace('$bodyContent', $bodyContent)
    $fullHtml = $fullHtml.Replace("</main>", "</main>`n$footer")
    $fullHtml = $fullHtml.Replace('$scripts', $scripts)
    return $fullHtml
}

$homeSec = @"
        <section id="home" class="section hero-section reveal">
            <div class="glass-card hero-content tilt-element">
                <div class="hero-cover-bg" style="background-image: url('cover.png');"></div>
                <div class="hero-bg-text">SMARTIFY</div>
                <div class="hero-overlay"></div>
                <div class="hero-bottom-content">
                    <div class="hero-info-row">
                        <div class="hero-left">
                            <h1 class="main-title">Smartify Tech</h1>
                            <p class="tagline">Be Smart By Tech</p>
                        </div>
                        <div class="hero-right">
                            <div class="mini-stat-card">
                                <i class="fa-solid fa-users"></i>
                                <div class="stat-text-col">
                                    <span class="stat-number" id="sub-count">...</span>
                                    <span class="stat-label">Subs</span>
                                </div>
                            </div>
                            <div class="mini-stat-card">
                                <i class="fa-solid fa-video"></i>
                                <div class="stat-text-col">
                                    <span class="stat-number" id="video-count">...</span>
                                    <span class="stat-label">Videos</span>
                                </div>
                            </div>
                            <div class="mini-stat-card">
                                <i class="fa-solid fa-eye"></i>
                                <div class="stat-text-col">
                                    <span class="stat-number" id="view-count">...</span>
                                    <span class="stat-label">Views</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="hero-action-row">
                        <div class="hero-social-icons">
                            <a href="https://www.youtube.com/@Smartify-Tech1" target="_blank" class="glass-icon"><i class="fa-brands fa-youtube"></i></a>
                            <a href="https://www.instagram.com/yadu1c_ransh/" target="_blank" class="glass-icon"><i class="fa-brands fa-instagram"></i></a>
                            <a href="https://x.com/Smartify_TechYT" target="_blank" class="glass-icon"><img src="twitter.png" alt="X" style="width: 20px; height: 20px;"></a>
                            <a href="https://www.reddit.com/user/Decent-Western-5354/" target="_blank" class="glass-icon"><i class="fa-brands fa-reddit"></i></a>
                            <div class="telegram-container">
                                <button class="glass-icon telegram-toggle-btn" onclick="toggleTelegramMenu(event)" title="Telegram Groups">
                                    <i class="fa-brands fa-telegram"></i>
                                </button>
                                <div class="telegram-popup glass-card" id="telegram-popup">
                                    <a href="https://t.me/smartifytech_yt" target="_blank"><i class="fa-brands fa-telegram" style="color: #0088cc;"></i> Telegram Channel</a>
                                    <a href="https://t.me/smartifytech_discuss" target="_blank"><i class="fa-brands fa-telegram" style="color: #0088cc;"></i> Telegram Group</a>
                                </div>
                            </div>
                        </div>
                        <a href="https://www.youtube.com/@Smartify-Tech1?sub_confirmation=1" target="_blank" class="youtube-sub-btn">
                            <i class="fa-brands fa-youtube"></i> Subscribe on YouTube
                        </a>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 4rem;">
                <h3 style="font-family: 'Orbitron', sans-serif; margin-bottom: 2rem; font-size: 1.5rem;">Latest Videos</h3>
                <div class="latest-videos-grid" id="latest-videos-grid">
                    <div class="skeleton" style="height: 200px; width: 100%;"></div>
                    <div class="skeleton" style="height: 200px; width: 100%;"></div>
                    <div class="skeleton" style="height: 200px; width: 100%;"></div>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <a href="videos.html" class="cute-minimal-btn" style="text-decoration: none;">
                        <i class="fa-solid fa-play"></i> Show More Videos
                    </a>
                </div>
            </div>
        </section>
"@

$newsPreviewSec = @"
        <section id="news-preview" class="section news-preview-section reveal">
            <h2 class="section-title">Latest Tech News</h2>
            <div class="news-horizontal-scroll" id="news-preview-container">
                <div class="skeleton" style="width: 300px; height: 180px;"></div>
                <div class="skeleton" style="width: 300px; height: 180px;"></div>
                <div class="skeleton" style="width: 300px; height: 180px;"></div>
            </div>
            <div style="text-align: center; margin-top: 2.5rem;">
                <a href="news.html" class="cute-minimal-btn" style="text-decoration: none;">
                    <i class="fa-solid fa-newspaper"></i> Show More News
                </a>
            </div>
        </section>
"@

$adminPostsSec = @"
        <section id="posts" class="section admin-posts-section reveal">
            <h2 class="section-title">Admin Updates</h2>
            <div class="posts-grid" id="posts-container">
                <div class="skeleton" style="height: 250px; width: 100%;"></div>
                <div class="skeleton" style="height: 250px; width: 100%;"></div>
            </div>
        </section>
"@

$linksSec = @"
        <section id="links" class="section links-section reveal">
            <h2 class="section-title">Connect With Me</h2>
            <div class="links-grid">
                <a href="https://www.youtube.com/@Smartify-Tech1" target="_blank" class="glass-card link-card tilt-element">
                    <i class="fa-brands fa-youtube" style="color: #FF0000;"></i>
                    <span>YouTube</span>
                </a>
                <a href="https://www.instagram.com/yadu1c_ransh/" target="_blank" class="glass-card link-card tilt-element">
                    <i class="fa-brands fa-instagram" style="background: -webkit-linear-gradient(#f09433, #e6683c, #dc2743, #cc2366, #bc1888); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                    <span>Instagram</span>
                </a>
                <a href="https://x.com/Smartify_TechYT" target="_blank" class="glass-card link-card tilt-element">
                    <img src="twitter.png" alt="X" style="width: 50px; height: 50px; margin-bottom: 1rem; transform: translateZ(30px); filter: drop-shadow(0 0 8px rgba(255,255,255,0.3));">
                    <span>X (Twitter)</span>
                </a>
                <a href="https://www.reddit.com/user/Decent-Western-5354/" target="_blank" class="glass-card link-card tilt-element">
                    <i class="fa-brands fa-reddit" style="color: #FF4500;"></i>
                    <span>Reddit</span>
                </a>
                <a href="https://t.me/smartifytech_yt" target="_blank" class="glass-card link-card tilt-element">
                    <i class="fa-brands fa-telegram" style="color: #0088cc;"></i>
                    <span>Telegram Channel</span>
                </a>
                <a href="https://t.me/smartifytech_discuss" target="_blank" class="glass-card link-card tilt-element">
                    <i class="fa-brands fa-telegram" style="color: #0088cc;"></i>
                    <span>Telegram Group</span>
                </a>
            </div>
        </section>
"@

$supportSec = @"
        <section id="support" class="section support-section reveal">
            <h2 class="section-title">Support My Work</h2>
            <div class="glass-card support-card tilt-element">
                <p class="support-text">If you find my content helpful, consider supporting me to keep the channel going!</p>
                <div class="qr-container">
                    <img src="qr_code.png" alt="UPI QR Code" class="qr-image">
                </div>
                <div class="upi-details">
                    <p class="upi-label">UPI ID:</p>
                    <p class="upi-id">cjprince566-3@oksbi</p>
                </div>
                <div style="margin-top: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.6rem;">
                    <p style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8;">Pay with any UPI Apps</p>
                    <div style="display: flex; gap: 1.2rem; align-items: center; justify-content: center; flex-wrap: wrap;">
                        <i class="fa-brands fa-google-pay" style="font-size: 2rem; color: var(--text-primary); line-height: 1;" title="Google Pay"></i>
                        <i class="fa-brands fa-amazon-pay" style="font-size: 2rem; color: var(--text-primary); line-height: 1;" title="Amazon Pay"></i>
                        <i class="fa-brands fa-paypal" style="font-size: 2rem; color: var(--text-primary); line-height: 1;" title="PayPal"></i>
                    </div>
                </div>
            </div>
        </section>
"@

$indexBody = "$homeSec`n$newsPreviewSec`n$adminPostsSec`n$linksSec`n$supportSec"
$indexHtml = New-STPage "Home" $indexBody '<script src="js/youtube.js"></script><script src="js/news.js"></script>'
Set-Content -Path index.html -Value $indexHtml -Encoding UTF8

$videosSec = @"
        <section id="videos" class="section videos-section reveal">
            <h2 class="section-title">Top Videos</h2>
            <div class="videos-grid" id="videos-container">
                <div class="skeleton" style="height: 200px;"></div>
                <div class="skeleton" style="height: 200px;"></div>
                <div class="skeleton" style="height: 200px;"></div>
            </div>
        </section>
"@
$videosHtml = New-STPage "Videos" $videosSec '<script src="js/youtube.js"></script>'
Set-Content -Path videos.html -Value $videosHtml -Encoding UTF8

$newsSec = @"
        <section id="news" class="section news-section reveal">
            <h2 class="section-title">Latest Tech News</h2>
            <p class="section-subtitle">Realme UI, OxygenOS, ColorOS & More</p>
            <div class="news-grid" id="news-container">
                <div class="skeleton" style="height: 200px;"></div>
                <div class="skeleton" style="height: 200px;"></div>
            </div>
        </section>
"@
$newsHtml = New-STPage "News" $newsSec '<script src="js/news.js"></script>'
Set-Content -Path news.html -Value $newsHtml -Encoding UTF8

$searchBody = @"
<section class="section">
    <h2 class="section-title">Search</h2>
    <div class="glass-card" style="padding: 2rem; text-align: center;">
        <input type="text" id="main-search-input" placeholder="Search videos, news, articles..." style="width: 100%; max-width: 650px; padding: 1.2rem 2rem; border-radius: 50px; border: 2px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.3); color: white; font-size: 1.25rem; font-weight: 700; outline: none; text-align: center; backdrop-filter: blur(20px); box-shadow: 0 10px 40px rgba(0,0,0,0.4), var(--accent-glow);">
        <div id="search-results" style="margin-top: 2rem; display: grid; gap: 1.5rem; text-align: left;"></div>
    </div>
</section>
"@
$searchHtml = New-STPage "Search" $searchBody '<script src="js/search.js"></script>'
Set-Content -Path search.html -Value $searchHtml -Encoding UTF8





Write-Output "Fixed and generated!"
