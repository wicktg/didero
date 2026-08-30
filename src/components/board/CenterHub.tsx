import React from 'react';
import { useGame } from '../../context/GameContext';
import { DiceCup } from './DiceCup';
import { ActionControls } from './ActionControls';
import { CardReveal } from './CardReveal';
import { ArrowLeftRight, Building } from 'lucide-react';

export const CenterHub: React.FC = () => {
  const { state, setIsTradeModalOpen, setSelectedTab } = useGame();

  const activePlayer = state.players[state.currentTurnPlayerId];

  return (
    <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-board-canvas/95 rounded-lg flex flex-col items-center justify-between p-4 relative overflow-hidden">
      {/* Top Header Watermark */}
      <div className="flex flex-col items-center select-none text-center">
        <div className="flex items-center gap-1.5 text-neutral-800">
          <span className="text-2xl font-black tracking-widest uppercase text-neutral-900 drop-shadow-2xs">
            MONOPOLY
          </span>
        </div>
        <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
          8-Player Strategic Tournament
        </span>
      </div>

      {/* Center Action & Dice Area */}
      <div className="flex flex-col items-center gap-3 my-auto w-full max-w-[320px]">
        {/* Active Player Status Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1 bg-white border border-neutral-300 rounded-full shadow-2xs"
          style={{ borderColor: activePlayer.token.color }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activePlayer.token.color }}
          />
          <span className="text-xs font-bold text-neutral-800">
            {activePlayer.name}'s Turn
          </span>
          <span className="text-xs font-bold text-emerald-700 tabular-nums">
            ${activePlayer.money}
          </span>
        </div>

        {/* Dice Cup */}
        <DiceCup dice={state.dice} />

        {/* Card Reveal Popover if card just drawn */}
        {state.lastDrawnCard && <CardReveal card={state.lastDrawnCard} />}

        {/* Action Controls */}
        <ActionControls />
      </div>

      {/* Bottom Center Quick Hub Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/80 w-full justify-center">
        <button
          type="button"
          onClick={() => {
            setIsTradeModalOpen(true);
          }}
          className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 flex items-center gap-1.5 shadow-2xs transition-all"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-neutral-600" /> Propose Trade
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab('properties')}
          className="px-3 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 flex items-center gap-1.5 shadow-2xs transition-all"
        >
          <Building className="w-3.5 h-3.5 text-neutral-600" /> My Properties
        </button>
      </div>
    </div>
  );
};
