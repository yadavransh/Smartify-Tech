const API_KEY = "AIzaSyAoGz7Soi42cMatLmjI5uM5TvWcVQE3luw";
const CHANNEL_ID = "UCt5RPQ9wFmTsU1ZH-OemLfw";

function initDynamicGreeting() {
    const greetingContainer = document.getElementById('dynamic-greeting');
    const greetingIcon = document.getElementById('greeting-icon');
    const greetingTitle = document.getElementById('greeting-title');
    const greetingSubtitle = document.getElementById('greeting-subtitle');

    if (!greetingContainer) return;

    const hour = new Date().getHours();
    const isReturning = localStorage.getItem('returning_visitor') === 'true';
    localStorage.setItem('returning_visitor', 'true');

    let state = {
        title: "Hello",
        subtitle: "Welcome to Smartify Tech.",
        icon: "fa-sun"
    };

    if (hour >= 5 && hour < 12) {
        state = {
            title: "Good Morning",
            subtitle: isReturning ? "Great to see you again! Ready for more tech?" : "Start your day with fresh tech updates.",
            icon: "fa-sun"
        };
    } else if (hour >= 12 && hour < 17) {
        state = {
            title: "Welcome Back",
            subtitle: isReturning ? "Hope you're having a productive afternoon!" : "Ready for your afternoon tech fix?",
            icon: "fa-cloud-sun"
        };
    } else if (hour >= 17 && hour < 22) {
        state = {
            title: "Evening Scroll Time",
            subtitle: isReturning ? "Wind down with some tech reads." : "Catch up on what you missed today.",
            icon: "fa-moon"
        };
    } else {
        state = {
            title: "Late Night Tech Hunting?",
            subtitle: isReturning ? "Burning the midnight oil again?" : "Fueling the midnight tech obsession.",
            icon: "fa-user-astronaut"
        };
    }

    greetingContainer.classList.add('fade-out');

    setTimeout(() => {
        greetingIcon.className = `fa-solid ${state.icon}`;
        greetingTitle.innerText = state.title;
        greetingSubtitle.innerText = state.subtitle;
        greetingContainer.classList.remove('fade-out');
        greetingContainer.classList.add('fade-in');

        // Initialize weather environment after greeting renders
        initWeatherEnvironment();
    }, 300);
}

function initWeatherEnvironment() {
    const weatherBg = document.getElementById('weather-bg');
    if (!weatherBg) return;

    // Create elements if they don't exist
    if (!weatherBg.querySelector('.weather-celestial')) {
        const celestial = document.createElement('div');
        celestial.className = 'weather-celestial';
        weatherBg.appendChild(celestial);

        // Create clouds
        for (let i = 0; i < 3; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'weather-cloud';
            cloud.style.width = `${100 + Math.random() * 100}px`;
            cloud.style.height = `${30 + Math.random() * 20}px`;
            cloud.style.top = `${10 + Math.random() * 40}%`;
            cloud.style.animationDelay = `${i * 5}s`;
            weatherBg.appendChild(cloud);
        }

        // Create stars
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.className = 'weather-star';
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            weatherBg.appendChild(star);
        }

        // Create rain container
        const rainContainer = document.createElement('div');
        rainContainer.className = 'weather-rain-container';
        for (let i = 0; i < 15; i++) {
            const drop = document.createElement('div');
            drop.className = 'weather-drop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDelay = `${Math.random() * 1}s`;
            rainContainer.appendChild(drop);
        }
        weatherBg.appendChild(rainContainer);

        // Create lightning
        const lightning = document.createElement('div');
        lightning.className = 'weather-lightning';
        weatherBg.appendChild(lightning);
    }

    // Fallback coords (Delhi)
    let lat = 28.6139;
    let lon = 77.2090;

    // Ask for location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                lat = position.coords.latitude;
                lon = position.coords.longitude;
                fetchWeather(lat, lon);
            },
            (error) => {
                console.log("Location denied or error, using fallback.");
                fetchWeather(lat, lon); // Use fallback
            },
            { timeout: 5000 }
        );
    } else {
        fetchWeather(lat, lon);
    }

    async function fetchWeather(latitude, longitude) {
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await response.json();
            if (data && data.current_weather) {
                applyWeatherState(data.current_weather.weathercode, data.current_weather.time);
            }
        } catch (e) {
            console.error("Error fetching weather:", e);
            applyWeatherState(0, new Date().toISOString()); // Fallback to clear
        }
    }

    function applyWeatherState(code, timeStr) {
        const date = new Date(timeStr);
        const hour = date.getHours();
        const isNight = hour >= 19 || hour < 5;

        const container = document.getElementById('dynamic-greeting');
        if (!container) return;

        // Clear previous states
        container.classList.remove('weather-sunny', 'weather-night', 'weather-cloudy', 'weather-rain', 'weather-storm');

        // Map WMO codes
        let stateClass = 'weather-sunny';

        if (isNight) {
            stateClass = 'weather-night';
        } else if (code === 0) {
            stateClass = 'weather-sunny';
        } else if (code >= 1 && code <= 3) {
            stateClass = 'weather-cloudy';
        } else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
            stateClass = 'weather-rain';
        } else if (code >= 95) {
            stateClass = 'weather-storm';
        }

        container.classList.add(stateClass);

        // Move celestial body based on time
        const celestial = weatherBg.querySelector('.weather-celestial');
        if (celestial) {
            const percent = ((hour - 5) / 14) * 100; // 5 AM to 7 PM
            if (percent >= 0 && percent <= 100) {
                // Restrict to right side (60% to 90%) to avoid overlapping text on the left
                celestial.style.left = `${60 + (percent * 0.3)}%`;
                celestial.style.top = `${20 - Math.sin((percent / 100) * Math.PI) * 10}%`;
            } else {
                // Night or outside range
                celestial.style.left = '75%';
                celestial.style.top = '15%';
            }
        }
    }
}

