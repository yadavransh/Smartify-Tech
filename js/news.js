// js/news.js

async function fetchGoogleNews(query = "Smartphone News OR Realme UI OR OxygenOS OR ColorOS") {
    const newsContainer = document.getElementById("news-container");
    const newsPreviewContainer = document.getElementById("news-preview-container");
    const target = newsContainer || newsPreviewContainer;
    
    if (!target) return;
    
    if (!target.querySelector('.skeleton')) {
        target.innerHTML = '<div class="loader">Loading news...</div>';
    }
    
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        target.innerHTML = '';

        let allNews = [];

        if (data.status === 'ok' && data.items.length > 0) {
            data.items.forEach(article => {
                allNews.push(article);
            });
        }
        
        // Cache for search
        sessionStorage.setItem('news_data', JSON.stringify(allNews));
        if (window.SearchEngine) SearchEngine.buildIndex();

        if (allNews.length > 0) {
            let visibleCount = 10; // Show 10 initially for news
            const batchSize = 10;

            function renderAllNews() {
                if (target) target.innerHTML = '';
                
                const newsToDisplay = allNews.slice(0, visibleCount);
                
                newsToDisplay.forEach((article, index) => {
                    // Limit homepage preview to 12 as requested
                    if (newsPreviewContainer && index >= 12) return;

                    const card = document.createElement("div");
                    card.className = "glass-card news-card tilt-element";
                    card.style.padding = "1.2rem"; // Slightly reduced padding for mobile optimization
                    
                    const pubDate = new Date(article.pubDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });

                    // Extract real source and clean title
                    let sourceName = "Google News";
                    let displayTitle = article.title;
                    
                    const sourceMatch = article.title.match(/(.*)\s+-\s+([^|-]+)$/);
                    if (sourceMatch) {
                        displayTitle = sourceMatch[1].trim();
                        sourceName = sourceMatch[2].trim();
                    }

                    let imageUrl = article.thumbnail || (article.enclosure && article.enclosure.link);
                    if (!imageUrl) {
                        const imgMatch = article.description.match(/<img[^>]+src="([^">]+)"/);
                        if (imgMatch) imageUrl = imgMatch[1];
                    }

                    const descText = article.description.replace(/<[^>]*>?/gm, '');
                    
                    // Determine brand color for fallback
                    const activeTab = document.querySelector('.news-tab.active');
                    let brandColor = "#4285F4";
                    let brandName = "News";
                    if (activeTab) {
                        const span = activeTab.querySelector('span');
                        brandName = span ? span.innerText : activeTab.innerText;
                        if (brandName.toLowerCase() === 'realme') brandColor = "#FFC107";
                        else if (brandName.toLowerCase() === 'oppo') brandColor = "#008E5A";
                        else if (brandName.toLowerCase() === 'oneplus') brandColor = "#F50057";
                        else if (brandName.toLowerCase() === 'samsung') brandColor = "#034EA2";
                        else if (brandName.toLowerCase() === 'vivo') brandColor = "#415FFF";
                        else if (brandName.toLowerCase() === 'apple') brandColor = "#ffffff";
                    }

                    let faviconUrl = "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"; // Fallback to G logo
                    try {
                        const url = new URL(article.link);
                        faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
                    } catch (e) {
                        console.error("Error parsing URL for favicon:", e);
                    }

                    card.innerHTML = `
                        <div style="display: flex; gap: 15px; width: 100%; flex-direction: row;">
                            <!-- Left Column: Content -->
                            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem;">
                                        <!-- Source Favicon -->
                                        <img src="${faviconUrl}" alt="Logo" style="width: 16px; height: 16px; border-radius: 2px;">
                                        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">${sourceName}</span>
                                    </div>
                                    <h3 style="display:-webkit-box;-webkit-line-clamp:3;line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:0.95rem;margin-bottom:0.5rem; color: var(--text-primary); line-height: 1.3;">${displayTitle}</h3>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; font-size: 0.75rem; color: var(--text-secondary);">
                                    <span>${pubDate}</span>
                                    <span>• By ${sourceName}</span>
                                </div>
                            </div>
                            
                            <!-- Right Column: Image and Button -->
                            <div style="width: 100px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; align-items: center;">
                                ${imageUrl ? 
                                    `<div style="width: 100px; height: 100px;"><img src="${imageUrl}" alt="News Image" style="width:100%; height:100%; object-fit:cover; border-radius:12px; border:1px solid rgba(255,255,255,0.1);"></div>` : 
                                    `<div style="width: 100px; height: 100px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${brandColor}; font-size: 0.8rem; font-weight: bold; border: 1px solid rgba(255,255,255,0.1);"><i class="fa-solid fa-newspaper" style="font-size: 1.2rem; margin-bottom: 4px;"></i>${brandName}</div>`
                                }
                                <a href="${article.link}" target="_blank" style="width: 100%; padding: 5px 0; border-radius: 15px; background: rgba(255,255,255,0.05); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 4px; border: 1px solid rgba(255,255,255,0.1);">
                                    <i class="fa-solid fa-book-open" style="font-size: 0.7rem;"></i> Read more
                                </a>
                            </div>
                        </div>
                    `;
                    target.appendChild(card);
                });

                // Handle Show More Button (Only on news page, not preview)
                if (newsContainer) {
                    const showMoreBtn = document.getElementById('show-more-news-btn');
                    const showMoreContainer = document.getElementById('show-more-news-container');
                    
                    if (showMoreContainer && showMoreBtn) {
                        showMoreContainer.style.display = 'block';
                        
                        if (visibleCount < allNews.length) {
                            showMoreBtn.innerHTML = `<i class="fa-solid fa-newspaper" style="font-size: 1.1rem;"></i> <span>Show More</span>`;
                            showMoreBtn.onclick = () => {
                                visibleCount += batchSize;
                                renderAllNews();
                            };
                        } else {
                            showMoreBtn.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 1.1rem;"></i> <span>Open Google News</span>`;
                            showMoreBtn.onclick = () => {
                                window.open(`https://news.google.com/search?q=Smartphone+News+OR+Realme+UI+OR+OxygenOS+OR+ColorOS`, '_blank');
                            };
                        }
                    }
                }

                // Re-initialize Tilt
                if(typeof VanillaTilt !== 'undefined') {
                    VanillaTilt.init(document.querySelectorAll(".news-card"), {
                        max: 1, speed: 400, gyroscope: false, glare: true, "max-glare": 0.1, gyroscope: false});
                }
            }

            renderAllNews();
        } else {
            target.innerHTML = '<p>Unable to load news at the moment.</p>';
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        target.innerHTML = '<p>Error loading news feed. Please try again later.</p>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchGoogleNews();
    
    const refreshBtn = document.getElementById('refresh-news-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            
            // Get active tab query
            const activeTab = document.querySelector('.news-tab.active');
            const query = activeTab ? activeTab.getAttribute('data-query') : undefined;
            
            fetchGoogleNews(query).finally(() => {
                setTimeout(() => {
                    if (icon) icon.classList.remove('fa-spin');
                }, 500); // Keep spinning for a bit for visual feedback
            });
        });
    }

    // Search Filter for News Page (Real-time page filtering)
    const navSearchInput = document.getElementById('nav-search-input');
    const mainSearchInput = document.getElementById('main-search-input');
    
    function filterNews(query) {
        const q = query.toLowerCase().trim();
        const cards = document.querySelectorAll('.news-card');
        
        cards.forEach(card => {
            const title = card.querySelector('h3') ? card.querySelector('h3').textContent.toLowerCase() : '';
            const desc = card.querySelector('.news-desc') ? card.querySelector('.news-desc').textContent.toLowerCase() : '';
            
            if (title.includes(q) || desc.includes(q)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (navSearchInput) {
        navSearchInput.addEventListener('input', (e) => {
            filterNews(e.target.value);
        });
    }
    
    if (mainSearchInput) {
        mainSearchInput.addEventListener('input', (e) => {
            filterNews(e.target.value);
        });
    }

    // Tab clicks
    const tabs = document.querySelectorAll('.news-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove all inline styles - let CSS classes handle it
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.cssText = '';
            });
            
            tab.classList.add('active');
            
            const query = tab.getAttribute('data-query');
            fetchGoogleNews(query);
        });
    });
});



