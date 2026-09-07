import sqlite3
import os
import re
import json
from dotenv import load_dotenv
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from openai import OpenAI

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), 'fantasy_news.db')
OLLAMA_URL = os.getenv("OLLAMA_URL") # e.g. http://192.168.1.50:11434/v1
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1") # default to llama3.1

def load_players(cursor):
    cursor.execute('SELECT player_id, name, team FROM players')
    players = []
    for row in cursor.fetchall():
        if row[1] and len(row[1]) > 2:
            players.append({"id": row[0], "name": row[1], "team": row[2]})
    return players

def analyze_with_llm(client, text, players_context):
    prompt = f"""
    You are an expert fantasy football analyst. Analyze the following news text.
    Extract the players mentioned in the text (even by nickname or surname) and determine the fantasy football sentiment for EACH player individually.
    
    News Text: "{text}"
    
    Here is a list of known active players (ID, Name, Team) to help you match:
    {players_context}
    
    Respond STRICTLY in JSON format with an array of objects. Do not include markdown formatting or backticks.
    Format:
    [
      {{
        "player_id": "string",
        "sentiment_score": float (-1.0 to 1.0),
        "sentiment_label": "POSITIVE" | "NEGATIVE" | "NEUTRAL"
      }}
    ]
    """
    
    try:
        response = client.chat.completions.create(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        # Ensure we just parse the array
        data = json.loads(content)
        if isinstance(data, dict) and "players" in data:
            return data["players"]
        elif isinstance(data, list):
            return data
        return []
    except Exception as e:
        print(f"LLM parsing failed: {e}")
        return []

def analyze_news():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    players = load_players(cursor)
    
    cursor.execute('''
    SELECT item_id, title, content FROM news_items
    WHERE item_id NOT IN (SELECT item_id FROM player_sentiments)
    ''')
    
    items = cursor.fetchall()
    added_sentiments = 0
    
    # Initialize engines
    llm_client = None
    analyzer = None
    if OLLAMA_URL:
        print(f"Using Local LLM at {OLLAMA_URL} with model {OLLAMA_MODEL}")
        llm_client = OpenAI(base_url=OLLAMA_URL, api_key="ollama")
    else:
        print("Using VADER Fallback (No OLLAMA_URL provided in .env)")
        analyzer = SentimentIntensityAnalyzer()
    
    for item_id, title, content in items:
        text = f"{title}. {content}"
        
        if llm_client:
            # We must be careful not to send all 4000 players in context (too many tokens).
            # We will use naive regex just to PRE-FILTER the players sent to the LLM context.
            # To catch surnames/nicknames, we could split the text, but for now we'll send a subset
            # of players whose last name appears in the text.
            words = set(re.findall(r'\b\w+\b', text))
            possible_players = [p for p in players if any(w in words for w in p['name'].split())]
            
            if not possible_players:
                continue
                
            context = "\n".join([f"{p['id']}: {p['name']} ({p['team']})" for p in possible_players])
            
            results = analyze_with_llm(llm_client, text, context)
            
            for res in results:
                try:
                    cursor.execute('''
                    INSERT INTO player_sentiments (item_id, player_id, sentiment_score, sentiment_label)
                    VALUES (?, ?, ?, ?)
                    ''', (item_id, res.get("player_id"), res.get("sentiment_score", 0), res.get("sentiment_label", "NEUTRAL")))
                    added_sentiments += 1
                except Exception as e:
                    print(f"Error inserting LLM result: {e}")
                    
        else:
            # VADER FALLBACK
            matched_players = []
            for p in players:
                pattern = r'\b' + re.escape(p['name']) + r'\b'
                if re.search(pattern, text, re.IGNORECASE):
                    matched_players.append(p)
                    
            if not matched_players:
                continue
                
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
