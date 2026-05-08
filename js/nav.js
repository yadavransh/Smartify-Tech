// js/nav.js

function initClockAndCelestial() {
    const clockEl = document.getElementById('header-clock');
    const celestialEl = document.getElementById('celestial-body');
    if (!clockEl || !celestialEl) return;

    function update() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
        clockEl.innerText = `${displayHours}:${displayMinutes} ${ampm}`;

        let isDay = hours >= 6 && hours < 18;
        
        // Calculate percentage through the current cycle (Day: 6-18, Night: 18-6)
        let cycleHours = isDay ? (hours - 6) : (hours >= 18 ? hours - 18 : hours + 6);
        let percentage = (cycleHours + minutes/60) / 12;

        // Position across an arc
        const xPos = 15 + (percentage * 70); // 15% to 85% width
        const yOffset = Math.sin(percentage * Math.PI) * 20; // 20px arc height
        
        celestialEl.style.left = `${xPos}%`;
        celestialEl.style.top = `${50 - yOffset}%`;
        
        celestialEl.innerHTML = isDay ? 
            '<i class="fa-solid fa-sun" style="color: #FFD700; filter: drop-shadow(0 0 15px rgba(255,215,0,0.8));"></i>' : 
            '<i class="fa-solid fa-moon" style="color: #f0f6fc; filter: drop-shadow(0 0 15px rgba(240,246,252,0.8));"></i>';
    }
    update();
    setInterval(update, 60000);
}



document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Persistence
    const htmlEl = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlEl.setAttribute('data-theme', savedTheme);
    
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // 2. Reveal on Scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 3. Header Logic
    const mainHeader = document.getElementById('main-header');
    if(mainHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) mainHeader.classList.add('scrolled');
            else mainHeader.classList.remove('scrolled');
        }, { passive: true });
    }

    // 4. Admin Navigation
    const adminBtn = document.getElementById('admin-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const isDashboard = window.location.pathname.includes('dashboard.html');

    if (adminBtn && headerLogoutBtn) {
        if (isAdmin && isDashboard) {
            adminBtn.style.display = 'none';
            headerLogoutBtn.style.display = 'flex';
        } else {
            adminBtn.style.display = 'flex';
            headerLogoutBtn.style.display = 'none';
        }
    }

    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        });
    }

    // 5. Bottom Nav Active Tracking & Morphing
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');
    const navPill = document.getElementById('main-nav-pill');
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        let current = "";
        sections.forEach((section) => {
            if (window.pageYOffset >= section.offsetTop - 200) current = section.getAttribute("id");
        });
        navItems.forEach((li) => {
            li.classList.remove("active");
            if (li.getAttribute("href") === `#${current}` || li.getAttribute("href") === (window.location.pathname.split('/').pop() || 'index.html')) {
                li.classList.add("active");
            }
        });

        // Morphing Logic (Shrink on scroll, expand on stop)
        if (navPill) {
            navPill.classList.add('shrunken');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                navPill.classList.remove('shrunken');
            }, 200);
        }
    }, { passive: true });

    // 6. Separate Search Action
    const searchBtn = document.getElementById('search-btn');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('nav-search-input');
    const closeSearchBtn = document.getElementById('close-search-btn');

    if (searchBtn && searchContainer && searchInput) {
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'inline-search-results';
        resultsContainer.className = 'glass-card';
        // Positioned below the expanded search box (bottom: 80px, right: 20px)
        resultsContainer.style.cssText = ''; // Styles handled in CSS for animation!
        document.body.appendChild(resultsContainer);

        searchBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            searchContainer.classList.add('expanded');
            if (navPill) navPill.classList.add('hidden');
            searchInput.focus();
            renderRecentSearches(resultsContainer);
            
            // Slide up results after search box expands
            setTimeout(() => {
                resultsContainer.classList.add('visible');
                resultsContainer.classList.remove('collapsing');
            }, 300);
        });

        function closeSearch() {
            resultsContainer.classList.remove('visible');
            resultsContainer.classList.add('collapsing');
            
            // Wait for results to slide down before closing search box
            setTimeout(() => {
                searchContainer.classList.remove('expanded');
                if (navPill) navPill.classList.remove('hidden');
                searchInput.blur();
                searchInput.value = '';
            }, 400);
        }

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target) && !resultsContainer.contains(e.target) && searchContainer.classList.contains('expanded')) {
                closeSearch();
            }
        });

        closeSearchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSearch();
        });

        window.closeGlobalSearch = () => {
            closeSearch();
        };

        // ESC to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchContainer.classList.contains('expanded')) {
                window.closeGlobalSearch();
            }
        });

        let searchInputTimeout;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(searchInputTimeout);
            searchInputTimeout = setTimeout(() => {
                if (query.length < 2) {
                    renderRecentSearches(resultsContainer);
                    return;
                }
                
                resultsContainer.style.display = 'block';
                const results = SearchEngine.search(query);
                SearchEngine.render(results, query, resultsContainer);
            }, 300);
        });
    }

    function renderRecentSearches(container) {
        const recent = SearchEngine.recentSearches;
        const trending = ['Samsung', 'Realme UI', 'OneUI 7', 'HyperOS'];
        
        container.innerHTML = '';
        container.classList.add('visible');

        if (recent.length > 0) {
            container.innerHTML += '<div style="padding: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; opacity: 0.9;">Recent Searches</div>';
            container.innerHTML += recent.map(r => `
                <div class="search-result-item" role="button" style="cursor: pointer; padding: 0.8rem;" onclick="SearchEngine.triggerSearch('${r}')">
                    <i class="fa-solid fa-clock-rotate-left" style="opacity: 0.5; margin-right: 10px;"></i>
                    <span>${r}</span>
                </div>
            `).join('');
        }

        container.innerHTML += '<div style="padding: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; opacity: 0.9; margin-top: 1rem;">Trending Topics</div>';
        container.innerHTML += trending.map(t => `
            <div class="search-result-item" role="button" style="cursor: pointer; padding: 0.8rem;" onclick="SearchEngine.triggerSearch('${t}')">
                <i class="fa-solid fa-fire" style="color: #ff4500; margin-right: 10px;"></i>
                <span>${t}</span>
            </div>
        `).join('');
    }

    // 7. Hamburger Menu (Side Drawer)
    const menuBtn = document.getElementById('bottom-menu-btn');
    const drawer = document.getElementById('side-drawer');
    const drawerOverlay = document.getElementById('side-drawer-overlay');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');

    if (menuBtn && drawer && drawerOverlay) {
        const toggleDrawer = (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            const isActive = drawer.classList.toggle('active');
            drawerOverlay.classList.toggle('active');
            
            // Add interaction feedback to button
            menuBtn.classList.toggle('active');
        };

        window.closeDrawer = () => {
            drawer.classList.remove('active');
            drawerOverlay.classList.remove('active');
            menuBtn.classList.remove('active');
        };

        menuBtn.addEventListener('click', toggleDrawer);
        closeDrawerBtn.addEventListener('click', toggleDrawer);
        drawerOverlay.addEventListener('click', toggleDrawer);

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('active')) {
                window.closeDrawer();
            }
        });

        // Close on navigation click
        drawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // If it's a section on same page, smooth scroll is handled by global listener
                // But we still want to close the drawer
                window.closeDrawer();
            });
        });
    }

    // 8. Initialize Extras
    initClockAndCelestial();
    
    // Smooth Scroll Fix
    document.querySelectorAll('a[href^="#"], .drawer-links a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href.includes('#')) return;
            
            const targetId = href.split('#').pop();
            const target = document.getElementById(targetId);
            
            if (target) {
                e.preventDefault();
                
                // If in drawer, close it first
                if (window.closeDrawer) window.closeDrawer();
                
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        });
    });
});

