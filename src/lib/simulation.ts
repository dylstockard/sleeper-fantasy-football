export interface GameEvent {
  id: string;
  timestamp: number; // minutes elapsed in the game (0 to 60)
  description: string;
  teamId: string;
  pointsAddedTeamA: number;
  pointsAddedTeamB: number;
  type: 'TOUCHDOWN' | 'FIELD_GOAL' | 'INTERCEPTION' | 'FUMBLE' | 'BIG_PLAY' | 'SAFETY';
}

export interface SimulatedGame {
  teamA: { id: string; name: string };
  teamB: { id: string; name: string };
  events: GameEvent[];
}

export function simulateGame(teamA: {id: string, name: string}, teamB: {id: string, name: string}): SimulatedGame {
  const events: GameEvent[] = [];
  const totalMinutes = 60;
  
  // Create 10 to 20 random events
  const numEvents = Math.floor(Math.random() * 11) + 10;
  
  const eventTypes = ['TOUCHDOWN', 'FIELD_GOAL', 'INTERCEPTION', 'FUMBLE', 'BIG_PLAY'];
  
  for (let i = 0; i < numEvents; i++) {
    const timestamp = Math.floor(Math.random() * totalMinutes);
    const isTeamA = Math.random() > 0.5;
    const team = isTeamA ? teamA : teamB;
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)] as GameEvent['type'];
    
    let pointsA = 0;
    let pointsB = 0;
    let description = '';
    
    switch (type) {
      case 'TOUCHDOWN':
        if (isTeamA) pointsA += 7; else pointsB += 7;
        description = `${team.name} scores a Touchdown!`;
        break;
      case 'FIELD_GOAL':
        if (isTeamA) pointsA += 3; else pointsB += 3;
        description = `${team.name} kicks a Field Goal.`;
        break;
      case 'INTERCEPTION':
        description = `${team.name} throws an Interception.`;
        break;
      case 'FUMBLE':
        description = `${team.name} fumbles the ball.`;
        break;
      case 'BIG_PLAY':
        description = `${team.name} makes a 40-yard play!`;
        break;
    }
    
    events.push({
      id: Math.random().toString(36).substring(7) + i,
      timestamp,
      description,
      teamId: team.id,
      pointsAddedTeamA: pointsA,
      pointsAddedTeamB: pointsB,
      type
    });
  }
  
  // Sort events by timestamp
  events.sort((a, b) => a.timestamp - b.timestamp);
  
  return {
    teamA,
    teamB,
    events
  };
}
