import requests
import sqlite3
import os
import sys

DB_PATH = os.path.join(os.path.dirname(__file__), 'fantasy_news.db')

def sync_players():
    print("Fetching players from Sleeper API...")
    try:
        response = requests.get("https://api.sleeper.app/v1/players/nfl")
        response.raise_for_status()
        players_data = response.json()
    except Exception as e:
        print(f"Failed to fetch players: {e}")
        sys.exit(1)
        
    print(f"Found {len(players_data)} players. Updating database...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # We'll do an UPSERT (INSERT OR REPLACE)
    count = 0
    for player_id, p in players_data.items():
        # Only care about active NFL players for fantasy (QB, RB, WR, TE, K, DEF)
        position = p.get('position')
        # Some defenses have position = 'DEF', some players have None position
        if position not in ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']:
            continue
            
        # Defense handling
        if position == 'DEF':
            name = f"{p.get('first_name', '')} {p.get('last_name', '')}".strip()
            if not name:
                name = p.get('team') or player_id
        else:
            name = p.get('full_name') or f"{p.get('first_name', '')} {p.get('last_name', '')}".strip()
            
        team = p.get('team')
        
        cursor.execute('''
        INSERT INTO players (player_id, name, team, position)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(player_id) DO UPDATE SET
            name=excluded.name,
            team=excluded.team,
            position=excluded.position
        ''', (player_id, name, team, position))
        
        count += 1
        
    conn.commit()
    conn.close()
    print(f"Successfully synced {count} relevant fantasy players to the database.")

if __name__ == "__main__":
    sync_players()
