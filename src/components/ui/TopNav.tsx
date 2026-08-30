import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { SettingsModal } from "../modals/SettingsModal";
import { LayoutGrid, BarChart2, Settings, Play, Pause } from "lucide-react";

export const TopNav: React.FC = () => {
  const {
    setSelectedTab,
    isAutonomousRunning,
    toggleAutonomous,
    secondsUntilNextTurn,
  } = useGame();
  const [activeMenu, setActiveMenu] = useState<"board" | "stats" | "settings">(
    "board",
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleMenuClick = (menu: "board" | "stats" | "settings") => {
    setActiveMenu(menu);
    if (menu === "board") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (menu === "stats") {
      setSelectedTab("leaderboard");
      const asideEl = document.querySelector("aside");
      if (asideEl) {
        asideEl.scrollIntoView({ behavior: "smooth" });
      }
    } else if (menu === "settings") {
      setIsSettingsOpen(true);
    }
  };

  return (
    <>
      <header className="fixed top-3 inset-x-0 mx-auto w-max z-50 bg-white border-2 border-black rounded-lg p-1 flex items-center select-none shadow-xs pointer-events-auto">
        {/* 3 Menu Items: Board, Stats, Settings */}
        <nav className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleMenuClick("board")}
            className={`px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
              activeMenu === "board"
                ? "bg-[#c9daf8] text-black border-black font-black"
                : "bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-transparent"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Board
          </button>

          <button
            type="button"
            onClick={() => handleMenuClick("stats")}
            className={`px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
              activeMenu === "stats"
                ? "bg-[#c9daf8] text-black border-black font-black"
                : "bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-transparent"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Stats
          </button>

          <button
            type="button"
            onClick={() => handleMenuClick("settings")}
            className={`px-3 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
              isSettingsOpen
                ? "bg-[#c9daf8] text-black border-black font-black"
                : "bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-transparent"
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </nav>
      </header>

      {/* Fixed top-right Play Game / Pause Game Button */}
      <button
        type="button"
        onClick={toggleAutonomous}
        className={`fixed top-3 right-4 z-50 select-none shadow-xs transition-all duration-150 active:translate-y-px ${
          isAutonomousRunning
            ? "bg-[#a5cd39] text-black border-2 border-black font-black uppercase text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#94b833]"
            : "bg-[#ffc905] text-black border-2 border-black font-black uppercase text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-[#e6b504]"
        }`}
        title={
          isAutonomousRunning
            ? "Pause autonomous match"
            : "Start autonomous match"
        }
      >
        {isAutonomousRunning ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
            </span>
            <Pause className="w-3.5 h-3.5 fill-black" />
            <span>Pause Game ({secondsUntilNextTurn}s)</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Play Game</span>
          </>
        )}
      </button>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setActiveMenu("board");
        }}
      />
    </>
  );
};
