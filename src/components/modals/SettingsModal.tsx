import React from "react";
import { useGame } from "../../context/GameContext";
import {
  X,
  Sliders,
  FastForward,
  Zap,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, dispatch } = useGame();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-lg border-2 border-black overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Light Header with Board Blue */}
        <div className="p-3.5 bg-[#c9daf8] text-black flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-black" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-black">
              Game Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-white hover:bg-neutral-100 text-black border border-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 bg-white">
          {/* Bot Speed Option */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-black">
              Bot Turn Speed
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(["normal", "fast", "instant"] as const).map((speed) => {
                const icons = { normal: null, fast: FastForward, instant: Zap };
                const labels = {
                  normal: "Normal",
                  fast: "Fast",
                  instant: "Instant",
                };
                const Icon = icons[speed];
                const isActive = state.botSpeed === speed;
                return (
                  <button
                    key={speed}
                    type="button"
                    onClick={() =>
                      dispatch({ type: "SET_BOT_SPEED", payload: { speed } })
                    }
                    className={`py-2 px-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 border-[1.5px] border-black transition-colors ${
                      isActive
                        ? "bg-[#c9daf8] text-black font-black"
                        : "bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3 text-black" />}{" "}
                    {labels[speed]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-Play Toggle */}
          <div className="flex items-center justify-between pt-2 border-t-[1.5px] border-black">
            <div className="flex flex-col">
              <span className="text-xs font-extrabold uppercase tracking-wide text-black">
                Bot Auto-Play
              </span>
              <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">
                Automate bot turns
              </span>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "TOGGLE_AUTO_PLAY" })}
              className={`py-1.5 px-3 rounded-md border-[1.5px] border-black text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                state.isAutoPlaying
                  ? "bg-[#a5cd39] text-black hover:bg-[#94b833]"
                  : "bg-[#ffc905] text-black hover:bg-[#e6b504]"
              }`}
            >
              {state.isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Active
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Paused
                </>
              )}
            </button>
          </div>

          {/* Restart Match */}
          <div className="pt-2 border-t-[1.5px] border-black">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Start a fresh 2-player match?")) {
                  dispatch({ type: "RESET_GAME" });
                  onClose();
                }
              }}
              className="w-full py-2 bg-white hover:bg-neutral-100 text-black border-[1.5px] border-black rounded-md text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:translate-y-px"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Tournament Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
