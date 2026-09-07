import os
import sqlite3
import datetime
import tweepy
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'fantasy_news.db')

TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")

# Mapping of Expert Name to their Twitter Handle (without @)
TWITTER_HANDLES = {
    "JJ Zachariason": "LateRoundQB",
    "Dwain McFarland": "dwainmcfarland",
    "Matt Harmon": "MattHarmon_BYB",
    "Josh Norris": "joshnorris",
    "Hayden Winks": "HaydenWinks",
    "Matthew Berry": "MatthewBerryTMR"
}

def ensure_source_exists(cursor, name, type, url):
    cursor.execute('SELECT source_id FROM news_sources WHERE name = ?', (name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    
    cursor.execute('INSERT INTO news_sources (name, type, url) VALUES (?, ?, ?)', (name, type, url))
    return cursor.lastrowid

def scrape_twitter():
    if not TWITTER_BEARER_TOKEN or TWITTER_BEARER_TOKEN == "YOUR_TWITTER_BEARER_TOKEN_HERE":
        print("Skipping Twitter scraper: No Bearer Token found in .env")
        return
        
    print("Scraping Twitter via Tweepy API v2...")
    client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    total_added = 0
    
    for expert_name, handle in TWITTER_HANDLES.items():
        try:
            # 1. Get user ID from handle
            user_res = client.get_user(username=handle)
            if not user_res.data:
                continue
                
            user_id = user_res.data.id
            
            # 2. Get recent tweets
            tweets_res = client.get_users_tweets(id=user_id, max_results=10, tweet_fields=["created_at"])
            
            if not tweets_res.data:
                continue
                
            source_id = ensure_source_exists(cursor, expert_name, "Twitter", f"https://twitter.com/{handle}")
            
            for tweet in tweets_res.data:
                url = f"https://twitter.com/{handle}/status/{tweet.id}"
                title = f"Tweet by @{handle}"
                content = tweet.text
                published_at = tweet.created_at # datetime object
                
                try:
                    cursor.execute('''
                    INSERT INTO news_items (source_id, url, title, content, published_at)
                    VALUES (?, ?, ?, ?, ?)
                    ''', (source_id, url, title, content, published_at))
                    total_added += 1
                except sqlite3.IntegrityError:
                    # Tweet already exists
                    pass
        except Exception as e:
            print(f"Failed to scrape Twitter for @{handle}: {e}")
            
    conn.commit()
    conn.close()
    print(f"Twitter scraping complete. Added {total_added} new tweets.")

if __name__ == "__main__":
    scrape_twitter()
