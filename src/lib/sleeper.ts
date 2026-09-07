export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: string;
  sport: string;
  total_rosters: number;
  roster_positions: string[];
  scoring_settings: Record<string, number>;
  settings: Record<string, number>;
  metadata: Record<string, string>;
  avatar: string | null;
  previous_league_id: string | null;
  draft_id: string | null;
}

export interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string | null;
  metadata?: {
    team_name?: string;
    avatar?: string;
    [key: string]: unknown;
  };
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  league_id: string;
  players: string[] | null;
  starters: string[] | null;
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
    division?: number;
    waiver_budget_used?: number;
    total_moves?: number;
  };
  metadata?: {
    streak?: string;
    record?: string;
    [key: string]: unknown;
  };
}

export interface SleeperMatchup {
  matchup_id: number;
  roster_id: number;
  points: number;
  starters: string[];
  starters_points: number[];
  players: string[];
  players_points?: Record<string, number>;
  custom_points?: number | null;
}

export interface SleeperNflState {
  week: number;
  season: string;
  season_type: string;
  season_start_date: string;
  display_week: number;
  league_season: string;
  leg: number;
}

export interface TeamMascotInfo {
  mascotId: string;
  emotion: string;
  showMascots: boolean;
  mascotsByWeek: Record<number, string>;
  emotionsByWeek: Record<number, string>;
}

export interface TeamSummary {
  rosterId: number;
  ownerId: string;
  teamName: string;
  ownerDisplayName: string;
  avatarUrl: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  streak: string;
  divisionId?: number;
  divisionName?: string;
  waiverBudgetRemaining: number;
  moves: number;
  starters: string[];
  players: string[];
  mascotInfo: TeamMascotInfo;
}

export interface HeadToHeadMatchup {
  matchupId: number;
  team1: {
    rosterId: number;
    team: TeamSummary;
    points: number;
    starters: string[];
    startersPoints: number[];
  };
  team2: {
    rosterId: number;
    team: TeamSummary;
    points: number;
    starters: string[];
    startersPoints: number[];
  } | null;
}

const SLEEPER_BASE_URL = "https://api.sleeper.app/v1";

/**
 * Fetch with Next.js revalidation cache (60 seconds)
 */
async function fetchSleeper<T>(endpoint: string, revalidateSeconds = 60): Promise<T> {
  const url = `${SLEEPER_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`Sleeper API Error ${res.status}: ${res.statusText} at ${endpoint}`);
  }

  return res.json() as Promise<T>;
}

export async function getLeague(leagueId: string): Promise<SleeperLeague> {
  return fetchSleeper<SleeperLeague>(`/league/${leagueId}`, 300);
}

export async function getLeagueUsers(leagueId: string): Promise<SleeperUser[]> {
  return fetchSleeper<SleeperUser[]>(`/league/${leagueId}/users`, 300);
}

export async function getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
  return fetchSleeper<SleeperRoster[]>(`/league/${leagueId}/rosters`, 60);
}

export async function getLeagueMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  return fetchSleeper<SleeperMatchup[]>(`/league/${leagueId}/matchups/${week}`, 60);
}

export async function getNflState(): Promise<SleeperNflState> {
  return fetchSleeper<SleeperNflState>(`/state/nfl`, 300);
}

export function getAvatarUrl(avatarId: string | null | undefined, isTeamAvatar = false): string {
  if (!avatarId) {
    return "https://sleepercdn.com/images/v2/icons/player_default.webp";
  }
  if (avatarId.startsWith("http")) {
    return avatarId;
  }
  if (isTeamAvatar) {
    return `https://sleepercdn.com/uploads/${avatarId}`;
  }
  return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
}

export async function getCompleteLeagueData(leagueId: string) {
  const [league, users, rosters, nflState] = await Promise.all([
    getLeague(leagueId),
    getLeagueUsers(leagueId),
    getLeagueRosters(leagueId),
    getNflState().catch(() => ({
      week: 1,
      season: "2026",
      season_type: "regular",
      season_start_date: "",
      display_week: 1,
      league_season: "2026",
      leg: 1,
    })),
  ]);

  const userMap = new Map<string, SleeperUser>();
  for (const user of users) {
    userMap.set(user.user_id, user);
  }

  const teams: TeamSummary[] = rosters.map((roster) => {
    const user = userMap.get(roster.owner_id);
    const customAvatar = user?.metadata?.avatar;
    const userAvatar = user?.avatar;
    const avatarUrl = customAvatar
      ? getAvatarUrl(customAvatar, true)
      : getAvatarUrl(userAvatar, false);

    const teamName =
      user?.metadata?.team_name?.trim() ||
      user?.display_name ||
      `Team ${roster.roster_id}`;

    const pointsFor =
      (roster.settings?.fpts ?? 0) +
      (roster.settings?.fpts_decimal ? roster.settings.fpts_decimal / 100 : 0);

    const pointsAgainst =
      (roster.settings?.fpts_against ?? 0) +
      (roster.settings?.fpts_against_decimal
        ? roster.settings.fpts_against_decimal / 100
        : 0);

    const divisionId = roster.settings?.division;
    const divisionName = divisionId
      ? league.metadata?.[`division_${divisionId}`]
      : undefined;

    const waiverBudget = league.settings?.waiver_budget ?? 100;
    const waiverBudgetUsed = roster.settings?.waiver_budget_used ?? 0;

    // Extract mascot data
    const userMeta = (user?.metadata || {}) as Record<string, string>;
    const mascotsByWeek: Record<number, string> = {};
    const emotionsByWeek: Record<number, string> = {};

    for (let w = 1; w <= 18; w++) {
      const mId = userMeta[`mascot_item_type_id_leg_${w}`];
      if (mId) mascotsByWeek[w] = mId;
      const emo = userMeta[`mascot_message_emotion_leg_${w}`];
      if (emo) emotionsByWeek[w] = emo;
    }

    const defaultMascotList = [
      "taco",
      "sharky-dududu",
      "trash",
      "panpan",
      "mr-hollywood",
      "frog-fu",
      "ref",
      "titan-up",
      "trex",
    ];
    const fallbackMascot = defaultMascotList[(roster.roster_id - 1) % defaultMascotList.length];
    const currentMascotId = mascotsByWeek[1] || Object.values(mascotsByWeek)[0] || fallbackMascot;
    const currentEmotion = emotionsByWeek[1] || "idle_happy";
    const showMascots = userMeta.show_mascots !== "off";

    const mascotInfo: TeamMascotInfo = {
      mascotId: currentMascotId,
      emotion: currentEmotion,
      showMascots,
      mascotsByWeek,
      emotionsByWeek,
    };

    return {
      rosterId: roster.roster_id,
      ownerId: roster.owner_id,
      teamName,
      ownerDisplayName: user?.display_name || `User ${roster.roster_id}`,
      avatarUrl,
      wins: roster.settings?.wins ?? 0,
      losses: roster.settings?.losses ?? 0,
      ties: roster.settings?.ties ?? 0,
      pointsFor: Number(pointsFor.toFixed(2)),
      pointsAgainst: Number(pointsAgainst.toFixed(2)),
      streak: roster.metadata?.streak || "-",
      divisionId,
      divisionName,
      waiverBudgetRemaining: Math.max(0, waiverBudget - waiverBudgetUsed),
      moves: roster.settings?.total_moves ?? 0,
      starters: roster.starters || [],
      players: roster.players || [],
      mascotInfo,
    };
  });

  // Sort standings by wins DESC, then pointsFor DESC
  teams.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  return {
    league,
    users,
    rosters,
    teams,
    nflState,
  };
}
