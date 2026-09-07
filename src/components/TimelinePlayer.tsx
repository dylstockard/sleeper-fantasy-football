"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { SimulatedGame, GameEvent } from "@/lib/simulation";

interface TimelinePlayerProps {
  game: SimulatedGame;
}

export function TimelinePlayer({ game }: TimelinePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const totalMinutes = 60;
  
  // Calculate current score based on currentMinute
  let scoreA = 0;
  let scoreB = 0;
  const recentEvents: GameEvent[] = [];
  
  for (const event of game.events) {
    if (event.timestamp <= currentMinute) {
      scoreA += event.pointsAddedTeamA;
      scoreB += event.pointsAddedTeamB;
      recentEvents.unshift(event);
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentMinute < totalMinutes) {
      interval = setInterval(() => {
        setCurrentMinute((prev) => prev + 1);
      }, 500); // 1 minute per half-second for fast playback
    } else if (currentMinute >= totalMinutes) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMinute, totalMinutes]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => {
    setIsPlaying(false);
    setCurrentMinute(0);
  };
  const fastForward = () => setCurrentMinute(totalMinutes);

  return (
    <div className="bg-[#121f38] p-6 rounded-xl border border-[#20365e] flex flex-col gap-6">
      <div className="flex justify-between items-center bg-[#090e1a] p-4 rounded-lg border border-[#1b2a47]">
        <div className="text-xl font-bold">{game.teamA.name}</div>
        <div className="text-4xl font-black text-teal-400">
          {scoreA} - {scoreB}
        </div>
        <div className="text-xl font-bold">{game.teamB.name}</div>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase">
          <span>Q1 15:00</span>
          <span>Time: {currentMinute} / {totalMinutes} min</span>
          <span>Q4 0:00</span>
        </div>
        <input 
          type="range" 
          min={0} 
          max={totalMinutes} 
          value={currentMinute}
          onChange={(e) => {
            setCurrentMinute(Number(e.target.value));
            setIsPlaying(false);
          }}
          className="w-full accent-teal-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={reset} className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition">
          <SkipBack className="w-5 h-5 text-slate-300" />
        </button>
        <button onClick={togglePlay} className="p-3 rounded-full bg-teal-600 hover:bg-teal-500 transition text-black shadow-lg shadow-teal-500/20">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 pl-1" />}
        </button>
        <button onClick={fastForward} className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition">
          <SkipForward className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      <div className="bg-[#090e1a] rounded-lg p-4 h-64 overflow-y-auto border border-[#1b2a47] flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase sticky top-0 bg-[#090e1a] pb-2">Recent Events</h3>
        {recentEvents.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-10">No events yet</div>
        ) : (
          recentEvents.map((evt) => (
            <div key={evt.id} className="bg-[#121f38] p-3 rounded-lg border border-[#20365e] flex gap-3 items-center">
              <div className="text-xs text-teal-400 font-mono w-12 shrink-0">{evt.timestamp}&apos;</div>
              <div className="text-sm flex-1">{evt.description}</div>
              <div className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300">
                {evt.type}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
