import os
import sys

# Add backend to path so we can import modules
sys.path.append(os.path.dirname(__file__))

from scrapers.rss_scraper import scrape_rss_feeds
from scrapers.youtube_scraper import scrape_youtube
from scrapers.twitter_scraper import scrape_twitter
from analyze_sentiment import analyze_news
from sync_players import sync_players
from db import init_db

def run_pipeline():
    print("--- Starting Fantasy Football News Pipeline ---")
    
    # 1. Ensure DB is initialized
    print("\n[1/4] Checking database schema...")
    init_db()
    
    # 2. Sync players (optional to do every time, but good for completeness, maybe we do this daily in production)
    print("\n[2/4] Syncing latest player data from Sleeper...")
    sync_players()
    
    # 3. Scrape news
    print("\n[3/4] Scraping all sources for news...")
    scrape_rss_feeds()
    scrape_youtube()
    scrape_twitter()
    
    # 4. Analyze sentiment
    print("\n[4/4] Analyzing sentiment of new articles...")
    analyze_news()
    
    print("\n--- Pipeline Complete ---")

if __name__ == "__main__":
    run_pipeline()
