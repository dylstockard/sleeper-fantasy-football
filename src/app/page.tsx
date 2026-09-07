"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import {
  Trophy,
  Users,
  Swords,
  Shield,
  Search,
  Flame,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type {
  SleeperLeague,
  SleeperUser,
  TeamSummary,
  SleeperMatchup,
  SleeperNflState,
} from "@/lib/sleeper";
import { Mascot, type MascotEmotion } from "@/components/Mascot";
import { NewsFeed } from "@/components/NewsFeed";

const DEFAULT_LEAGUE_ID = "1365771765128663040";

export default function Home() {
  const [leagueId, setLeagueId] = useState(DEFAULT_LEAGUE_ID);
  const [inputLeagueId, setInputLeagueId] = useState(DEFAULT_LEAGUE_ID);
  const [activeTab, setActiveTab] = useState<
    "standings" | "matchups" | "mascots" | "rosters" | "rules" | "news"
  >("standings");

  // Mascot global visibility toggle
  const [showMascotsGlobal, setShowMascotsGlobal] = useState(true);

  // Mascot showcase interactive state
  const [showcaseEmotion, setShowcaseEmotion] = useState<MascotEmotion>("idle_happy");

  // League data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [league, setLeague] = useState<SleeperLeague | null>(null);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [nflState, setNflState] = useState<SleeperNflState | null>(null);

  // Matchups state
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [matchupsLoading, setMatchupsLoading] = useState(false);
  const [matchups, setMatchups] = useState<SleeperMatchup[]>([]);

  const [, startTransition] = useTransition();

  // Fetch complete league data
  const fetchLeague = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/league?id=${id}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setLeague(data.league);
      setTeams(data.teams);
      setNflState(data.nflState);
      if (data.nflState?.week) {
        setSelectedWeek(Math.min(Math.max(data.nflState.week, 1), 18));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load league");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeague(leagueId);
  }, [leagueId]);

  // Fetch matchups when week changes or league changes
  useEffect(() => {
    if (!leagueId) return;
    let isCancelled = false;
    setMatchupsLoading(true);

    fetch(`/api/matchups?leagueId=${leagueId}&week=${selectedWeek}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isCancelled) {
          setMatchups(data.matchups || []);
          setMatchupsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setMatchups([]);
          setMatchupsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [leagueId, selectedWeek]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLeagueId.trim() && inputLeagueId.trim() !== leagueId) {
      startTransition(() => {
        setLeagueId(inputLeagueId.trim());
      });
    }
  };

  // Group matchups by matchup_id
  const matchupPairs: {
    id: number;
    teams: { matchup: SleeperMatchup; team: TeamSummary | undefined }[];
  }[] = [];
  const matchupMap = new Map<
    number,
    { matchup: SleeperMatchup; team: TeamSummary | undefined }[]
  >();

  for (const m of matchups) {
    if (!m.matchup_id) continue;
    const teamObj = teams.find((t) => t.rosterId === m.roster_id);
    if (!matchupMap.has(m.matchup_id)) {
      matchupMap.set(m.matchup_id, []);
    }
    matchupMap.get(m.matchup_id)?.push({ matchup: m, team: teamObj });
  }

  for (const [id, teamList] of matchupMap.entries()) {
    matchupPairs.push({ id, teams: teamList });
  }

  const playoffTeamsCount = league?.settings?.playoff_teams || 6;

  return (
    <div className="min-h-screen bg-[#090e1a] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#1b2a47] bg-[#0d1629]/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Sleeper Fantasy UI</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                Vercel Ready
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mascot Toggle Button */}
            <button
              onClick={() => setShowMascotsGlobal(!showMascotsGlobal)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 shadow-sm ${
                showMascotsGlobal
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
              title="Toggle classic animated Sleeper Mascots"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Mascots:</span>
              <span>{showMascotsGlobal ? "ON" : "OFF"}</span>
            </button>

            {/* League ID search / switcher */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputLeagueId}
                  onChange={(e) => setInputLeagueId(e.target.value)}
                  placeholder="Enter League ID"
                  className="bg-[#121f38] text-sm text-slate-200 pl-9 pr-3 py-1.5 rounded-lg border border-[#20365e] focus:outline-none focus:border-teal-400 w-32 sm:w-56 transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-teal-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Load</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Fetching league info from Sleeper API...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <Shield className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-red-200">Unable to load league</h3>
            <p className="text-xs text-red-300 mt-1 mb-4">{error}</p>
            <button
              onClick={() => fetchLeague(DEFAULT_LEAGUE_ID)}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs px-4 py-2 rounded-lg transition-colors"
            >
              Reset to Default League
            </button>
          </div>
        ) : (
          <>
            {/* League Hero Card */}
            {league && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101b33] via-[#142342] to-[#0e172c] border border-[#20365e] p-6 sm:p-8 mb-8 shadow-xl">
                <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#182849] border-2 border-teal-500/40 flex items-center justify-center shadow-lg">
                      {league.avatar ? (
                        <Image
                          src={`https://sleepercdn.com/avatars/thumbs/${league.avatar}`}
                          alt={league.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Trophy className="w-10 h-10 text-teal-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {league.name}
                        </h1>
                        <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          {league.status.replace("_", " ")}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" /> Mascots Enabled
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-3">
                        <span>Season {league.season}</span>
                        <span>•</span>
                        <span>{league.total_rosters} Teams</span>
                        <span>•</span>
                        <span>{league.scoring_settings?.rec === 1 ? "Full PPR" : "Standard"}</span>
                        <span>•</span>
                        <span>Playoffs Week {league.settings?.playoff_week_start || 15}</span>
                      </p>
                    </div>
                  </div>

                  {/* Divisions */}
                  <div className="flex flex-wrap gap-3">
                    {league.metadata?.division_1 && (
                      <div className="bg-[#182b4f]/70 border border-[#254275] rounded-xl px-4 py-2 text-xs">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
                          Division 1
                        </span>
                        <span className="font-bold text-teal-300">{league.metadata.division_1}</span>
                      </div>
                    )}
                    {league.metadata?.division_2 && (
                      <div className="bg-[#182b4f]/70 border border-[#254275] rounded-xl px-4 py-2 text-xs">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
                          Division 2
                        </span>
                        <span className="font-bold text-cyan-300">{league.metadata.division_2}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#1b2a47] space-x-2 sm:space-x-8 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab("standings")}
                className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "standings"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Standings & Rankings
              </button>
              <button
                onClick={() => setActiveTab("matchups")}
                className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "matchups"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Swords className="w-4 h-4" />
                Matchup Battles
              </button>
              <button
                onClick={() => setActiveTab("mascots")}
                className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "mascots"
                    ? "border-purple-400 text-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Mascots Showcase 🎭
              </button>
              <button
                onClick={() => setActiveTab("rosters")}
                className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "rosters"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-4 h-4" />
                All Rosters
              </button>
              <button
                onClick={() => setActiveTab("rules")}
                className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "rules"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Shield className="w-4 h-4" />
                League Rules
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`pb-3 px-1 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "news"
                    ? "border-teal-400 text-teal-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Flame className="w-4 h-4" />
                News & Sentiment
              </button>
            </div>

            {/* TAB 1: STANDINGS */}
            {activeTab === "standings" && (
              <div className="bg-[#101b33] rounded-2xl border border-[#1e3258] overflow-hidden shadow-lg">
                <div className="p-4 sm:p-5 border-b border-[#1b2a47] flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">League Standings</h2>
                    <p className="text-xs text-slate-400">
                      Top {playoffTeamsCount} teams qualify for playoffs
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block"></span>
                    <span>Playoff Seeds (1-{playoffTeamsCount})</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0b1426] text-xs font-semibold uppercase text-slate-400 tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 text-center w-14">Rank</th>
                        <th className="py-3.5 px-4">Team & Manager</th>
                        {showMascotsGlobal && (
                          <th className="py-3.5 px-3 text-center w-16">Mascot</th>
                        )}
                        <th className="py-3.5 px-4 text-center">Record</th>
                        <th className="py-3.5 px-4 text-center">Win %</th>
                        <th className="py-3.5 px-4 text-right">Points For (PF)</th>
                        <th className="py-3.5 px-4 text-right">Points Against (PA)</th>
                        <th className="py-3.5 px-4 text-center">Diff</th>
                        <th className="py-3.5 px-4 text-center">Streak</th>
                        <th className="py-3.5 px-4 text-center">FAAB Left</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#18294a]">
                      {teams.map((team, idx) => {
                        const rank = idx + 1;
                        const isPlayoff = rank <= playoffTeamsCount;
                        const totalGames = team.wins + team.losses + team.ties;
                        const winPct =
                          totalGames > 0
                            ? ((team.wins + 0.5 * team.ties) / totalGames).toFixed(3)
                            : ".000";
                        const diff = team.pointsFor - team.pointsAgainst;

                        return (
                          <tr
                            key={team.rosterId}
                            className={`hover:bg-[#152547] transition-colors ${
                              rank === playoffTeamsCount ? "border-b-2 border-b-teal-500/40" : ""
                            }`}
                          >
                            <td className="py-4 px-4 text-center font-bold">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                                  rank === 1
                                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                    : isPlayoff
                                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                                    : "text-slate-400"
                                }`}
                              >
                                {rank}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#182849] border border-[#233d6a] flex-shrink-0">
                                  <Image
                                    src={team.avatarUrl}
                                    alt={team.teamName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-semibold text-white flex items-center gap-2">
                                    <span>{team.teamName}</span>
                                    {team.divisionName && (
                                      <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                        {team.divisionName}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-400">
                                    @{team.ownerDisplayName}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {showMascotsGlobal && (
                              <td className="py-4 px-3 text-center">
                                <div
                                  className="inline-block"
                                  title={`Mascot: ${team.mascotInfo?.mascotId}`}
                                >
                                  <Mascot
                                    type={team.mascotInfo?.mascotId || "taco"}
                                    emotion={team.mascotInfo?.emotion || "idle"}
                                    size="sm"
                                  />
                                </div>
                              </td>
                            )}

                            <td className="py-4 px-4 text-center font-bold text-white">
                              {team.wins}-{team.losses}
                              {team.ties > 0 && `-${team.ties}`}
                            </td>

                            <td className="py-4 px-4 text-center text-slate-300 text-xs font-mono">
                              {winPct}
                            </td>

                            <td className="py-4 px-4 text-right font-mono font-bold text-teal-300">
                              {team.pointsFor.toFixed(2)}
                            </td>

                            <td className="py-4 px-4 text-right font-mono text-slate-300">
                              {team.pointsAgainst.toFixed(2)}
                            </td>

                            <td
                              className={`py-4 px-4 text-center font-mono text-xs font-bold ${
                                diff > 0
                                  ? "text-green-400"
                                  : diff < 0
                                  ? "text-red-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                            </td>

                            <td className="py-4 px-4 text-center text-xs">
                              <span
                                className={`px-2 py-0.5 rounded font-semibold ${
                                  team.streak.startsWith("W")
                                    ? "bg-green-500/20 text-green-300"
                                    : team.streak.startsWith("L")
                                    ? "bg-red-500/20 text-red-300"
                                    : "bg-slate-700 text-slate-300"
                                }`}
                              >
                                {team.streak}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center text-xs font-mono text-amber-300">
                              ${team.waiverBudgetRemaining}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: MATCHUPS WITH MASCOT BATTLEFIELD */}
            {activeTab === "matchups" && (
              <div>
                {/* Week selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-thin">
                  <span className="text-xs uppercase font-bold text-slate-400 pr-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Week
                  </span>
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((wk) => (
                    <button
                      key={wk}
                      onClick={() => setSelectedWeek(wk)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                        selectedWeek === wk
                          ? "bg-teal-400 text-black shadow-lg shadow-teal-500/20 scale-105"
                          : "bg-[#121f38] text-slate-300 hover:bg-[#1a2d52] border border-[#1e345c]"
                      }`}
                    >
                      Wk {wk}
                    </button>
                  ))}
                </div>

                {matchupsLoading ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-slate-400">Loading Week {selectedWeek} matchups...</p>
                  </div>
                ) : matchupPairs.length === 0 ? (
                  <div className="bg-[#101b33] rounded-2xl border border-[#1e3258] p-12 text-center text-slate-400">
                    No matchup data available for Week {selectedWeek}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matchupPairs.map((pair) => {
                      const t1 = pair.teams[0];
                      const t2 = pair.teams[1];
                      const t1Score = t1?.matchup.points ?? 0;
                      const t2Score = t2?.matchup.points ?? 0;
                      const t1Wins = t1Score > t2Score;
                      const t2Wins = t2Score > t1Score;
                      const isPlayed = t1Score > 0 || t2Score > 0;
                      const diff = Math.abs(t1Score - t2Score);

                      // Resolve Mascot IDs for selected week
                      const m1Type =
                        t1?.team?.mascotInfo.mascotsByWeek[selectedWeek] ||
                        t1?.team?.mascotInfo.mascotId ||
                        "taco";
                      const m2Type =
                        t2?.team?.mascotInfo.mascotsByWeek[selectedWeek] ||
                        t2?.team?.mascotInfo.mascotId ||
                        "sharky-dududu";

                      // Resolve dynamic emotions based on score or Sleeper metadata
                      let m1Emotion: MascotEmotion = "idle";
                      let m2Emotion: MascotEmotion = "idle";

                      if (isPlayed) {
                        if (t1Wins) {
                          m1Emotion = diff < 10 ? "dancing" : "victory";
                          m2Emotion = diff < 10 ? "taunting" : "sad";
                        } else if (t2Wins) {
                          m2Emotion = diff < 10 ? "dancing" : "victory";
                          m1Emotion = diff < 10 ? "taunting" : "sad";
                        } else {
                          m1Emotion = "taunting";
                          m2Emotion = "taunting";
                        }
                      } else {
                        // Game not played yet: use saved Sleeper emotion or taunting
                        m1Emotion =
                          (t1?.team?.mascotInfo.emotionsByWeek[selectedWeek] as MascotEmotion) ||
                          "idle_happy";
                        m2Emotion =
                          (t2?.team?.mascotInfo.emotionsByWeek[selectedWeek] as MascotEmotion) ||
                          "taunting";
                      }

                      return (
                        <div
                          key={pair.id}
                          className="bg-[#101b33] rounded-2xl border border-[#1e3258] p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
                        >
                          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center justify-between">
                            <span>Matchup #{pair.id}</span>
                            <span className="text-teal-400">Week {selectedWeek}</span>
                          </div>

                          {/* MASCOT BATTLEFIELD ARENA */}
                          {showMascotsGlobal && (
                            <div className="relative mb-5 pt-7 pb-2 px-4 rounded-xl bg-gradient-to-b from-[#0b1426] to-[#0d1830] border border-[#1e335a] flex items-center justify-between overflow-visible">
                              {/* Mascot 1 (Left) */}
                              <div className="flex flex-col items-center">
                                <Mascot
                                  type={m1Type}
                                  emotion={m1Emotion}
                                  size="md"
                                  showBubble={true}
                                />
                                <span className="text-[10px] font-bold text-slate-300 mt-1 uppercase">
                                  {m1Type}
                                </span>
                              </div>

                              {/* Center Clash Badge */}
                              <div className="text-center px-2">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#1b2b4c] border border-[#2b4b84] text-[10px] font-black uppercase text-teal-300 tracking-wider shadow">
                                  {isPlayed
                                    ? diff > 25
                                      ? "BLOWOUT"
                                      : diff < 6
                                      ? "NAIL BITER"
                                      : "LIVE BATTLE"
                                    : "UPCOMING"}
                                </span>
                              </div>

                              {/* Mascot 2 (Right) */}
                              <div className="flex flex-col items-center">
                                <Mascot
                                  type={m2Type}
                                  emotion={m2Emotion}
                                  size="md"
                                  showBubble={true}
                                  flip={true}
                                />
                                <span className="text-[10px] font-bold text-slate-300 mt-1 uppercase">
                                  {m2Type}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="space-y-4">
                            {/* Team 1 */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1426]/70 border border-[#172748]">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#182849] border border-[#233d6a] flex-shrink-0">
                                  {t1?.team?.avatarUrl ? (
                                    <Image
                                      src={t1.team.avatarUrl}
                                      alt={t1.team.teamName}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <Users className="w-5 h-5 text-slate-400 m-2.5" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-white text-sm truncate">
                                    {t1?.team?.teamName || `Team ${t1?.matchup.roster_id}`}
                                  </h4>
                                  <span className="text-xs text-slate-400 truncate block">
                                    @{t1?.team?.ownerDisplayName || "Unknown"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span
                                  className={`text-xl font-extrabold font-mono ${
                                    isPlayed && t1Wins ? "text-teal-300" : "text-slate-200"
                                  }`}
                                >
                                  {t1Score.toFixed(2)}
                                </span>
                                {isPlayed && t1Wins && (
                                  <div className="text-[10px] font-bold text-teal-400 flex items-center justify-end gap-1">
                                    <Award className="w-3 h-3" /> Winner
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* VS Divider */}
                            <div className="flex items-center justify-center -my-2 relative z-10">
                              <span className="bg-[#182a4d] border border-[#26447c] text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-slate-300 shadow">
                                VS
                              </span>
                            </div>

                            {/* Team 2 */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b1426]/70 border border-[#172748]">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#182849] border border-[#233d6a] flex-shrink-0">
                                  {t2?.team?.avatarUrl ? (
                                    <Image
                                      src={t2.team.avatarUrl}
                                      alt={t2.team.teamName}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <Users className="w-5 h-5 text-slate-400 m-2.5" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-white text-sm truncate">
                                    {t2?.team?.teamName || `Team ${t2?.matchup.roster_id}`}
                                  </h4>
                                  <span className="text-xs text-slate-400 truncate block">
                                    @{t2?.team?.ownerDisplayName || "Unknown"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span
                                  className={`text-xl font-extrabold font-mono ${
                                    isPlayed && t2Wins ? "text-teal-300" : "text-slate-200"
                                  }`}
                                >
                                  {t2Score.toFixed(2)}
                                </span>
                                {isPlayed && t2Wins && (
                                  <div className="text-[10px] font-bold text-teal-400 flex items-center justify-end gap-1">
                                    <Award className="w-3 h-3" /> Winner
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {isPlayed && (
                            <div className="mt-4 pt-3 border-t border-[#172748] text-center text-xs text-slate-400 font-mono">
                              Margin:{" "}
                              <span className="text-slate-200 font-bold">
                                {diff.toFixed(2)} pts
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MASCOTS SHOWCASE & LEAGUE DIRECTORY */}
            {activeTab === "mascots" && (
              <div className="space-y-8">
                {/* Intro Banner */}
                <div className="bg-[#101b33] rounded-2xl border border-purple-500/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 max-w-3xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/30 inline-block mb-3">
                      Legacy Feature Restored
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">
                      The Sleeper Mascots Are Back!
                    </h2>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      Sleeper previously featured animated mascots that cheered, taunted, and
                      celebrated on game day. Even though Sleeper phased them out, your
                      league’s metadata still stores every manager’s mascot choices and
                      weekly trash-talk emotions. We’ve brought them back to life right here!
                    </p>

                    {/* Emotion Selector */}
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 mr-2">Test Animation:</span>
                      {(
                        [
                          "idle_happy",
                          "victory",
                          "dancing",
                          "taunting",
                          "sad",
                        ] as MascotEmotion[]
                      ).map((emo) => (
                        <button
                          key={emo}
                          onClick={() => setShowcaseEmotion(emo)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                            showcaseEmotion === emo
                              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105"
                              : "bg-[#182849] text-slate-300 hover:bg-[#203660] border border-[#254275]"
                          }`}
                        >
                          {emo.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid of All 9 Mascots */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Mascot Roster & Emote Previews
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        id: "taco",
                        name: "Taco",
                        desc: "Cruisin' in shades with spicy salsa and a crunchy shell.",
                      },
                      {
                        id: "sharky-dududu",
                        name: "Sharky",
                        desc: "Doo-doo-doo! Razor teeth, ocean fin, and an insatiable appetite for Ws.",
                      },
                      {
                        id: "trash",
                        name: "Trash Can",
                        desc: "Oscar-style friendly trash monster ready to recycle the competition.",
                      },
                      {
                        id: "panpan",
                        name: "Pan-Pan",
                        desc: "Cute panda chewing bamboo who turns fiercely competitive on Sunday.",
                      },
                      {
                        id: "mr-hollywood",
                        name: "Mr. Hollywood",
                        desc: "Gold star sunglasses, director's flair, and Oscar-worthy celebrations.",
                      },
                      {
                        id: "frog-fu",
                        name: "Frog-Fu",
                        desc: "Martial arts master with red karate headband and deadly jump kicks.",
                      },
                      {
                        id: "ref",
                        name: "The Fish Ref",
                        desc: "Official Sleeper referee goldfish with striped cap, whistle, penalty flag & TD signals.",
                      },
                      {
                        id: "fish",
                        name: "Sleeper Goldfish",
                        desc: "Classic deadpan Sleeper goldfish with genuine multi-frame bubble and fin animations.",
                      },
                      {
                        id: "titan-up",
                        name: "Titan",
                        desc: "Armored spartan gladiator with lightning wings and an indomitable will.",
                      },
                      {
                        id: "trex",
                        name: "T-Rex",
                        desc: "Prehistoric predator whose tiny arms can barely hold all the trophies.",
                      },
                    ].map((m) => (
                      <div
                        key={m.id}
                        className="bg-[#101b33] rounded-2xl border border-[#1e3258] p-6 flex flex-col items-center text-center shadow-lg hover:border-purple-500/40 transition-all group"
                      >
                        <div className="h-28 flex items-center justify-center mb-2">
                          <Mascot
                            type={m.id}
                            emotion={showcaseEmotion}
                            size="lg"
                            showBubble={true}
                          />
                        </div>
                        <h4 className="font-extrabold text-white text-base mt-2">{m.name}</h4>
                        <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider mb-2">
                          {m.id}
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authentic 2D Sprite Animation Showcase */}
                <div className="bg-[#101b33] rounded-2xl border border-purple-500/40 p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#1e3258]">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Official Sleeper Art Style
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        Multi-Frame Animation Studio
                      </h3>
                      <p className="text-xs text-slate-400">
                        Faithfully reconstructed from original Sleeper mascot vector artwork with multi-frame animated states.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: The Fish Ref */}
                    <div className="bg-[#0b1426] rounded-xl border border-[#1a2c4e] p-5 flex flex-col items-center">
                      <div className="w-full flex items-center justify-between mb-3">
                        <span className="font-bold text-white text-sm flex items-center gap-2">
                          🏁 The Fish Ref
                        </span>
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                          5-Frame Animated Loop
                        </span>
                      </div>
                      <div className="w-48 h-48 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 p-2 mb-3">
                        <img
                          src="/mascots/fish_ref/fish_ref_full.gif"
                          alt="Fish Ref Full Loop"
                          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                      <div className="w-full">
                        <p className="text-[11px] text-slate-400 text-center mb-2 font-mono">Horizontal Sprite Sheet Strip:</p>
                        <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800 overflow-x-auto">
                          <img
                            src="/mascots/fish_ref/fish_ref_strip.png"
                            alt="Fish Ref Sprite Strip"
                            className="h-16 w-auto object-contain mx-auto"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Classic Goldfish */}
                    <div className="bg-[#0b1426] rounded-xl border border-[#1a2c4e] p-5 flex flex-col items-center">
                      <div className="w-full flex items-center justify-between mb-3">
                        <span className="font-bold text-white text-sm flex items-center gap-2">
                          🐟 Sleeper Goldfish
                        </span>
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/30">
                          5-Frame Animated Loop
                        </span>
                      </div>
                      <div className="w-48 h-48 flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 p-2 mb-3">
                        <img
                          src="/mascots/fish/fish_full.gif"
                          alt="Sleeper Goldfish Full Loop"
                          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                        />
                      </div>
                      <div className="w-full">
                        <p className="text-[11px] text-slate-400 text-center mb-2 font-mono">Horizontal Sprite Sheet Strip:</p>
                        <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800 overflow-x-auto">
                          <img
                            src="/mascots/fish/fish_strip.png"
                            alt="Goldfish Sprite Strip"
                            className="h-16 w-auto object-contain mx-auto"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* League Mascot Directory */}
                <div className="bg-[#101b33] rounded-2xl border border-[#1e3258] p-6 shadow-lg">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-400" />
                    Your League's Saved Mascot Assignments
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {teams.map((t) => (
                      <div
                        key={t.rosterId}
                        className="p-3.5 rounded-xl bg-[#0b1426] border border-[#1a2c4e] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Mascot
                            type={t.mascotInfo?.mascotId || "taco"}
                            emotion="idle_happy"
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-white text-xs truncate">
                              {t.teamName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              @{t.ownerDisplayName}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase flex-shrink-0">
                          {t.mascotInfo?.mascotId || "taco"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ROSTERS */}
            {activeTab === "rosters" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((t) => (
                  <div
                    key={t.rosterId}
                    className="bg-[#101b33] rounded-2xl border border-[#1e3258] p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#182849] border border-[#233d6a] flex-shrink-0">
                          <Image
                            src={t.avatarUrl}
                            alt={t.teamName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-white text-base truncate">
                              {t.teamName}
                            </h3>
                            {showMascotsGlobal && (
                              <Mascot
                                type={t.mascotInfo?.mascotId || "taco"}
                                emotion="idle"
                                size="sm"
                              />
                            )}
                          </div>
                          <p className="text-xs text-slate-400">@{t.ownerDisplayName}</p>
                          {t.divisionName && (
                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 mt-1">
                              {t.divisionName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0b1426] border border-[#182849] mb-4 text-center">
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                            Record
                          </span>
                          <span className="text-sm font-bold text-white">
                            {t.wins}-{t.losses}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                            Points For
                          </span>
                          <span className="text-sm font-bold text-teal-400 font-mono">
                            {t.pointsFor.toFixed(0)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                            Waiver FAAB
                          </span>
                          <span className="text-sm font-bold text-amber-300 font-mono">
                            ${t.waiverBudgetRemaining}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Total Roster Size:</span>
                          <span className="font-bold text-slate-200">{t.players.length} players</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Starting Lineup:</span>
                          <span className="font-bold text-slate-200">{t.starters.length} starters</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bench Count:</span>
                          <span className="font-bold text-slate-200">
                            {Math.max(0, t.players.length - t.starters.length)} bench
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Moves:</span>
                          <span className="font-bold text-slate-200">{t.moves}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: RULES & SCORING */}
            {activeTab === "rules" && league && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#101b33] rounded-2xl border border-[#1e3258] p-6 shadow-lg">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-teal-400" />
                    Roster Configuration
                  </h3>
                  <div className="divide-y divide-[#18294a]">
                    {league.roster_positions.map((pos, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                        <span className="text-slate-300 font-medium">{pos}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#182849] text-teal-300 border border-[#233d6a]">
                          {pos === "BN" ? "Bench Slot" : "Starter"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#101b33] rounded-2xl border border-[#1e3258] p-6 shadow-lg">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-teal-400" />
                    Key Scoring Rules
                  </h3>
                  <div className="divide-y divide-[#18294a] text-sm">
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-300">Reception (PPR)</span>
                      <span className="font-bold font-mono text-teal-300">
                        {league.scoring_settings?.rec ?? 1} pt
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-300">Passing Touchdown</span>
                      <span className="font-bold font-mono text-teal-300">
                        {league.scoring_settings?.pass_td ?? 4} pts
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-300">Rushing / Receiving Touchdown</span>
                      <span className="font-bold font-mono text-teal-300">
                        {league.scoring_settings?.rush_td ?? 6} pts
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-300">Passing Yards</span>
                      <span className="font-bold font-mono text-teal-300">1 pt / 25 yds</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-300">Rushing / Receiving Yards</span>
                      <span className="font-bold font-mono text-teal-300">1 pt / 10 yds</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-300">Interception Thrown</span>
                      <span className="font-bold font-mono text-red-400">
                        {league.scoring_settings?.pass_int ?? -1} pt
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-300">Fumble Lost</span>
                      <span className="font-bold font-mono text-red-400">
                        {league.scoring_settings?.fum_lost ?? -1} pt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* TAB: NEWS */}
            {activeTab === "news" && (
              <NewsFeed />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b2a47] py-6 text-center text-xs text-slate-500">
        <p>
          Powered by the Sleeper REST API • Restored Animated Mascots • League ID:{" "}
          <span className="font-mono text-slate-400">{leagueId}</span>
        </p>
      </footer>
    </div>
  );
}
