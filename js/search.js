/**
 * Smartify Tech - Global Search Engine Module
 * Handles indexing, real-time filtering, and categorized rendering
 */

const SearchEngine = {
    index: [],
    recentSearches: JSON.parse(localStorage.getItem('recent_searches')) || [],

    /**
     * Build the global index from all available sources
     */
    async buildIndex() {
        this.index = [];

        // 1. Static Pages/Sections
        this.addStaticIndex();

        // 2. Admin Published Posts (from localStorage)
        this.addAdminPosts();

        // 3. YouTube Content (from sessionStorage cache)
        this.addYouTubeContent();

        // News content removed from search as requested

        console.log(`[SearchEngine] Index built with ${this.index.length} items.`);
    },

    addStaticIndex() {
        const staticItems = [
            { id: 'st-1', type: 'page', title: 'Home', desc: 'Main landing page for Smartify Tech', url: 'index.html', keywords: 'home landing main smartify' },
            { id: 'st-2', type: 'page', title: 'Videos', desc: 'Top tech videos and reviews', url: 'videos.html', keywords: 'videos youtube reviews tech top' },
            { id: 'st-3', type: 'page', title: 'News', desc: 'Latest tech news and updates', url: 'news.html', keywords: 'news tech updates realme oxygenos coloros' },
            { id: 'st-4', type: 'section', title: 'Support Me', desc: 'Support Smartify Tech via UPI or QR Code', url: 'index.html#support', keywords: 'support pay upi donate help channel qr' },
            { id: 'st-5', type: 'section', title: 'Connect With Me', desc: 'Social links and contact info', url: 'index.html#links', keywords: 'connect social instagram telegram twitter reddit' },
        ];
        this.index.push(...staticItems);
    },

    addAdminPosts() {
        const posts = JSON.parse(localStorage.getItem('admin_posts')) || [];
        posts.forEach((post, idx) => {
            this.index.push({
                id: `admin-${idx}`,
                type: post.type || 'post',
                title: post.title,
                desc: post.desc,
                url: post.ytId ? `https://www.youtube.com/watch?v=${post.ytId}` : (post.type === 'news' ? 'news.html' : (post.type === 'video' ? 'videos.html' : 'index.html#posts')),
                thumbnail: post.thumb || post.image,
                keywords: `${post.title} ${post.desc} ${post.type} admin update`
            });
        });
    },

    addYouTubeContent() {
        const ytData = JSON.parse(sessionStorage.getItem('youtube_data')) || [];
        ytData.forEach((vid, idx) => {
            this.index.push({
                id: `yt-${idx}`,
                type: 'video',
                title: vid.title,
                desc: vid.description || 'YouTube video content',
                url: vid.url || `https://www.youtube.com/watch?v=${vid.id}`,
                thumbnail: vid.thumb || vid.thumbnail,
                date: vid.date, // Store date for date-based search!
                keywords: `${vid.title} youtube video tech review`
            });
        });
    },

    addNewsContent() {
        const newsData = JSON.parse(sessionStorage.getItem('news_data')) || [];
        newsData.forEach((news, idx) => {
            this.index.push({
                id: `news-${idx}`,
                type: 'news',
                title: news.title,
                desc: news.description || 'Tech news update',
                url: news.link || 'news.html',
                thumbnail: news.thumbnail,
                keywords: `${news.title} news tech realme oneui update`
            });
        });
    },

    /**
     * Search the index with keyword matching and scoring
     */
    search(query) {
        if (!query) return [];
        const q = query.toLowerCase().trim();
        let keywords = q.split(' ');

        // Brand Keywords Mapping for expanded search
        const brandKeywords = {
            'realme': ['realme ui'],
            'oppo': ['coloros', 'color os'],
            'oneplus': ['oxygenos', 'oxygen os'],
            'vivo': ['originos', 'origin os'],
            'samsung': ['oneui', 'one ui'],
            'apple': ['ios', 'iphone']
        };

        // Expand search keywords if query contains a brand
        Object.keys(brandKeywords).forEach(brand => {
            if (q.includes(brand)) {
                keywords = [...keywords, ...brandKeywords[brand]];
            }
        });

        // Date Search Power!
        let dateCutoff = null;
        const lastDaysMatch = q.match(/last (\d+) days/);
        if (lastDaysMatch) {
            const days = parseInt(lastDaysMatch[1]);
            dateCutoff = new Date();
            dateCutoff.setDate(dateCutoff.getDate() - days);
        }

        const specificDateMatch = q.match(/(?:uploaded on |on )(\d+)(?:st|nd|rd|th)?\s+(\w+)/);
        let targetDate = null;
        if (specificDateMatch) {
            const day = parseInt(specificDateMatch[1]);
            const month = specificDateMatch[2];
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            const monthIdx = months.findIndex(m => m.startsWith(month.toLowerCase()));
            if (monthIdx !== -1) {
                targetDate = new Date();
                targetDate.setMonth(monthIdx);
                targetDate.setDate(day);
            }
        }

        return this.index
            .map(item => {
                let score = 0;
                const title = item.title.toLowerCase();
                const desc = item.desc.toLowerCase();
                const kws = (item.keywords || '').toLowerCase();

                // Date filtering
                if (dateCutoff || targetDate) {
                    const itemDate = item.date ? new Date(item.date) : null;
                    let itemCalDate = null;

                    if (itemDate && !isNaN(itemDate)) {
                        itemCalDate = itemDate;
                    } else if (item.date && item.date.includes('days ago')) {
                        const daysAgoMatch = item.date.match(/(\d+)\s+days ago/);
                        if (daysAgoMatch) {
                            const daysAgo = parseInt(daysAgoMatch[1]);
                            itemCalDate = new Date();
                            itemCalDate.setDate(itemCalDate.getDate() - daysAgo);
                        }
                    }

                    if (itemCalDate) {
                        if (dateCutoff && itemCalDate < dateCutoff) return { ...item, score: -1 };
                        if (targetDate) {
                            if (itemCalDate.getDate() !== targetDate.getDate() || itemCalDate.getMonth() !== targetDate.getMonth()) {
                                return { ...item, score: -1 };
                            }
                        }
                    } else if (dateCutoff || targetDate) {
                        // If searching by date but item has no valid date, exclude it
                        return { ...item, score: -1 };
                    }
                }

                // Exact match title boost
                if (title.includes(q)) score += 50;
                if (title.startsWith(q)) score += 30;

                // Keyword matching
                keywords.forEach(kw => {
                    if (kw.length < 2) return;
                    if (title.includes(kw)) score += 10;
                    if (desc.includes(kw)) score += 5;
                    if (kws.includes(kw)) score += 3;
                });

                return { ...item, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    },

    /**
     * Highlight matching text
     */
    highlight(text, query) {
        if (!query) return text;
        const keywords = query.trim().split(' ');
        let highlighted = text;
        keywords.forEach(kw => {
            if (kw.length < 2) return;
            const reg = new RegExp(`(${kw})`, 'gi');
            highlighted = highlighted.replace(reg, '<mark>$1</mark>');
        });
        return highlighted;
    },

    /**
     * Save search to history
     */
    saveSearch(query) {
        if (!query || query.length < 3) return;
        this.recentSearches = [query, ...this.recentSearches.filter(s => s !== query)].slice(0, 5);
        localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
    },

    /**
     * Navigate to result and close search UI
     */
    navigate(url, query) {
        if (query) this.saveSearch(query);
        
        // Close search UI if function exists
        if (typeof window.closeGlobalSearch === 'function') {
            window.closeGlobalSearch();
        }

        // Slight delay for smooth UI closing before navigation
        setTimeout(() => {
            if (url.startsWith('http')) {
                window.open(url, '_blank');
            } else {
                window.location.href = url;
            }
        }, 100);
    },

    /**
     * Render results into a container
     */
    render(results, query, container) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-search-state" style="padding: 2rem; text-align: center;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; opacity: 0.2; margin-bottom: 1rem; display: block;"></i>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">No results found for "${query}"</p>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">Try searching for</div>
                    <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                        ${['Samsung', 'Realme', 'Update', 'Review'].map(t => `<span class="suggestion-chip" onclick="SearchEngine.triggerSearch('${t}')">${t}</span>`).join('')}
                    </div>
                </div>
            `;
            return;
        }

        const categorized = {
            page: [],
            video: [],
            news: [],
            post: []
        };

        results.forEach(r => {
            const cat = categorized[r.type] || categorized.post;
            cat.push(r);
        });

        let html = '';

        for (const [type, items] of Object.entries(categorized)) {
            if (items.length === 0) continue;
            
            const label = type === 'news' ? 'NEWS' : type.toUpperCase() + 'S';
            html += `<div class="search-category-label">${label}</div>`;
            let itemsHtml = '';
            items.forEach((item, index) => {
                const isHidden = (type === 'video' && index >= 7);
                itemsHtml += `
                    <div class="search-result-item ${isHidden ? 'extra-video-result' : ''}" style="${isHidden ? 'display: none;' : ''}" onclick="SearchEngine.navigate('${item.url}', '${query}')">
                        ${item.thumbnail ? `<img src="${item.thumbnail}" class="search-thumb" onerror="this.style.display='none'">` : ''}
                        <div class="search-info">
                            <div class="search-title">${this.highlight(item.title, query)}</div>
                            <div class="search-desc">${item.desc.length > 80 ? item.desc.substring(0, 80) + '...' : item.desc}</div>
                        </div>
                        <button class="search-open-btn">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open
                        </button>
                    </div>
                `;
            });
            
            html += itemsHtml;
            
            // Add Show More button for videos if there are more than 7
            if (type === 'video' && items.length > 7) {
                html += `
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <button style="padding: 0 16px; height: 32px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: #ff0000; border: none; color: #ffffff; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);" onclick="SearchEngine.showMoreVideos(this)">
                            <i class="fa-brands fa-youtube" style="font-size: 0.9rem;"></i>
                            <span>Show More</span>
                        </button>
                    </div>
                `;
            }
        }

        container.innerHTML = html;
    },
    
    showMoreVideos(button) {
        // Find all hidden video results
        const hiddenVideos = Array.from(document.querySelectorAll('.extra-video-result')).filter(el => el.style.display === 'none');
        
        // Show the next 7
        let count = 0;
        hiddenVideos.forEach(el => {
            if (count < 7) {
                el.style.display = 'flex';
                count++;
            }
        });
        
        // Check if there are still more hidden videos left
        const remainingHidden = Array.from(document.querySelectorAll('.extra-video-result')).filter(el => el.style.display === 'none');
        if (remainingHidden.length === 0) {
            button.style.display = 'none'; // Hide the button if all are shown
        }
    },

    triggerSearch(text) {
        const input = document.getElementById('nav-search-input');
        const searchContainer = document.getElementById('search-container');
        if (input) {
            input.value = text;
            if (searchContainer) {
                searchContainer.classList.add('expanded');
            }
            input.dispatchEvent(new Event('input'));
            input.focus();
        }
    }
};

// Explicitly attach to window
window.SearchEngine = SearchEngine;

// Initial build
window.addEventListener('DOMContentLoaded', () => {
    window.SearchEngine.buildIndex();
});

