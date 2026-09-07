import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'fantasy_news.db')

def get_connection():
    return sqlite3.connect(DB_PATH)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create Players Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS players (
        player_id TEXT PRIMARY KEY,
        name TEXT,
        team TEXT,
        position TEXT
    )
    ''')
    
    # Create News Sources Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS news_sources (
        source_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        type TEXT,
        url TEXT
    )
    ''')
    
    # Create News Items Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS news_items (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER,
        url TEXT UNIQUE,
        title TEXT,
        content TEXT,
        published_at DATETIME,
        FOREIGN KEY (source_id) REFERENCES news_sources (source_id)
    )
    ''')
    
    # Create Player Sentiment Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS player_sentiments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER,
        player_id TEXT,
        sentiment_score REAL,
        sentiment_label TEXT,
        FOREIGN KEY (item_id) REFERENCES news_items (item_id),
        FOREIGN KEY (player_id) REFERENCES players (player_id)
    )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")

if __name__ == "__main__":
    init_db()
