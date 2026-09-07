import sqlite3
import os
import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

DB_PATH = os.path.join(os.path.dirname(__file__), 'fantasy_news.db')

def load_players(cursor):
    cursor.execute('SELECT player_id, name, team FROM players')
    players = []
    for row in cursor.fetchall():
        # Only consider players with valid names
        if row[1] and len(row[1]) > 2:
            players.append({"id": row[0], "name": row[1], "team": row[2]})
    return players

def analyze_news():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    analyzer = SentimentIntensityAnalyzer()
    players = load_players(cursor)
    
    # Pre-compile a dict for fast lookup? For now, we'll iterate.
    # To avoid matching "Brown" (common word) we should be careful, 
    # but for simplicity we will match full names.
    
    # Get unanalyzed news items
    # For simplicity, we just analyze items that don't have sentiments yet,
    # or just analyze all items for now. Let's find items not in player_sentiments.
    cursor.execute('''
    SELECT item_id, title, content FROM news_items
    WHERE item_id NOT IN (SELECT item_id FROM player_sentiments)
    ''')
    
    items = cursor.fetchall()
    
    added_sentiments = 0
    
    for item_id, title, content in items:
        text = f"{title}. {content}"
        
        # Super basic entity extraction: check if player full name is in text
        # This is slow and naive, but works for PoC
        matched_players = []
        for p in players:
            # use word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(p['name']) + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                matched_players.append(p)
                
        if not matched_players:
            continue
            
        # Get sentiment
        scores = analyzer.polarity_scores(text)
        compound = scores['compound']
        
        if compound >= 0.05:
            label = "POSITIVE"
        elif compound <= -0.05:
            label = "NEGATIVE"
        else:
            label = "NEUTRAL"
            
        for p in matched_players:
            cursor.execute('''
            INSERT INTO player_sentiments (item_id, player_id, sentiment_score, sentiment_label)
            VALUES (?, ?, ?, ?)
            ''', (item_id, p['id'], compound, label))
            added_sentiments += 1
            
    conn.commit()
    conn.close()
    print(f"Analyzed {len(items)} news items. Extracted {added_sentiments} player sentiments.")

if __name__ == "__main__":
    analyze_news()