// Pause animations when tab is inactive
document.addEventListener('visibilitychange', () => {
    const container = document.getElementById('dynamic-greeting');
    if (container) {
        if (document.hidden) {
            container.classList.add('weather-paused');
        } else {
            container.classList.remove('weather-paused');
        }
    }
});



// --- Dynamic Round Favicon ---
function setRoundFavicon(src) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw rounded rectangle instead of circle
        const radius = 12; // Corner radius
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(64 - radius, 0);
        ctx.quadraticCurveTo(64, 0, 64, radius);
        ctx.lineTo(64, 64 - radius);
        ctx.quadraticCurveTo(64, 64, 64 - radius, 64);
        ctx.lineTo(radius, 64);
        ctx.quadraticCurveTo(0, 64, 0, 64 - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        
        ctx.clip();
        ctx.drawImage(img, 0, 0, 64, 64);
        const dataURL = canvas.toDataURL('image/png');

        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = dataURL;
    };
}
setRoundFavicon('Cover1.png');

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize VanillaTilt
    VanillaTilt.init(document.querySelectorAll(".tilt-element"), {
        max: 1, speed: 400, gyroscope: false, glare: true,
        "max-glare": 0.1, gyroscope: false, scale: 1.01
    });

    // Initialize Greeting
    initDynamicGreeting();

    // 2. Fetch YouTube Data dynamically
    fetchYouTubeStats();
    fetchYouTubeVideos();

    // 3. Fetch and Render Google News
    fetchGoogleNews();

    // 3.5 Restore Header Scroll Split Logic
    const mainHeader = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });



    // 5. Search Expansion Logic
    const searchBtn = document.getElementById('search-btn');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const bottomNavContainer = document.querySelector('.bottom-nav-container');
    const searchInput = document.getElementById('nav-search-input');

    if (searchBtn && closeSearchBtn && bottomNavContainer && searchInput) {
        searchBtn.addEventListener('click', () => {
            bottomNavContainer.classList.add('search-expanded');
            setTimeout(() => {
                searchInput.focus();
            }, 400); // Wait for CSS transition
        });

        closeSearchBtn.addEventListener('click', () => {
            bottomNavContainer.classList.remove('search-expanded');
            searchInput.value = '';
            searchWebsite(''); // Reset search
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            searchWebsite(query);
        });
    }

    function searchWebsite(query) {
        const videoCards = document.querySelectorAll('.video-card');
        const postCards = document.querySelectorAll('.admin-post-card');
        const newsCards = document.querySelectorAll('.news-card');

        const allItems = [...videoCards, ...postCards, ...newsCards];
        let found = 0;

        allItems.forEach(item => {
            const text = item.innerText.toLowerCase();
            if (text.includes(query) || query === '') {
                item.classList.remove('search-hidden');
                found++;
            } else {
                item.classList.add('search-hidden');
            }
        });

        // Hide section titles if no children are visible
        document.querySelectorAll('.section').forEach(section => {
            const visibleItems = section.querySelectorAll('.video-card:not(.search-hidden), .admin-post-card:not(.search-hidden), .news-card:not(.search-hidden)');
            if (visibleItems.length === 0 && query !== '') {
                section.classList.add('search-hidden');
            } else {
                section.classList.remove('search-hidden');
            }
        });
    }

    // 6. Bottom Navigation & Drawer Logic
    const bottomMenuBtn = document.getElementById('bottom-menu-btn');
    const sideDrawer = document.getElementById('side-drawer');
    const sideDrawerOverlay = document.getElementById('side-drawer-overlay');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const drawerLinks = document.querySelectorAll('.drawer-links a');

    function openDrawer() {
        sideDrawer.classList.add('active');
        sideDrawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        sideDrawer.classList.remove('active');
        sideDrawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (bottomMenuBtn && sideDrawer) {
        bottomMenuBtn.addEventListener('click', openDrawer);
        closeDrawerBtn.addEventListener('click', closeDrawer);
        sideDrawerOverlay.addEventListener('click', closeDrawer);

        drawerLinks.forEach(link => {
            link.addEventListener('click', closeDrawer);
        });
    }

    // 7. Nav Active Toggle Logic
    const navItems = document.querySelectorAll('.bottom-nav-container .nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });




});

