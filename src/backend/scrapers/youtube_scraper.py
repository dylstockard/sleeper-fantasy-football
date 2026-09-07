import os
import sqlite3
import datetime
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'fantasy_news.db')

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Mapping of Expert Name to their YouTube Channel ID
YOUTUBE_CHANNELS = {
    "The Fantasy Footballers": "UC-No2ITxJsNt50oJQ3fLmUA",
    "Late-Round Podcast (JJ Zachariason)": "UCK5szBUaJMnuCViD6alvuXg",
    "Dwain McFarland": "UCV6zM8Y1cXCfZg3tAkGibXg",
    "Matt Harmon": "UCvqWpJ9iMAfu4aOGvAn85lw",
    "Josh Norris & Hayden Winks": "UC7fnz7139CGSdtHWaPMCpIw",
    "Matthew Berry": "UCkLjLsEpv4yuz_8-5RCDJaQ"
}

def ensure_source_exists(cursor, name, type, url):
    cursor.execute('SELECT source_id FROM news_sources WHERE name = ?', (name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    
    cursor.execute('INSERT INTO news_sources (name, type, url) VALUES (?, ?, ?)', (name, type, url))
    return cursor.lastrowid

def scrape_youtube():
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
        print("Skipping YouTube scraper: No API key found in .env")
        return
        
    print("Scraping YouTube channels via API...")
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    total_added = 0
    
    for expert_name, channel_id in YOUTUBE_CHANNELS.items():
        try:
            # Fetch latest 5 videos from channel
            request = youtube.search().list(
                part="snippet",
                channelId=channel_id,
                order="date",
                maxResults=5
            )
            response = request.execute()
            
            source_id = ensure_source_exists(cursor, expert_name, "YouTube", f"https://www.youtube.com/channel/{channel_id}")
            
            for item in response.get('items', []):
                if item['id']['kind'] == "youtube#video":
                    video_id = item['id']['videoId']
                    title = item['snippet']['title']
                    description = item['snippet']['description']
                    url = f"https://www.youtube.com/watch?v={video_id}"
                    
                    published_str = item['snippet']['publishedAt'] # e.g. 2026-09-06T18:00:00Z
                    published_at = datetime.datetime.fromisoformat(published_str.replace('Z', '+00:00'))
                    
                    try:
                        cursor.execute('''
                        INSERT INTO news_items (source_id, url, title, content, published_at)
                        VALUES (?, ?, ?, ?, ?)
                        ''', (source_id, url, title, description, published_at))
                        total_added += 1
                    except sqlite3.IntegrityError:
                        # Video already exists
                        pass
        except Exception as e:
            print(f"Failed to scrape YouTube for {expert_name}: {e}")
            
    conn.commit()
    conn.close()
    print(f"YouTube scraping complete. Added {total_added} new items.")

if __name__ == "__main__":
    scrape_youtube()
