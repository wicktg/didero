import React from "react";
import { useGame } from "../../context/GameContext";
import { TopNav } from "../ui/TopNav";
import { MonopolyBoard } from "../board/MonopolyBoard";
import { PlayerLeaderboard } from "../sidebar/PlayerLeaderboard";
import { PropertyManager } from "../sidebar/PropertyManager";
import { AgentThoughtFeed } from "../sidebar/AgentThoughtFeed";
import { DeedModal } from "../modals/DeedModal";
import { AuctionModal } from "../modals/AuctionModal";
import { TradeModal } from "../modals/TradeModal";
import { GameOverModal } from "../modals/GameOverModal";
import { Users, Building2, BrainCircuit } from "lucide-react";

import { StatsPage } from "../stats/StatsPage";

export const GameLayout: React.FC = () => {
  const { selectedTab, setSelectedTab, activeView } = useGame();

  return (
    <div className="h-screen bg-board-canvas text-neutral-900 flex flex-col font-sans overflow-hidden select-none">
      <TopNav />

      {activeView === "stats" ? (
        <main className="flex-1 max-w-[1080px] w-full mx-auto p-3 sm:p-5 pt-20 sm:pt-20 overflow-y-auto max-h-[calc(100vh-1rem)]">
          <StatsPage />
        </main>
      ) : (
        <main className="flex-1 max-w-[1080px] w-full mx-auto p-3 sm:p-5 pt-20 sm:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start overflow-hidden">
          {/* Board */}
          <section className="lg:col-span-8 flex flex-col items-center justify-start w-full">
            <MonopolyBoard />
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4 bg-white rounded-lg border-[1.5px] border-black overflow-hidden flex flex-col h-[590px] max-h-[calc(100vh-6rem)]">
            {/* Tab Switcher */}
            <div className="grid grid-cols-3 bg-white p-1 border-b-[1.5px] border-black text-[11px] font-bold select-none">
              {(["leaderboard", "properties", "log"] as const).map((tab) => {
                const icons = {
                  leaderboard: Users,
                  properties: Building2,
                  log: BrainCircuit,
                };
                const labels = {
                  leaderboard: "Standings",
                  properties: "Properties",
                  log: "Feed",
                };
                const Icon = icons[tab];
                const isActive = selectedTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedTab(tab)}
                    className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider text-[11px] font-extrabold border ${
                      isActive
                        ? "bg-[#c9daf8] text-black border-black font-black"
                        : "bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 border-transparent"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {labels[tab]}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedTab === "leaderboard" && <PlayerLeaderboard />}
              {selectedTab === "properties" && <PropertyManager />}
              {selectedTab === "log" && <AgentThoughtFeed />}
            </div>
          </aside>
        </main>
      )}

      <DeedModal />
      <AuctionModal />
      <TradeModal />
      <GameOverModal />
    </div>
  );
};
