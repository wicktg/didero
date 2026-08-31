import React, { useEffect } from "react";
import { MatchRecord } from "../../types/stats";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";
import { PortfolioLineChart } from "./PortfolioLineChart";
import {
  X,
  Trophy,
  Cpu,
  Coins,
  Building2,
  Clock,
  Sparkles,
} from "lucide-react";

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-lg border-2 border-black overflow-hidden flex flex-col max-h-[90vh] my-auto"
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
                {match.date} • {match.totalTurns} Turns Duration ({match.durationSeconds}s)
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

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-neutral-50/40">
          {/* Head-to-Head Victor Card */}
          <div className="bg-white rounded-lg border-[1.5px] border-black p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Winner */}
            <div className="flex items-center gap-2.5">
              <IdenticonAvatar
                name={match.winnerName}
                size={34}
                color={match.winnerId === 0 ? "#008ed2" : "#f6931e"}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#a5cd39] text-black border border-black rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    Victor
                  </span>
                  <span className="text-xs font-extrabold uppercase text-black">
                    {match.winnerName}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-neutral-600 mt-0.5">
                  Ending Net Worth:{" "}
                  <strong className="text-black font-black">
                    ${match.winnerEndingNetWorth.toLocaleString()}
                  </strong>{" "}
                  ({match.winnerPropertiesCount} properties)
                </span>
              </div>
            </div>

            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest hidden sm:block">
              VS
            </div>

            {/* Loser */}
            <div className="flex items-center gap-2.5">
              <IdenticonAvatar
                name={match.loserName}
                size={34}
                color={match.loserId === 0 ? "#008ed2" : "#f6931e"}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#eb1c24] text-white border border-black rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                    Defeated
                  </span>
                  <span className="text-xs font-extrabold uppercase text-black">
                    {match.loserName}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-neutral-600 mt-0.5">
                  Resolution:{" "}
                  <strong className="text-black font-black">
                    {match.resolutionType}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics 4-Box Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

            {/* Metric 4: Monopolies */}
            <div className="bg-white rounded-lg border-[1.5px] border-black p-2.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-neutral-600">
                <span className="text-[9px] font-extrabold uppercase tracking-wider">
                  Monopolies
                </span>
                <Building2 className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-sm font-black text-black uppercase mt-1">
                {match.winnerMonopolies.length > 0
                  ? match.winnerMonopolies.join(", ")
                  : "None"}
              </span>
            </div>
          </div>

          {/* Portfolio Progression Line Chart */}
          <PortfolioLineChart
            data={match.portfolioHistory}
            agent1Name="Agent Alpha"
            agent2Name="Agent Beta"
          />

          {/* Strategic Turning Points & Deliberations */}
          <div className="bg-white rounded-lg border-[1.5px] border-black p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 border-b-[1.5px] border-black pb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span className="text-xs font-black uppercase tracking-wider text-black">
                Critical Agent Turning Points & Thought Logic
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {match.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-neutral-50 rounded-md border border-black flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-[#c9daf8] text-black border border-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                        Turn {m.turn}
                      </span>
                      <span className="font-extrabold text-black uppercase">
                        {m.agentName}: {m.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                      {m.type}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-neutral-700 italic border-l-2 border-black pl-2 my-0.5">
                    &ldquo;{m.thought}&rdquo;
                  </p>

                  <span className="text-[10px] font-bold text-emerald-800">
                    Impact: {m.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
