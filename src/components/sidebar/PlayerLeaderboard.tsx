import React from 'react';
import { useGame } from '../../context/GameContext';
import { ArrowLeftRight, Building, Shield, UserX } from 'lucide-react';

export const PlayerLeaderboard: React.FC = () => {
  const { state, setIsTradeModalOpen, setTradeRecipientId } = useGame();

  const handleTradeWithPlayer = (playerId: number) => {
    if (playerId === 0) return;
    setTradeRecipientId(playerId);
    setIsTradeModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
        <span>Players (8)</span>
        <span>Balance & Assets</span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[480px] overflow-y-auto pr-1">
        {state.players.map((player) => {
          const isCurrentTurn = state.currentTurnPlayerId === player.id;
          const isHuman = player.id === 0;

          // Count owned properties & houses
          let propCount = 0;
          let houseCount = 0;
          Object.values(state.properties).forEach((prop) => {
            if (prop.ownerId === player.id) {
              propCount++;
              houseCount += prop.houses;
            }
          });

          return (
            <div
              key={player.id}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all select-none ${
                isCurrentTurn
                  ? 'bg-blue-50/80 border-blue-400 font-bold shadow-xs'
                  : player.isBankrupt
                  ? 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-60'
                  : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-300'
              }`}
            >
              {/* Left Info: Avatar + Name + Badges */}
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-2xs shrink-0"
                  style={{ backgroundColor: player.token.color, color: '#FFF' }}
                  title={player.token.name}
                >
                  {player.token.icon}
                </span>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-neutral-900 truncate max-w-[100px]">
                      {player.name}
                    </span>
                    {isHuman && (
                      <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                        YOU
                      </span>
                    )}
                    {isCurrentTurn && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                    )}
                  </div>

                  {/* Badges & Property Counts */}
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
                    {player.isBankrupt ? (
                      <span className="text-red-600 font-bold flex items-center gap-0.5">
                        <UserX className="w-3 h-3" /> Bankrupt
                      </span>
                    ) : player.inJail ? (
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> In Jail ({player.jailTurns + 1}/3)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-neutral-400" /> {propCount} props {houseCount > 0 && `(${houseCount}H)`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Cash + Trade Button */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span
                    className={`font-black tabular-nums text-sm ${
                      player.money < 0 ? 'text-red-600' : 'text-neutral-900'
                    }`}
                  >
                    ${player.money}
                  </span>
                </div>

                {!isHuman && !player.isBankrupt && (
                  <button
                    type="button"
                    onClick={() => handleTradeWithPlayer(player.id)}
                    className="p-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-all"
                    title={`Trade with ${player.name}`}
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
