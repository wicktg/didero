import React from "react";
import { useGame } from "../../context/GameContext";
import { ArrowLeftRight, Shield, UserX } from "lucide-react";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";

import { formatDID } from "../../utils/didUtils";

export const PlayerLeaderboard: React.FC = () => {
  const { state, setIsTradeModalOpen, setTradeRecipientId, moneyDeltas } =
    useGame();

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center justify-between text-[9px] font-extrabold text-neutral-700 uppercase tracking-widest px-1">
        <span>Player Standings</span>
        <span>Balance</span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[700px] overflow-y-auto pr-1">
        {state.players.map((player) => {
          const isCurrentTurn = state.currentTurnPlayerId === player.id;
          const isHuman = player.id === 0;
          const delta = moneyDeltas[player.id];

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
              className={`p-2.5 rounded-md border-[1.5px] border-black text-xs flex items-center justify-between transition-colors select-none ${
                isCurrentTurn
                  ? "bg-[#c9daf8] font-bold"
                  : player.isBankrupt
                  ? "bg-neutral-100 opacity-50 grayscale"
                  : "bg-white hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* GitHub-style Identicon Avatar */}
                <IdenticonAvatar
                  name={player.did || player.name}
                  size={28}
                  color={player.token.color}
                />

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-black font-mono text-black uppercase tracking-tight truncate max-w-[110px] ${
                        player.isBankrupt ? "line-through text-neutral-400" : ""
                      }`}
                    >
                      {formatDID(player.did || player.name, player.id)}
                    </span>
                    {isHuman && (
                      <span className="bg-[#ffc905] text-black text-[8px] font-black px-1.5 py-0.5 rounded-xs border border-black uppercase tracking-wider">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-neutral-600 uppercase tracking-wider mt-0.5">
                    {player.isBankrupt ? (
                      <span className="text-[#eb1c24] font-bold flex items-center gap-0.5">
                        <UserX className="w-3 h-3" /> Bankrupt
                      </span>
                    ) : player.inJail ? (
                      <span className="text-black font-bold flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> Jail (
                        {player.jailTurns + 1}/3)
                      </span>
                    ) : (
                      <span>
                        {propCount} Props {houseCount > 0 && `• ${houseCount} Houses`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end">
                  <span
                    className={`font-extrabold tabular-nums text-xs ${
                      player.money < 0 ? "text-[#eb1c24]" : "text-black"
                    }`}
                  >
                    ${player.money}
                  </span>
                  {delta !== undefined && delta !== 0 && (
                    <span
                      className={`text-[8px] font-bold tabular-nums px-1 py-px rounded border border-black ${
                        delta > 0
                          ? "bg-[#a5cd39] text-black"
                          : "bg-[#eb1c24] text-white"
                      }`}
                    >
                      {delta > 0 ? `+$${delta}` : `-$${Math.abs(delta)}`}
                    </span>
                  )}
                </div>

                {!isHuman && !player.isBankrupt && (
                  <button
                    type="button"
                    onClick={() => {
                      setTradeRecipientId(player.id);
                      setIsTradeModalOpen(true);
                    }}
                    className="p-1.5 rounded bg-white hover:bg-neutral-100 text-black border border-black transition-colors"
                    title={`Trade with ${player.name}`}
                  >
                    <ArrowLeftRight className="w-3 h-3" />
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
