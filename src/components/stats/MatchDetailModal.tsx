import React, { useEffect } from "react";
import { MatchRecord } from "../../types/stats";
import { PortfolioLineChart } from "./PortfolioLineChart";
import { X, Trophy, Cpu, Coins, Clock } from "lucide-react";

interface MatchDetailModalProps {
  match: MatchRecord | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!match) return null;

  const isAgent2 = match.winnerId === 1;
  const agentColor = isAgent2 ? "#f6931e" : "#008ed2";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-lg border-2 border-black overflow-hidden flex flex-col max-h-[90vh] my-auto shadow-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Light Board Blue Header */}
        <div className="p-3.5 bg-[#c9daf8] text-black flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-[#ffc905] rounded border border-black text-black">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-black">
                Match #{match.matchNumber} Performance Dossier
              </span>
              <span className="text-[10px] font-bold text-neutral-700">
                {match.winnerName} • {match.date} • {match.totalTurns} Turns (
                {match.durationSeconds}s)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-white hover:bg-neutral-100 text-black border border-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex flex-col gap-4 bg-neutral-50/40">
          {/* Quick Metrics 3-Box Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Metric 1: Tokens Burned */}
            <div className="bg-white rounded-lg border-[1.5px] border-black p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-600">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">
                  Tokens Burned
                </span>
                <Cpu className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-sm font-black text-black tabular-nums mt-1">
                {match.tokensBurned.toLocaleString()}
              </span>
            </div>

            {/* Metric 2: $FLOP Spent */}
            <div className="bg-white rounded-lg border-[1.5px] border-black p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-600">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">
                  $FLOP Spent
                </span>
                <Coins className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-sm font-black text-black tabular-nums mt-1">
                ${match.flopSpent.toFixed(2)} FLOP
              </span>
            </div>

            {/* Metric 3: Total Turns */}
            <div className="bg-white rounded-lg border-[1.5px] border-black p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-600">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">
                  Total Turns
                </span>
                <Clock className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-sm font-black text-black tabular-nums mt-1">
                {match.totalTurns} Rounds
              </span>
            </div>
          </div>

          {/* Portfolio Progression Line Chart (Agent's Own Curve) */}
          <PortfolioLineChart
            data={match.portfolioHistory}
            color={agentColor}
            isAgent2={isAgent2}
          />
        </div>
      </div>
    </div>
  );
};
