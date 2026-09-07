import React, { useState, useEffect } from "react";
import { ExternalLink, Clock, TrendingUp, AlertCircle, Newspaper } from "lucide-react";

interface NewsItem {
  item_id: number;
  title: string;
  url: string;
  published_at: string;
  source_name: string;
  player_id?: string;
  player_name?: string;
}

interface NewsFeedProps {
  playerId?: string;
  rosterIds?: string[]; // Added roster filter support
}

export function NewsFeed({ playerId, rosterIds }: NewsFeedProps) {
  const [feed, setFeed] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async (specificPlayerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      let endpoint = `${baseUrl}/api/feed`;
      
      if (specificPlayerId) {
        endpoint = `${baseUrl}/api/players/${specificPlayerId}/news`;
      } else if (rosterIds && rosterIds.length > 0) {
        // Pass rosterIds as comma separated list to global feed
        endpoint = `${baseUrl}/api/feed?player_ids=${rosterIds.join(",")}`;
      }
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch news");
      
      const data = await res.json();
      
      if (specificPlayerId) {
        setFeed(data.news.map((item: any) => ({
          ...item,
          player_id: data.player_id,
          player_name: data.name
        })));
      } else {
        setFeed(data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(playerId);
  }, [playerId, rosterIds]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-red-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>{error}</p>
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="bg-[#101b33] border border-[#1e3258] rounded-xl p-10 text-center text-slate-400">
        <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="text-lg font-medium text-slate-300">No news found</p>
        <p className="text-sm mt-1">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feed.map((item) => (
        <a 
          key={item.item_id} 
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#101b33] hover:bg-[#152342] transition-colors rounded-2xl border border-[#1e3258] overflow-hidden"
        >
          <div className="p-5 flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold mb-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Newspaper className="w-3.5 h-3.5" />
                  {item.source_name}
                </span>
                <span className="text-[#1e3258]">•</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(item.published_at).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </span>
              </div>
              
              <h3 className="text-slate-100 font-bold text-base leading-snug mb-3 pr-4 group-hover:text-teal-400 transition-colors">
                {item.title}
              </h3>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#18294a]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700/50 flex items-center justify-center border border-slate-600/50 overflow-hidden">
                    {item.player_id ? (
                      <img 
                        src={`https://sleepercdn.com/content/nfl/players/thumb/${item.player_id}.jpg`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-300">
                    {item.player_name || "General News"}
                  </span>
                </div>
                
                <ExternalLink className="w-4 h-4 text-slate-500 hover:text-teal-400" />
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
