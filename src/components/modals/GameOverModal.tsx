import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { SQUARES } from '../../data/boardData';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Building, DollarSign } from 'lucide-react';

export const GameOverModal: React.FC = () => {
  const { state, dispatch } = useGame();

  if (state.turnPhase !== 'GAME_OVER') return null;

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

  const winner = state.gameWinnerId !== null ? state.players[state.gameWinnerId] : state.players[0];

  // Calculate Net Worth for each player
  const playerRankings = state.players
    .map((p) => {
      let propertyWealth = 0;
      let houseCount = 0;

      Object.values(state.properties).forEach((prop) => {
        if (prop.ownerId === p.id) {
          const sq = SQUARES[prop.index];
          if (sq) {
            propertyWealth += prop.isMortgaged ? (sq.price || 0) * 0.5 : (sq.price || 0);
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
    <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Top Winner Banner */}
        <div className="p-6 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white text-center flex flex-col items-center select-none relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-400 text-neutral-950 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-amber-400/20">
            <Trophy className="w-9 h-9 stroke-[2.2]" />
          </div>

          <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest">
            Match Concluded
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-0.5">
            {winner?.name} is the Victor!
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">
            Survived all 8 players to establish the ultimate real estate empire.
          </p>
        </div>

        {/* Standings List */}
        <div className="p-5 flex flex-col gap-2 max-h-72 overflow-y-auto">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
            Final Standings & Net Worth
          </span>

          {playerRankings.map((rank, idx) => {
            const isWinner = idx === 0;
            const p = rank.player;

            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                  isWinner
                    ? 'bg-amber-50/70 border-amber-300 font-bold text-amber-950 shadow-xs'
                    : p.isBankrupt
                    ? 'bg-neutral-50 border-neutral-200 text-neutral-400'
                    : 'bg-white border-neutral-200 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isWinner ? 'bg-amber-400 text-neutral-950' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <span className="text-base">{p.token.icon}</span>

                  <div className="flex flex-col">
                    <span className="font-bold">
                      {p.name} {p.id === 0 && '(You)'}
                    </span>
                    {p.isBankrupt && (
                      <span className="text-[10px] text-red-500 font-medium">Bankrupt</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-extrabold text-sm tabular-nums text-neutral-900">
                    ${rank.netWorth}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Cash: ${p.money}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-center">
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_GAME' })}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" /> Start New 8-Player Match
          </button>
        </div>
      </div>
    </div>
  );
};
