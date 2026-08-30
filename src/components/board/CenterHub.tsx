import React from "react";
import { useGame } from "../../context/GameContext";
import { DiceCup } from "./DiceCup";
import { ActionControls } from "./ActionControls";
import { CardReveal } from "./CardReveal";
import { ArrowLeftRight, Building } from "lucide-react";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";

export const CenterHub: React.FC = () => {
  const { state, setIsTradeModalOpen, setSelectedTab, moneyDeltas } = useGame();

  const activePlayer = state.players[state.currentTurnPlayerId];
  const delta = moneyDeltas[activePlayer.id];

  return (
    <div className="w-full flex flex-col items-center gap-3 select-none">
      {/* Active Player Status Header */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-white border-[1.5px] border-black rounded-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <IdenticonAvatar
            name={activePlayer.name}
            size={28}
            color={activePlayer.token.color}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-extrabold text-black uppercase tracking-wide truncate">
              {activePlayer.name}
            </span>
            <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">
              {activePlayer.isAI ? "Bot Player" : "Human Player"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <span className="text-sm font-black text-black tabular-nums">
            ${activePlayer.money}
          </span>
          {delta !== undefined && delta !== 0 && (
            <span
              className={`text-[9px] font-extrabold tabular-nums px-1 py-0.5 rounded border border-black ${
                delta > 0
                  ? "bg-[#a5cd39] text-black"
                  : "bg-[#eb1c24] text-white"
              }`}
            >
              {delta > 0 ? `+$${delta}` : `-$${Math.abs(delta)}`}
            </span>
          )}
        </div>
      </div>

      {/* Dice Area */}
      <div className="w-full flex flex-col items-center">
        <DiceCup />
      </div>

      {/* Dynamic Card Reveal (Chance / Community Chest notifications) */}
      <CardReveal />

      {/* Primary Turn Actions */}
      <ActionControls />

      {/* Secondary Utilities Navigation */}
      <div className="w-full grid grid-cols-2 gap-1.5 pt-1 border-t-[1.5px] border-black">
        <button
          type="button"
          onClick={() => setIsTradeModalOpen(true)}
          className="py-1.5 px-2 bg-white hover:bg-neutral-100 text-black border-[1.5px] border-black rounded text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
        >
          <ArrowLeftRight className="w-3 h-3 text-[#008ed2]" /> Propose Trade
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab("properties")}
          className="py-1.5 px-2 bg-white hover:bg-neutral-100 text-black border-[1.5px] border-black rounded text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
        >
          <Building className="w-3 h-3 text-black" /> Portfolio
        </button>
      </div>
    </div>
  );
};
