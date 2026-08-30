import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LogEntry } from '../../types/game';
import {
  Footprints,
  ShoppingCart,
  DollarSign,
  HelpCircle,
  Gavel,
  ArrowLeftRight,
  ShieldAlert,
  Hammer,
  KeyRound,
  UserX,
  Info,
} from 'lucide-react';

export const EventLog: React.FC = () => {
  const { state } = useGame();
  const [filter, setFilter] = useState<'all' | 'rent' | 'card' | 'market'>('all');

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'move':
        return <Footprints className="w-3.5 h-3.5 text-blue-600" />;
      case 'buy':
        return <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />;
      case 'rent':
        return <DollarSign className="w-3.5 h-3.5 text-amber-600" />;
      case 'card':
        return <HelpCircle className="w-3.5 h-3.5 text-purple-600" />;
      case 'auction':
        return <Gavel className="w-3.5 h-3.5 text-orange-600" />;
      case 'trade':
        return <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />;
      case 'jail':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-600" />;
      case 'build':
        return <Hammer className="w-3.5 h-3.5 text-green-600" />;
      case 'mortgage':
        return <KeyRound className="w-3.5 h-3.5 text-neutral-600" />;
      case 'bankruptcy':
        return <UserX className="w-3.5 h-3.5 text-red-700" />;
      default:
        return <Info className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  const filteredLogs = state.gameLog.filter((entry) => {
    if (filter === 'rent') return entry.type === 'rent';
    if (filter === 'card') return entry.type === 'card';
    if (filter === 'market') return ['buy', 'auction', 'trade', 'build', 'mortgage'].includes(entry.type);
    return true;
  });

  return (
    <div className="flex flex-col h-full p-3">
      {/* Filter Chips */}
      <div className="flex items-center gap-1 pb-2 mb-2 border-b border-neutral-200 text-[10px] overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-2 py-1 rounded-md font-semibold transition-all ${
            filter === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('rent')}
          className={`px-2 py-1 rounded-md font-semibold transition-all ${
            filter === 'rent' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Rents
        </button>
        <button
          type="button"
          onClick={() => setFilter('card')}
          className={`px-2 py-1 rounded-md font-semibold transition-all ${
            filter === 'card' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Cards
        </button>
        <button
          type="button"
          onClick={() => setFilter('market')}
          className={`px-2 py-1 rounded-md font-semibold transition-all ${
            filter === 'market' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Market
        </button>
      </div>

      {/* Feed List */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[440px] pr-1">
        {filteredLogs.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-2 p-2 bg-white rounded-lg border border-neutral-200 text-xs shadow-2xs leading-snug"
          >
            <div className="mt-0.5 shrink-0">{getLogIcon(entry.type)}</div>
            <span className="text-neutral-800 text-[11px] font-medium flex-1">
              {entry.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
