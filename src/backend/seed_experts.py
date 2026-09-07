import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'fantasy_news.db')

NEW_SOURCES = [
    {"name": "JJ Zachariason", "type": "Expert", "url": "https://lateround.com/", "handles": "@LateRoundQB"},
    {"name": "Dwain McFarland", "type": "Expert", "url": "https://www.fantasylife.com/", "handles": "@dwainmcfarland"},
    {"name": "Matt Harmon", "type": "Expert", "url": "https://receptionperception.com/", "handles": "@MattHarmon_BYB"},
    {"name": "Josh Norris", "type": "Expert", "url": "https://sports.yahoo.com/fantasy/", "handles": "@joshnorris"},
    {"name": "Hayden Winks", "type": "Expert", "url": "https://sports.yahoo.com/fantasy/", "handles": "@HaydenWinks"},
    {"name": "The Fantasy Footballers", "type": "Expert", "url": "https://www.thefantasyfootballers.com/", "handles": "@TheFFBallers"},
    {"name": "Matthew Berry", "type": "Expert", "url": "https://www.nbcsports.com/fantasy", "handles": "@MatthewBerryTMR"},
]

def seed_experts():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if we need to alter table to add handles
    try:
        cursor.execute("ALTER TABLE news_sources ADD COLUMN handles TEXT")
    except sqlite3.OperationalError:
        pass # Column likely exists
        
    for source in NEW_SOURCES:
        # Insert if not exists
        cursor.execute('''
            SELECT source_id FROM news_sources WHERE name = ?
        ''', (source["name"],))
        
        if not cursor.fetchone():
            cursor.execute('''
                INSERT INTO news_sources (name, type, url, handles)
                VALUES (?, ?, ?, ?)
            ''', (source["name"], source["type"], source["url"], source["handles"]))
            print(f"Added expert source: {source['name']}")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_experts()