// --- Telegram Popup Logic ---
window.toggleTelegramMenu = function (e) {
    e.preventDefault();
    e.stopPropagation();
    const popup = document.getElementById('telegram-popup');
    if (popup) popup.classList.toggle('active');
};

document.addEventListener('click', (e) => {
    const popup = document.getElementById('telegram-popup');
    if (popup && popup.classList.contains('active') && !e.target.closest('.telegram-container')) {
        popup.classList.remove('active');
    }
});

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num;
}

function animateValue(id, start, end, duration) {
    if (start === end) return;
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.innerHTML = formatNumber(current);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

async function fetchYouTubeStats() {
    try {
        const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
        const response = await fetch(statsUrl);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const stats = data.items[0].statistics;
            animateValue('sub-count', 0, parseInt(stats.subscriberCount), 2000);
            animateValue('video-count', 0, parseInt(stats.videoCount), 2000);
            animateValue('view-count', 0, parseInt(stats.viewCount), 2000);
        }
    } catch (e) {
        console.error("Error fetching stats:", e);
    }
}

async function fetchYouTubeVideos() {
    const videosContainer = document.getElementById("videos-container");
    videosContainer.innerHTML = '<div class="loader">Loading latest videos...</div>';

    try {
        // Use playlistItems with the "Uploads" playlist ID instead of the costly search API
        const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU');
        const fetchUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${API_KEY}`;
        const response = await fetch(fetchUrl);
        const data = await response.json();

        videosContainer.innerHTML = '';
        const latestVideosGrid = document.getElementById("latest-videos-grid");
        if (latestVideosGrid) latestVideosGrid.innerHTML = '';

        if (data.items && data.items.length > 0) {
            let count = 0;
            data.items.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                const snippet = item.snippet;

                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = snippet.title;
                const decodedTitle = tempDiv.textContent || tempDiv.innerText || "";

                let thumb = snippet.thumbnails.default.url;
                if (snippet.thumbnails.high) thumb = snippet.thumbnails.high.url;
                else if (snippet.thumbnails.medium) thumb = snippet.thumbnails.medium.url;

                const pubDate = new Date(snippet.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });

                if (count < 3 && latestVideosGrid) {
                    const card = document.createElement("div");
                    card.className = "glass-card tilt-element";
                    card.style.cursor = "pointer";
                    card.style.display = "flex";
                    card.style.flexDirection = "column";
                    card.onclick = () => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');

                    card.innerHTML = `
                        <div style="position: relative;">
                            ${count === 0 ? '<div class="latest-badge" style="position: absolute; top: 10px; left: 10px; background: #ff0000; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; z-index: 2;">Latest</div>' : ''}
                            <img src="${thumb}" alt="${decodedTitle}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px 8px 0 0;">
                        </div>
                        <div style="padding: 1rem;">
                            <h3 style="font-size: 1rem; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${decodedTitle}</h3>
                            <span style="font-size: 0.85rem; color: var(--text-secondary);">${pubDate}</span>
                        </div>
                    `;
                    latestVideosGrid.appendChild(card);
                } else {
                    const card = document.createElement("div");
                    card.className = "glass-card video-card tilt-element";
                    card.style.cursor = "pointer";
                    card.onclick = () => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');

                    card.innerHTML = `
                        <img src="${thumb}" alt="${decodedTitle}" class="video-thumbnail">
                        <div class="video-info">
                            <h3>${decodedTitle}</h3>
                            <span class="video-stats">${pubDate}</span>
                        </div>
                    `;
                    videosContainer.appendChild(card);
                }
                count++;
            });

            // Re-initialize tilt for dynamically added elements
            VanillaTilt.init(document.querySelectorAll(".video-card"), {
                max: 1, speed: 400, gyroscope: false, glare: true,
                "max-glare": 0.1, gyroscope: false, scale: 1.01
            });
        } else {
            console.error("YouTube API Response:", data);
            let errorMsg = "No videos found.";
            if (data.error) {
                errorMsg = `API Error: ${data.error.message}`;
            }
            videosContainer.innerHTML = `<p style="color: var(--text-secondary); text-align: center;">${errorMsg}<br><small>Tip: Ensure YouTube Data API v3 is enabled for your key.</small></p>`;
        }
    } catch (e) {
        console.error("Error fetching videos:", e);
        videosContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Connection error. Check your API Key or quota.</p>';
    }
}

async function fetchGoogleNews() {
    const newsContainer = document.getElementById("news-container");
    if (!newsContainer) return;

    // Midnight Sync Logic
    const today = new Date().toDateString();
    const lastSync = localStorage.getItem('news_last_sync');
    const cachedNews = localStorage.getItem('news_cache');

    if (lastSync === today && cachedNews) {
        renderNewsItems(JSON.parse(cachedNews));
        return;
    }

    // Official Google News Technology RSS Search
    const query = "smartphone OR Android OR iOS OR Samsung OR Apple OR Xiaomi OR Realme";
    const rssUrl = encodeURIComponent(`https://news.google.com/rss/search?q=${query}+when:24h&hl=en-IN&gl=IN&ceid=IN:en`);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === 'ok' && data.items.length > 0) {
            localStorage.setItem('news_cache', JSON.stringify(data.items));
            localStorage.setItem('news_last_sync', today);
            renderNewsItems(data.items);
        } else {
            if (cachedNews) renderNewsItems(JSON.parse(cachedNews));
            else newsContainer.innerHTML = '<p>Unable to load news at the moment.</p>';
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        if (cachedNews) renderNewsItems(JSON.parse(cachedNews));
        else newsContainer.innerHTML = '<p>Error loading news feed.</p>';
    }
}

