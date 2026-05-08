// js/youtube.js

const API_KEY = "AIzaSyAoGz7Soi42cMatLmjI5uM5TvWcVQE3luw";
const CHANNEL_ID = "UCt5RPQ9wFmTsU1ZH-OemLfw";

function animateValue(id, start, end, duration) {
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
        } else {
            obj.innerHTML = formatNumber(end);
        }
    };
    window.requestAnimationFrame(step);
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

async function fetchYouTubeStats() {
    try {
        const fetchUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
        const response = await fetch(fetchUrl);
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
    const latestVideosGrid = document.getElementById("latest-videos-grid");
    
    // Use existing skeletons if present
    if (videosContainer && !videosContainer.querySelector('.skeleton')) {
        videosContainer.innerHTML = '<div class="loader">Loading...</div>';
    }
    
    try {
        const adminPosts = JSON.parse(localStorage.getItem('admin_posts')) || [];
        const adminVideos = adminPosts.filter(p => p.type === 'video');

        const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU');
        const fetchUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${API_KEY}`;
        const response = await fetch(fetchUrl);
        const data = await response.json();
        
        if (videosContainer) videosContainer.innerHTML = '';
        if (latestVideosGrid) latestVideosGrid.innerHTML = '';
        
        // Merge Admin Videos + Live Videos
        let allVideos = [...adminVideos.map(v => ({
            id: v.ytId || 'custom',
            title: v.title,
            thumb: v.thumb,
            date: v.date,
            views: 'N/A',
            likes: 'N/A',
            isExternal: true,
            url: v.ytId ? `https://www.youtube.com/watch?v=${v.ytId}` : '#'
        }))];

        if (data.items && data.items.length > 0) {
            const videoIds = data.items.map(item => item.snippet.resourceId.videoId).join(',');
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
            const statsResponse = await fetch(statsUrl);
            const statsData = await statsResponse.json();
            
            const statsMap = {};
            if (statsData.items) {
                statsData.items.forEach(item => {
                    statsMap[item.id] = item.statistics;
                });
            }

            data.items.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                const stats = statsMap[videoId] || {};
                allVideos.push({
                    id: videoId,
                    title: item.snippet.title,
                    // Reduced thumbnail quality for better performance (medium instead of high)
                    thumb: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : item.snippet.thumbnails.default.url,
                    date: new Date(item.snippet.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    views: stats.viewCount ? formatNumber(parseInt(stats.viewCount)) : '0',
                    likes: stats.likeCount ? formatNumber(parseInt(stats.likeCount)) : '0',
                    isExternal: false,
                    url: `https://www.youtube.com/watch?v=${videoId}`
                });
            });
        }
        
        // Cache for search
        sessionStorage.setItem('youtube_data', JSON.stringify(allVideos));
        if (window.SearchEngine) SearchEngine.buildIndex();

        if (allVideos.length > 0) {
            // Render Latest Videos (Up to 6) for home page
            let count = 0;
            allVideos.forEach(video => {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = video.title;
                const decodedTitle = tempDiv.textContent || tempDiv.innerText || "";
                
                if (count < 6 && latestVideosGrid) {
                    const card = document.createElement("div");
                    card.className = "glass-card tilt-element";
                    card.style.cursor = "pointer";
                    card.style.display = "flex";
                    card.style.flexDirection = "column";
                    card.onclick = () => window.open(video.url, '_blank');
                    
                    card.innerHTML = `
                        <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: rgba(0,0,0,0.2);">
                            ${count === 0 ? '<div class="latest-badge" style="position: absolute; top: 10px; left: 10px; background: #ff0000; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; z-index: 2;">Latest</div>' : ''}
                            <img src="${video.thumb}" alt="${decodedTitle}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px 8px 0 0;">
                        </div>
                        <div style="padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <h3 style="font-size: 1rem; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--text-primary);">${decodedTitle}</h3>
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                                    <i class="fa-regular fa-clock" style="font-size: 0.8rem; color: var(--text-secondary);"></i>
                                    <span style="font-size: 0.85rem; color: var(--text-secondary);">${video.date}</span>
                                </div>
                            </div>
                            <div class="glass-btn" style="width: 100%; text-align: center; padding: 0.6rem; font-size: 0.85rem; font-weight: 600; background: rgba(255,255,255,0.05); border-radius: 8px;">
                                <i class="fa-brands fa-youtube" style="color: #ff0000; margin-right: 5px;"></i> Watch Now
                            </div>
                        </div>
                    `;
                    latestVideosGrid.appendChild(card);
                }
                count++;
            });

            // Pagination for All Videos
            let visibleCount = 15;
            const batchSize = 20;
            let currentBrand = 'all'; // Track active brand

            function renderAllVideos() {
                if (videosContainer) videosContainer.innerHTML = '';
                
                // Brand Keywords Mapping for smarter filtering
                const brandKeywords = {
                    'realme': ['realme', 'realme ui'],
                    'oppo': ['oppo', 'coloros', 'color os'],
                    'oneplus': ['oneplus', 'oxygenos', 'oxygen os'],
                    'vivo': ['vivo', 'originos', 'origin os'],
                    'samsung': ['samsung', 'oneui', 'one ui'],
                    'xiaomi': ['xiaomi', 'miui', 'hyperos', 'hyper os', 'mi ', 'redmi', 'poco'],
                    'apple': ['apple', 'ios', 'iphone']
                };

                // Filter videos by title based on currentBrand and keywords
                const filteredVideos = currentBrand === 'all' ? allVideos : allVideos.filter(v => {
                    const title = v.title.toLowerCase();
                    const keywords = brandKeywords[currentBrand.toLowerCase()] || [currentBrand.toLowerCase()];
                    return keywords.some(keyword => title.includes(keyword));
                });
                
                // Handle Empty State (Coming Soon)
                if (filteredVideos.length === 0) {
                    if (videosContainer) {
                        videosContainer.innerHTML = `
                            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                                <div style="width: 120px; height: 120px; background: rgba(255,255,255,0.02); border-radius: 60px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                                    <i class="fa-solid fa-hourglass-half" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.5;"></i>
                                </div>
                                <h3 style="font-size: 1.5rem; color: var(--text-primary); margin-top: 1rem;">Coming Soon</h3>
                                <p style="color: var(--text-secondary); max-width: 400px; font-size: 0.9rem;">We haven't uploaded any videos for this category yet. Stay tuned!</p>
                            </div>
                        `;
                    }
                    
                    // Hide show more button when empty
                    const showMoreContainer = document.getElementById('show-more-container');
                    if (showMoreContainer) showMoreContainer.style.display = 'none';
                    return;
                }
                
                const videosToDisplay = filteredVideos.slice(0, visibleCount);
                
                videosToDisplay.forEach(video => {
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = video.title;
                    const decodedTitle = tempDiv.textContent || tempDiv.innerText || "";
                    
                    if (videosContainer) {
                        const card = document.createElement("div");
                        card.className = "glass-card video-card tilt-element";
                        card.style.cursor = "pointer";
                        card.onclick = () => window.open(video.url, '_blank');
                        
                        card.innerHTML = `
                            <img src="${video.thumb}" alt="${decodedTitle}" class="video-thumbnail">
                            <div class="video-info">
                                <h3 style="margin-bottom: 0.5rem;">${decodedTitle}</h3>
                                <div style="display: flex; gap: 15px; font-size: 0.85rem; color: var(--text-secondary); align-items: center;">
                                    <span>${video.date}</span>
                                    <span><i class="fa-solid fa-eye" style="margin-right: 4px;"></i>${video.views}</span>
                                    <span><i class="fa-solid fa-thumbs-up" style="margin-right: 4px;"></i>${video.likes}</span>
                                </div>
                            </div>
                        `;
                        videosContainer.appendChild(card);
                    }
                });

                // Handle Show More Button
                const showMoreBtn = document.getElementById('show-more-btn');
                const showMoreContainer = document.getElementById('show-more-container');
                
                if (showMoreContainer && showMoreBtn) {
                    showMoreContainer.style.display = 'block';
                    
                    if (visibleCount < filteredVideos.length) {
                        showMoreBtn.innerHTML = `<i class="fa-brands fa-youtube" style="font-size: 1.1rem;"></i> <span>Show More</span>`;
                        showMoreBtn.onclick = () => {
                            visibleCount += batchSize;
                            renderAllVideos();
                        };
                    } else {
                        showMoreBtn.innerHTML = `<i class="fa-brands fa-youtube" style="font-size: 1.1rem;"></i> <span>Open YouTube</span>`;
                        showMoreBtn.onclick = () => {
                            window.open(`https://www.youtube.com/channel/${CHANNEL_ID}`, '_blank');
                        };
                    }
                }

                // Re-initialize Tilt
                if(typeof VanillaTilt !== 'undefined') {
                    VanillaTilt.init(document.querySelectorAll(".video-card"), {
                        max: 1, speed: 400, gyroscope: false, glare: true, "max-glare": 0.1, gyroscope: false});
                }
            }

            renderAllVideos();

            // Handle Video Tab Clicks
            const videoTabs = document.querySelectorAll('.video-tab');
            videoTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    videoTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    currentBrand = tab.getAttribute('data-brand');
                    visibleCount = 15; // Reset count
                    renderAllVideos();
                });
            });

        } else {
            if (videosContainer) videosContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No videos found.</p>';
        }
    } catch (e) {
        console.error("Error fetching videos:", e);
        if (videosContainer) videosContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Connection error.</p>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchYouTubeStats();
    fetchYouTubeVideos();
    
    // Admin posts for index page
    const postsContainer = document.getElementById("posts-container");
    if (postsContainer) {
        const posts = JSON.parse(localStorage.getItem('admin_posts')) || [];
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%;">No posts available yet.</p>';
        } else {
        if (postsContainer) postsContainer.innerHTML = '';
            posts.forEach(post => {
                const card = document.createElement("div");
                card.className = "glass-card post-card tilt-element";
                let ytHtml = '';
                if(post.ytId) {
                    ytHtml = `<div class="post-yt-preview" onclick="window.open('https://www.youtube.com/watch?v=${post.ytId}', '_blank')">
                        <img src="https://img.youtube.com/vi/${post.ytId}/hqdefault.jpg" alt="Video Preview">
                        <div class="play-btn"><i class="fa-solid fa-play"></i></div>
                    </div>`;
                }
                card.innerHTML = `
                    <img src="${post.thumb}" alt="Post Thumbnail" class="post-image">
                    <div class="post-content">
                        <div class="post-date"><i class="fa-regular fa-calendar"></i> ${post.date}</div>
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-desc">${post.desc}</p>
                        ${ytHtml}
                    </div>
                `;
                postsContainer.appendChild(card);
            });
            if(typeof VanillaTilt !== 'undefined') {
                VanillaTilt.init(document.querySelectorAll(".post-card"), {
                    max: 1, speed: 400, gyroscope: false, glare: true, "max-glare": 0.1, gyroscope: false});
            }
        }
    }
});



