import React from 'react';
import { useGame } from '../../context/GameContext';
import { TopNav } from '../ui/TopNav';
import { MonopolyBoard } from '../board/MonopolyBoard';
import { PlayerLeaderboard } from '../sidebar/PlayerLeaderboard';
import { PropertyManager } from '../sidebar/PropertyManager';
import { EventLog } from '../sidebar/EventLog';
import { DeedModal } from '../modals/DeedModal';
import { AuctionModal } from '../modals/AuctionModal';
import { TradeModal } from '../modals/TradeModal';
import { GameOverModal } from '../modals/GameOverModal';
import { Users, Building2, ScrollText } from 'lucide-react';

export const GameLayout: React.FC = () => {
  const { selectedTab, setSelectedTab } = useGame();

  return (
    <div className="min-h-screen bg-board-canvas text-neutral-900 flex flex-col font-sans">
      {/* Top Header */}
      <TopNav />

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Interactive Monopoly Board Arena */}
        <section className="lg:col-span-8 flex flex-col items-center justify-center">
          <MonopolyBoard />
        </section>

        {/* Right Column: Game Management Sidebar */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-neutral-300 shadow-sm overflow-hidden flex flex-col h-[820px] sticky top-4">
          {/* Sidebar Tab Header */}
          <div className="grid grid-cols-3 bg-neutral-100 p-1 border-b border-neutral-200 text-xs font-bold select-none">
            <button
              type="button"
              onClick={() => setSelectedTab('leaderboard')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedTab === 'leaderboard'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Standings
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('properties')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedTab === 'properties'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Properties
            </button>

            <button
              type="button"
              onClick={() => setSelectedTab('log')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedTab === 'log'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" /> Feed
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto">
            {selectedTab === 'leaderboard' && <PlayerLeaderboard />}
            {selectedTab === 'properties' && <PropertyManager />}
            {selectedTab === 'log' && <EventLog />}
          </div>
        </aside>
      </main>

      {/* Global Interactive Modals */}
      <DeedModal />
      <AuctionModal />
      <TradeModal />
      <GameOverModal />
    </div>
  );
};