function renderNewsItems(items) {
    const newsContainer = document.getElementById("news-container");
    const fullNewsContainer = document.getElementById("full-news-container");

    if (newsContainer) newsContainer.innerHTML = '';
    if (fullNewsContainer) fullNewsContainer.innerHTML = '';

    items.forEach((article, index) => {
        const card = document.createElement("div");
        card.className = "glass-card news-card tilt-element";

        const pubDate = new Date(article.pubDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        let imgHtml = '';
        let imageUrl = article.thumbnail || (article.enclosure && article.enclosure.link);
        if (!imageUrl) {
            const imgMatch = article.description.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) imageUrl = imgMatch[1];
        }

        if (imageUrl) {
            imgHtml = `<img src="${imageUrl}" alt="News Image" style="width:100%; height:160px; object-fit:cover; border-radius:12px; margin-bottom:1rem; border:1px solid rgba(255,255,255,0.1);">`;
        }

        const descText = article.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

        card.innerHTML = `
            ${imgHtml}
            <h3 style="display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:1.1rem;margin-bottom:0.5rem;">${article.title}</h3>
            <p style="display:-webkit-box;-webkit-line-clamp:3;line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:0.9rem;color:var(--text-secondary);flex-grow:1;">${descText}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                <span style="font-size: 0.8rem; color: var(--text-secondary);">${pubDate}</span>
                <a href="${article.link}" target="_blank" class="read-more">Read More &rarr;</a>
            </div>
        `;

        if (index < 6 && newsContainer) { // Show more on home page
            newsContainer.appendChild(card.cloneNode(true));
        }
        if (fullNewsContainer) {
            fullNewsContainer.appendChild(card);
        }
    });

    VanillaTilt.init(document.querySelectorAll(".news-card"), {
        max: 1, speed: 400, gyroscope: false, glare: true, "max-glare": 0.1
    });
}

