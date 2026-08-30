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

export const GameLayout: React.FC = () => {
  const { selectedTab, setSelectedTab } = useGame();

  return (
    <div className="min-h-screen bg-board-canvas text-neutral-900 flex flex-col font-sans">
      <TopNav />

      <main className="flex-1 max-w-[1180px] w-full mx-auto p-3 sm:p-5 pt-16 sm:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Board */}
        <section className="lg:col-span-8 flex flex-col items-center justify-start w-full">
          <MonopolyBoard />
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4 bg-white rounded-lg border-2 border-black overflow-hidden flex flex-col h-[660px] sticky top-16">
          {/* Tab Switcher */}
          <div className="grid grid-cols-3 bg-white p-1 border-b-2 border-black text-[11px] font-bold select-none">
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
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedTab(tab)}
                  className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 ${
                    selectedTab === tab
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
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

      <DeedModal />
      <AuctionModal />
      <TradeModal />
      <GameOverModal />
    </div>
  );
};
