import React from "react";
import { useGame } from "../../context/GameContext";
import { LayoutGrid, BarChart2, Settings, Play, Pause } from "lucide-react";

export const TopNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isAutonomousRunning,
    toggleAutonomous,
    secondsUntilNextTurn,
  } = useGame();

  const handleMenuClick = (menu: "board" | "stats" | "settings") => {
    setActiveView(menu);
  };

  return (
    <>
      <header className="fixed top-2.5 sm:top-3.5 left-0 right-0 mx-auto w-full z-50 flex items-center justify-center px-3 sm:px-4 pointer-events-none select-none">
        <div className="pointer-events-auto bg-white border-[1.5px] border-black rounded-lg p-1 flex items-center gap-1 sm:gap-1.5 shadow-xs">
          {/* Navigation Items: Board, Stats, Settings */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => handleMenuClick("board")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-colors border ${
                activeView === "board"
                  ? "bg-[#c9daf8] text-black border-black font-black"
                  : "bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-transparent cursor-pointer"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Board
            </button>

            <button
              type="button"
              onClick={() => handleMenuClick("stats")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-colors border ${
                activeView === "stats"
                  ? "bg-[#c9daf8] text-black border-black font-black"
                  : "bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-transparent cursor-pointer"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" /> Stats
            </button>

            <button
              type="button"
              onClick={() => handleMenuClick("settings")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-colors border ${
                activeView === "settings"
                  ? "bg-[#c9daf8] text-black border-black font-black"
                  : "bg-white text-neutral-700 hover:text-black hover:bg-neutral-100 border-transparent cursor-pointer"
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </button>
          </nav>

          {/* Divider (Desktop Only) */}
          <div className="hidden sm:block w-px h-5 bg-neutral-300 mx-0.5" />

          {/* Play Game / Pause Game Button (Desktop Only) */}
          <button
            type="button"
            onClick={toggleAutonomous}
            className={`hidden sm:flex select-none transition-colors duration-150 active:translate-y-px overflow-hidden shrink-0 ${
              isAutonomousRunning
                ? "bg-[#a5cd39] text-black border-[1.5px] border-black font-black uppercase text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-md items-center gap-1.5 hover:bg-[#94b833] cursor-pointer"
                : "bg-[#ffc905] text-black border-[1.5px] border-black font-black uppercase text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-md items-center gap-1.5 hover:bg-[#e6b504] cursor-pointer"
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
                <span>Pause ({secondsUntilNextTurn}s)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Play Game</span>
              </>
            )}
          </button>
        </div>
      </header>
    </>
  );
};