// --- Full News Page Logic ---
const showMoreNewsBtn = document.getElementById('show-more-news-btn');
const fullNewsPage = document.getElementById('full-news-page');
const closeNewsPage = document.getElementById('close-news-page');
const navNewsBtn = document.getElementById('nav-news-btn');

function openNewsOverlay() {
    if (fullNewsPage) {
        fullNewsPage.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

if (showMoreNewsBtn && fullNewsPage && closeNewsPage) {
    showMoreNewsBtn.addEventListener('click', openNewsOverlay);

    if (navNewsBtn) {
        navNewsBtn.addEventListener('click', openNewsOverlay);
    }

    closeNewsPage.addEventListener('click', () => {
        fullNewsPage.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

// Check for saved theme preference or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
htmlEl.setAttribute('data-theme', savedTheme);



themeToggleBtn.addEventListener('click', (e) => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (!document.startViewTransition) {
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        return;
    }

    const rect = themeToggleBtn.getBoundingClientRect();
    const x = e.clientX || (rect.left + rect.width / 2);
    const y = e.clientY || (rect.top + rect.height / 2);

    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    transition.ready.then(() => {
        document.documentElement.animate(
            [
                { clipPath: `circle(0px at ${x}px ${y}px)` },
                { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
            ],
            {
                duration: 600,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    });
});



function initApp() {
    initClockAndCelestial();
    
    // --- Data Saver Logic (Event Delegation) ---
    const savedDataSaver = localStorage.getItem('dataSaver') === 'true';

    // Apply state immediately on load
    if (savedDataSaver) {
        document.body.classList.add('data-saver-on');
        const btn = document.getElementById('data-saver-toggle');
        if (btn) btn.classList.add('active');
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#data-saver-toggle');
        if (btn) {
            console.log('Data Saver Button Clicked!');
            const isActive = document.body.classList.toggle('data-saver-on');
            btn.classList.toggle('active');
            localStorage.setItem('dataSaver', isActive);
            
            // Force reflow to ensure styles apply immediately!
            document.body.style.display = 'none';
            document.body.offsetHeight; // no-op
            document.body.style.display = '';
        }
    });
}

// Check if DOM is already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// --- Dynamic Clock & Celestial Body Logic ---
function initClockAndCelestial() {
    const clockEl = document.getElementById('header-clock');
    const celestialEl = document.getElementById('celestial-body');
    if (!clockEl || !celestialEl) return;

    function update() {
        const now = new Date();

        // Update Clock
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
        const displaySeconds = seconds < 10 ? '0' + seconds : seconds;

        clockEl.innerText = `${displayHours}:${displayMinutes} ${ampm}`;

        // Update Celestial Body
        // Sun from 6 AM (6) to 6 PM (18)
        // Moon from 6 PM (18) to 6 AM (6 next day)

        let isDay = hours >= 6 && hours < 18;
        let percentage = 0;

        if (isDay) {
            // 6 to 18 -> 12 hours total.
            // Include seconds for fluid smooth motion
            let passedMinutes = (hours - 6) * 60 + minutes + (now.getSeconds() / 60);
            let totalMinutes = 12 * 60;
            percentage = (passedMinutes / totalMinutes) * 100;

            celestialEl.className = 'celestial-body celestial-sun';
            celestialEl.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            // 18 to 6 next day -> 12 hours total.
            // At 6 PM -> 0%, at 12 AM -> 50%, at 6 AM -> 100%
            let passedMinutes = 0;
            if (hours >= 18) {
                passedMinutes = (hours - 18) * 60 + minutes + (now.getSeconds() / 60);
            } else {
                passedMinutes = (hours + 6) * 60 + minutes + (now.getSeconds() / 60); // +6 because 12 hours from 18:00
            }
            let totalMinutes = 12 * 60;
            percentage = (passedMinutes / totalMinutes) * 100;

            // Move right to left for moon (100% down to 0%)
            percentage = 100 - percentage;

            celestialEl.className = 'celestial-body celestial-moon';
            celestialEl.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }

        // Apply position on an arc path
        celestialEl.style.left = `${percentage}%`;
        // Top goes from 50% down to 15% and back to 50% (shallow arc)
        const arcHeight = 35;
        const verticalPos = 50 - (arcHeight * Math.sin(Math.PI * percentage / 100));
        celestialEl.style.top = `${verticalPos}%`;
    }

    update();
    setInterval(update, 1000);
}




