import React, { useState } from "react";
import { MOCK_MATCH_RECORDS, getStatsOverview } from "../../data/mockStatsData";
import { MatchRecord } from "../../types/stats";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";
import { MatchDetailModal } from "./MatchDetailModal";
import {
  Cpu,
  Coins,
  History,
  Eye,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

interface StatsPageProps {
  onBackToBoard?: () => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({ onBackToBoard }) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  // Overview metrics (defaulting tokens burned & $FLOP spent to 0 if none yet)
  const overview = getStatsOverview(MOCK_MATCH_RECORDS, 0, 0);

  const getRankBadgeClass = (rank?: number) => {
    switch (rank) {
      case 1:
        return "bg-[#ffc905] text-black border border-black"; // Gold
      case 2:
        return "bg-[#cbd5e1] text-black border border-black"; // Silver
      case 3:
        return "bg-[#cd7f32] text-white border border-black"; // Bronze
      default:
        return "bg-[#ffc905] text-black border border-black";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 select-none pb-8">
      {/* 1. Page Title & Header Bar */}
      <div className="bg-white rounded-lg border-[1.5px] border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#c9daf8] rounded-md border-[1.5px] border-black text-black">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-black">
              Tournament Intelligence & Agent Performance
            </h1>
            <span className="text-xs font-bold text-neutral-600">
              Autonomous head-to-head match analytics, token burn, and $FLOP expenditure
            </span>
          </div>
        </div>

        {onBackToBoard && (
          <button
            type="button"
            onClick={onBackToBoard}
            className="px-3.5 py-1.5 bg-[#ffc905] hover:bg-[#e6b504] text-black border-[1.5px] border-black rounded-md text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors active:translate-y-px"
          >
            Live Board <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Total Overview 3-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Tokens Burned (Default 0) */}
        <div className="bg-white rounded-lg border-[1.5px] border-black p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Total Tokens Burned
            </span>
            <Cpu className="w-4 h-4 text-black" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-black tabular-nums">
              {overview.totalTokensBurned.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase">
              tokens
            </span>
          </div>
          <span className="text-[9px] font-bold text-neutral-500 uppercase mt-1">
            Qwen3.8-27B on Groq
          </span>
        </div>

        {/* Metric 2: $FLOP Spent (Default 0) */}
        <div className="bg-white rounded-lg border-[1.5px] border-black p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Total $FLOP Spent
            </span>
            <Coins className="w-4 h-4 text-black" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-black tabular-nums">
              ${overview.totalFlopSpent.toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase">
              $FLOP
            </span>
          </div>
          <span className="text-[9px] font-bold text-neutral-500 uppercase mt-1">
            Gas & API Settlement
          </span>
        </div>

        {/* Metric 3: Matches Played */}
        <div className="bg-white rounded-lg border-[1.5px] border-black p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Matches Resolved
            </span>
            <History className="w-4 h-4 text-black" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-black tabular-nums">
              {overview.totalMatches}
            </span>
            <span className="text-[10px] font-bold text-neutral-500 uppercase">
              matches
            </span>
          </div>
          <span className="text-[9px] font-bold text-neutral-500 uppercase mt-1">
            Avg {overview.averageTurns} Turns / Match
          </span>
        </div>
      </div>

      {/* 3. Match History Section */}
      <div className="bg-white rounded-lg border-[1.5px] border-black overflow-hidden shadow-xs">
        <div className="p-3.5 bg-[#c9daf8] text-black border-b-[1.5px] border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-black" />
            <h2 className="text-xs font-black uppercase tracking-wider text-black">
              Resolved Match History ({MOCK_MATCH_RECORDS.length} Matches)
            </h2>
          </div>
          <span className="text-[10px] font-extrabold text-neutral-700 uppercase tracking-widest">
            Latest Autonomous Duels
          </span>
        </div>

        {/* Match Cards List */}
        <div className="p-4 flex flex-col gap-3">
          {MOCK_MATCH_RECORDS.map((match) => {
            const isAgent1Winner = match.winnerId === 0;
            const rank = match.rank || match.matchNumber;

            return (
              <div
                key={match.id}
                className="bg-white rounded-lg border-[1.5px] border-black p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-150 hover:bg-neutral-50"
              >
                {/* Left: Winner Info & Ranked Badge */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <IdenticonAvatar
                      name={match.winnerName}
                      size={40}
                      color={isAgent1Winner ? "#008ed2" : "#f6931e"}
                    />
                    <span
                      className={`absolute -top-1.5 -left-1.5 rounded px-1 text-[8px] font-black uppercase ${getRankBadgeClass(
                        rank,
                      )}`}
                    >
                      #{rank}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wide text-black">
                      {match.winnerName}
                    </span>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-600 mt-0.5">
                      <span>vs {match.loserName}</span>
                      <span>•</span>
                      <span className="font-bold">{match.date}</span>
                    </div>
                  </div>
                </div>

                {/* Center: Financial Performance & Costs */}
                <div className="grid grid-cols-3 gap-4 text-[11px] border-t md:border-t-0 md:border-l border-neutral-200 pt-2 md:pt-0 md:pl-4 w-full md:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-neutral-500 uppercase">
                      Net Worth
                    </span>
                    <span className="font-black text-black tabular-nums">
                      ${match.winnerEndingNetWorth.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-neutral-500 uppercase">
                      Tokens Burned
                    </span>
                    <span className="font-black text-black tabular-nums">
                      {match.tokensBurned.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-neutral-500 uppercase">
                      $FLOP Spent
                    </span>
                    <span className="font-black text-black tabular-nums">
                      ${match.flopSpent.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Right: View Action Button */}
                <button
                  type="button"
                  onClick={() => setSelectedMatch(match)}
                  className="w-full md:w-auto px-3.5 py-2 bg-white hover:bg-[#c9daf8] text-black border-[1.5px] border-black rounded-md text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:translate-y-px"
                >
                  <Eye className="w-3.5 h-3.5" /> View Match
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Match Detail Performance Modal */}
      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  );
};
