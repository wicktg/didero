import React, { useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { SQUARES } from "../../data/boardData";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw } from "lucide-react";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";
import { formatDID } from "../../utils/didUtils";

export const GameOverModal: React.FC = () => {
  const { state, dispatch } = useGame();

  if (state.turnPhase !== "GAME_OVER") return null;

  // Trigger celebration confetti
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, []);

  const winner =
    state.gameWinnerId !== null
      ? state.players[state.gameWinnerId]
      : state.players[0];

  // Calculate Net Worth for each player
  const playerRankings = state.players
    .map((p) => {
      let propertyWealth = 0;
      let houseCount = 0;

      Object.values(state.properties).forEach((prop) => {
        if (prop.ownerId === p.id) {
          const sq = SQUARES[prop.index];
          if (sq) {
            propertyWealth += prop.isMortgaged
              ? (sq.price || 0) * 0.5
              : sq.price || 0;
            if (prop.houses > 0) {
              houseCount += prop.houses;
              propertyWealth += prop.houses * (sq.housePrice || 0) * 0.5;
            }
          }
        }
      });

      const netWorth = p.isBankrupt ? 0 : p.money + propertyWealth;

      return {
        player: p,
        netWorth,
        houseCount,
      };
    })
    .sort((a, b) => b.netWorth - a.netWorth);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border-2 border-black overflow-hidden select-none">
        {/* Top Winner Banner with Gold Yellow */}
        <div className="p-5 bg-[#ffc905] text-black text-center flex flex-col items-center border-b-2 border-black">
          <div className="w-12 h-12 bg-white text-black rounded-md border-2 border-black flex items-center justify-center mb-2">
            <Trophy className="w-7 h-7" />
          </div>

          <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-800">
            Tournament Match Concluded
          </span>
          <h2 className="text-xl font-black uppercase tracking-wide mt-0.5 flex items-center gap-1.5 font-mono">
            <span>{formatDID(winner?.did || winner?.name, winner?.id)}</span>
            <span>is Victor!</span>
          </h2>
          <p className="text-[11px] font-bold text-neutral-800 mt-1 max-w-xs">
            Established the ultimate real estate monopoly against all opponents.
          </p>
        </div>

        {/* Standings List */}
        <div className="p-4 flex flex-col gap-2 max-h-72 overflow-y-auto bg-neutral-50/50">
          <span className="text-[10px] font-extrabold text-neutral-700 uppercase tracking-widest mb-1">
            Final Standings & Net Worth
          </span>

          {playerRankings.map((rank, idx) => {
            const isWinner = idx === 0;
            const p = rank.player;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2.5 rounded-md border-[1.5px] border-black text-xs font-bold ${
                  isWinner
                    ? "bg-[#c9daf8] text-black"
                    : p.isBankrupt
                    ? "bg-neutral-100 text-neutral-400 opacity-60"
                    : "bg-white text-black"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 bg-white text-black border border-black rounded text-[11px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <IdenticonAvatar
                    name={p.did || p.name}
                    size={22}
                    color={p.token.color}
                  />
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="uppercase font-mono font-black tracking-tight truncate">
                        {formatDID(p.did || p.name, p.id)}
                      </span>
                      {p.id === 0 && (
                        <span className="bg-[#ffc905] text-black text-[8px] font-black px-1.5 py-0.5 rounded-xs border border-black uppercase tracking-wider">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-wider">
                      {p.isBankrupt
                        ? "Bankrupted"
                        : `${rank.houseCount} houses built`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="font-extrabold tabular-nums text-xs">
                    ${rank.netWorth}
                  </span>
                  <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">
                    Net Worth
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t-2 border-black flex justify-end">
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET_GAME" })}
            className="w-full py-2.5 bg-[#a5cd39] hover:bg-[#94b833] text-black border-2 border-black rounded-md text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:translate-y-px"
          >
            <RotateCcw className="w-4 h-4" /> Start New Tournament Match
          </button>
        </div>
      </div>
    </div>
  );
};
