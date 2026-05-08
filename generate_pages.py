import os
import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

os.makedirs('js', exist_ok=True)

html = read_file('index.html')

# Extract common parts
header_match = re.search(r'(<header class="glass-header" id="main-header">.*?</header>)', html, re.DOTALL)
header_html = header_match.group(1) if header_match else ""

nav_match = re.search(r'(<nav class="bottom-nav">.*?</nav>)', html, re.DOTALL)
nav_html = nav_match.group(1) if nav_match else ""

head_match = re.search(r'(<head>.*?</head>)', html, re.DOTALL)
head_html = head_match.group(1) if head_match else ""

# Replace links in nav_html to point to actual pages
nav_html = nav_html.replace('href="#home"', 'href="index.html"')
nav_html = nav_html.replace('href="#videos"', 'href="videos.html"')
nav_html = nav_html.replace('id="nav-news-btn"', 'href="news.html" id="nav-news-btn"')
nav_html = nav_html.replace('href="javascript:void(0)" class="nav-item" id="nav-news-btn"', 'href="news.html" class="nav-item" id="nav-news-btn"')



# Extract sections
def get_section(html, section_id):
    pattern = r'(<section id="' + section_id + r'".*?</section>)'
    match = re.search(pattern, html, re.DOTALL)
    return match.group(1) if match else ""

home_sec = get_section(html, 'home')
links_sec = get_section(html, 'links')
videos_sec = get_section(html, 'videos')
news_sec = get_section(html, 'news')
support_sec = get_section(html, 'support')

# Common template generator
def make_page(title, body_content, extra_scripts=""):
    return f"""<!DOCTYPE html>
<html lang="en">
{head_html.replace('<title>Smartify Tech - Be Smart By Tech</title>', f'<title>{title} | Smartify Tech</title>')}
<body>
    {header_html}
    {nav_html}
    <main style="padding-bottom: 100px;">
        {body_content}
    </main>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js"></script>
    <script src="js/nav.js"></script>
    {extra_scripts}
</body>
</html>"""

# index.html
index_body = home_sec + "\n" + links_sec + "\n" + support_sec
write_file('index.html', make_page("Home", index_body, '<script src="js/youtube.js"></script>'))

# videos.html
videos_body = videos_sec
# need to add latest videos to videos page as well? The user said "Show all YouTube videos in responsive card layout". I will put latest videos + videos grid.
# Oh, latest videos are in home_sec in the original. Let's just put the main videos grid.
write_file('videos.html', make_page("Videos", videos_sec, '<script src="js/youtube.js"></script>'))

# news.html
news_body = news_sec
write_file('news.html', make_page("News", news_body, '<script src="js/news.js"></script>'))

# search.html
search_body = """
<section class="section">
    <h2 class="section-title">Search</h2>
    <div class="glass-card" style="padding: 2rem; text-align: center;">
        <input type="text" id="main-search-input" placeholder="Search videos, news, articles..." style="width: 100%; max-width: 600px; padding: 1rem; border-radius: 50px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.2); color: white; font-size: 1.2rem; outline: none; text-align: center; backdrop-filter: blur(10px);">
        <div id="search-results" style="margin-top: 2rem; display: grid; gap: 1.5rem; text-align: left;"></div>
    </div>
</section>
"""
write_file('search.html', make_page("Search", search_body, '<script src="js/search.js"></script>'))





print("HTML generation complete.")
