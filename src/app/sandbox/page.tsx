"use client";

import { useState } from "react";
import { TimelinePlayer } from "@/components/TimelinePlayer";
import { simulateGame, SimulatedGame } from "@/lib/simulation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SandboxPage() {
  const [game, setGame] = useState<SimulatedGame | null>(null);

  const handleSimulate = () => {
    const newGame = simulateGame(
      { id: "1", name: "Team Alpha" },
      { id: "2", name: "Team Beta" }
    );
    setGame(newGame);
  };

  return (
    <div className="min-h-screen bg-[#090e1a] text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Game Simulation Sandbox</h1>
        <p className="text-slate-400 mb-8">
          Use this sandbox to generate simulated game data and test the interactive timeline feature.
        </p>

        <div className="mb-8 flex gap-4">
          <button 
            onClick={handleSimulate}
            className="bg-teal-500 hover:bg-teal-400 text-black font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-teal-500/20"
          >
            Simulate New Game
          </button>
          
          {game && (
            <button 
              onClick={() => setGame(null)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {game && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Timeline Visualization</h2>
            <TimelinePlayer game={game} />
          </div>
        )}
      </div>
    </div>
  );
}
