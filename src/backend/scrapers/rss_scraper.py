import feedparser
import sqlite3
import os
import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'fantasy_news.db')

FEEDS = [
    {"name": "ESPN NFL", "url": "https://www.espn.com/espn/rss/nfl/news", "type": "RSS"},
    {"name": "Yahoo Fantasy", "url": "https://sports.yahoo.com/fantasy/football/rss/", "type": "RSS"},
    {"name": "Late-Round Podcast (JJ Zachariason)", "url": "https://feeds.simplecast.com/54992523-7443-4680-9118-202353134173", "type": "Podcast"},
    {"name": "The Fantasy Footballers", "url": "https://feeds.simplecast.com/81256c61-de53-45dc-85c8-4b598a0af518", "type": "Podcast"},
    {"name": "Happy Hour (Matthew Berry)", "url": "https://rss.amperwave.net/podcasts/557/feed/index.xml", "type": "Podcast"}
]

def ensure_source_exists(cursor, name, type, url):
    cursor.execute('SELECT source_id FROM news_sources WHERE url = ?', (url,))
    result = cursor.fetchone()
    if result:
        return result[0]
    
    cursor.execute('INSERT INTO news_sources (name, type, url) VALUES (?, ?, ?)', (name, type, url))
    return cursor.lastrowid

def scrape_rss_feeds():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    total_added = 0
    
    for feed_info in FEEDS:
        print(f"Scraping {feed_info['name']}...")
        source_id = ensure_source_exists(cursor, feed_info['name'], feed_info['type'], feed_info['url'])
        
        feed = feedparser.parse(feed_info['url'])
        for entry in feed.entries:
            title = entry.title
            link = entry.link
            
            # Use summary or description if available
            content = entry.get('summary', '') or entry.get('description', '')
            
            # Parse published date if available
            published_at = datetime.datetime.now() # default
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published_at = datetime.datetime(*entry.published_parsed[:6])
                
            # Attempt to insert, ignore if URL already exists
            try:
                cursor.execute('''
                INSERT INTO news_items (source_id, url, title, content, published_at)
                VALUES (?, ?, ?, ?, ?)
                ''', (source_id, link, title, content, published_at))
                total_added += 1
            except sqlite3.IntegrityError:
                # URL already exists
                pass
                
    conn.commit()
    conn.close()
    print(f"Scraping complete. Added {total_added} new items.")

if __name__ == "__main__":
    scrape_rss_feeds()
