from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI(title="Fantasy Football News API")

# Allow Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), 'fantasy_news.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Models
class NewsItem(BaseModel):
    item_id: int
    title: str
    url: str
    published_at: str
    source_name: str
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None

class PlayerNews(BaseModel):
    player_id: str
    name: str
    news: List[NewsItem]

@app.get("/api/players/{player_id}/news", response_model=PlayerNews)
def get_player_news(player_id: str):
    conn = get_db_connection()
    
    # Get player info
    player = conn.execute('SELECT name FROM players WHERE player_id = ?', (player_id,)).fetchone()
    if not player:
        conn.close()
        raise HTTPException(status_code=404, detail="Player not found")
        
    # Get news and sentiment for this player
    cursor = conn.execute('''
        SELECT n.item_id, n.title, n.url, n.published_at, s.name as source_name, 
               ps.sentiment_score, ps.sentiment_label
        FROM player_sentiments ps
        JOIN news_items n ON ps.item_id = n.item_id
        JOIN news_sources s ON n.source_id = s.source_id
        WHERE ps.player_id = ?
        ORDER BY n.published_at DESC
        LIMIT 20
    ''', (player_id,))
    
    news_list = []
    for row in cursor.fetchall():
        news_list.append(NewsItem(
            item_id=row['item_id'],
            title=row['title'],
            url=row['url'],
            published_at=row['published_at'],
            source_name=row['source_name'],
            sentiment_score=row['sentiment_score'],
            sentiment_label=row['sentiment_label']
        ))
        
    conn.close()
    return PlayerNews(player_id=player_id, name=player['name'], news=news_list)

@app.get("/api/feed")
def get_user_feed(player_ids: Optional[str] = None):
    """
    Returns a global feed of all recent analyzed news.
    If player_ids is provided (comma separated), filters to only those players.
    """
    conn = get_db_connection()
    
    query = '''
        SELECT n.item_id, n.title, n.url, n.published_at, s.name as source_name,
               p.player_id, p.name as player_name,
               ps.sentiment_score, ps.sentiment_label
        FROM player_sentiments ps
        JOIN news_items n ON ps.item_id = n.item_id
        JOIN news_sources s ON n.source_id = s.source_id
        JOIN players p ON ps.player_id = p.player_id
    '''
    
    params = []
    if player_ids:
        pid_list = [pid.strip() for pid in player_ids.split(",") if pid.strip()]
        if pid_list:
            placeholders = ",".join("?" * len(pid_list))
            query += f" WHERE ps.player_id IN ({placeholders})"
            params.extend(pid_list)
            
    query += " ORDER BY n.published_at DESC LIMIT 50"
    
    cursor = conn.execute(query, params)
    
    feed = []
    for row in cursor.fetchall():
        feed.append(dict(row))
        
    conn.close()
    return feed

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