window.toggleTelegramMenu = function(e) {
    e.stopPropagation();
    const popup = document.getElementById('telegram-popup');
    if(popup) popup.classList.toggle('active');
}
document.addEventListener('click', (e) => {
    const popup = document.getElementById('telegram-popup');
    if (popup && !e.target.closest('.telegram-container')) popup.classList.remove('active');
});

// ==========================================
// DATA SAVER / PERFORMANCE MODE
// ==========================================
(function initDataSaver() {
    const SAVER_KEY = 'dataSaver';

    function applyState(isOn) {
        if (isOn) {
            document.body.classList.add('data-saver-on');
        } else {
            document.body.classList.remove('data-saver-on');
        }
        // Update all buttons on this page (in case there are multiple)
        document.querySelectorAll('#data-saver-toggle').forEach(btn => {
            btn.classList.toggle('active', isOn);
        });
    }

    // Apply saved state RIGHT NOW (nav.js runs at body end, DOM is ready)
    const isSaverOn = localStorage.getItem(SAVER_KEY) === 'true';
    applyState(isSaverOn);

    // Toggle on click with premium morph animation
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('#data-saver-toggle');
        if (!btn) return;
        
        const headerRight = document.getElementById('header-right-actions');
        
        // Prevent spam clicking during animation
        if (btn.classList.contains('animating')) return;
        
        const nowOn = !document.body.classList.contains('data-saver-on');
        
        // Add animating and morphing classes
        btn.classList.add('animating', 'morphing');
        if (headerRight) headerRight.classList.add('expanding');
        
        // Find or create text element
        let textEl = btn.querySelector('.data-saver-text');
        if (!textEl) {
            textEl = document.createElement('span');
            textEl.className = 'data-saver-text';
            btn.appendChild(textEl);
        }
        
        // Set text based on the NEW state
        textEl.textContent = nowOn ? 'Data Saver ON' : 'Data Saver OFF';
        
        // Save state to localStorage immediately
        localStorage.setItem(SAVER_KEY, nowOn);
        
        // After 1.5 seconds, collapse back
        setTimeout(() => {
            btn.classList.remove('morphing');
            if (headerRight) headerRight.classList.remove('expanding');
            
            // Wait for collapse transition to finish before updating final colors and state
            setTimeout(() => {
                applyState(nowOn);
                btn.classList.remove('animating');
            }, 500); // Match CSS transition duration
            
        }, 1500);
    });
})();

