import { useEffect, useState } from "react";
import { Flame, ExternalLink, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NewsItem {
  item_id: number;
  title: string;
  url: string;
  published_at: string;
  source_name: string;
  player_id: string;
  player_name: string;
  sentiment_score: number | null;
  sentiment_label: string | null;
}

export function NewsFeed() {
  const [feed, setFeed] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const fetchFeed = async (playerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = playerId 
        ? `${baseUrl}/api/players/${playerId}/news`
        : `${baseUrl}/api/feed`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch news");
      
      const data = await res.json();
      
      // If fetching for a specific player, the response has a `news` array
      if (playerId) {
        setFeed(data.news.map((item: any) => ({
          ...item,
          player_id: data.player_id,
          player_name: data.name
        })));
      } else {
        setFeed(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(selectedPlayer || undefined);
  }, [selectedPlayer]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          {selectedPlayer ? "Player Specific News" : "Global Fantasy News"}
        </h2>
        {selectedPlayer && (
          <button 
            onClick={() => setSelectedPlayer(null)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            Clear Filter
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-slate-400">Loading latest news...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center text-red-200">
          <p>{error}</p>
          <p className="text-xs mt-2 opacity-70">Make sure the Python backend is running on port 8000.</p>
        </div>
      ) : feed.length === 0 ? (
        <div className="bg-[#101b33] border border-[#1e3258] rounded-xl p-10 text-center text-slate-400">
          No news items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feed.map((item) => {
            const isPos = item.sentiment_label === "POSITIVE";
            const isNeg = item.sentiment_label === "NEGATIVE";
            const isNeu = item.sentiment_label === "NEUTRAL";
            
            return (
              <div key={`${item.item_id}-${item.player_id}`} className="bg-[#101b33] border border-[#1e3258] rounded-xl p-4 flex flex-col justify-between hover:border-teal-500/30 transition-colors shadow-lg">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <button 
                      onClick={() => setSelectedPlayer(item.player_id)}
                      className="text-sm font-bold text-teal-300 hover:text-teal-200 hover:underline inline-flex items-center gap-1"
                    >
                      {item.player_name}
                      <ArrowRight className="w-3 h-3 opacity-50" />
                    </button>
                    
                    {item.sentiment_label && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        isPos ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        isNeg ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      }`}>
                        {isPos ? <TrendingUp className="w-3 h-3" /> :
                         isNeg ? <TrendingDown className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                        {item.sentiment_label}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-semibold text-white mb-2 line-clamp-3">
                    {item.title}
                  </h3>
                </div>
                
                <div className="mt-4 pt-3 border-t border-[#1b2a47] flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">{item.source_name}</span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
                  >
                    Read <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
