import React from 'react';
import { useGame } from '../../context/GameContext';
import { Play, Pause, FastForward, Zap, RotateCcw } from 'lucide-react';

export const TopNav: React.FC = () => {
  const { state, dispatch } = useGame();

  return (
    <header className="w-full bg-white border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between shadow-2xs select-none">
      {/* Left: Brand & Turn Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-700 text-white font-black text-base flex items-center justify-center shadow-xs">
            M
          </span>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold text-neutral-900 tracking-tight leading-none">
              Monopoly Classic
            </h1>
            <span className="text-[10px] text-neutral-500 font-medium">8-Player AI Match</span>
          </div>
        </div>

        <div className="h-4 w-px bg-neutral-200 mx-1 hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-full text-xs font-bold text-neutral-700">
          <span>Turn</span>
          <span className="text-blue-700 font-black tabular-nums">#{state.turnNumber}</span>
        </div>
      </div>

      {/* Right Controls: Bot Speed & Game Actions */}
      <div className="flex items-center gap-2">
        {/* Bot Speed Switcher */}
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_BOT_SPEED', payload: { speed: 'normal' } })}
            className={`px-2 py-1 rounded-md font-bold transition-all ${
              state.botSpeed === 'normal'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Normal bot speed (650ms per step)"
          >
            Normal
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_BOT_SPEED', payload: { speed: 'fast' } })}
            className={`px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
              state.botSpeed === 'fast'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Fast bot speed (200ms per step)"
          >
            <FastForward className="w-3 h-3" /> Fast
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_BOT_SPEED', payload: { speed: 'instant' } })}
            className={`px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-all ${
              state.botSpeed === 'instant'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
            title="Instant bot speed (Skip wait between bot turns)"
          >
            <Zap className="w-3 h-3" /> Instant
          </button>
        </div>

        {/* Auto-play Toggle */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_AUTO_PLAY' })}
          className={`p-1.5 rounded-lg border transition-all ${
            state.isAutoPlaying
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title={state.isAutoPlaying ? 'Pause bots' : 'Resume bots'}
        >
          {state.isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* New Game / Restart */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Start a fresh 8-player match?')) {
              dispatch({ type: 'RESET_GAME' });
            }
          }}
          className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-all"
          title="Restart match"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
