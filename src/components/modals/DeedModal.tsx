import React from "react";
import { useGame } from "../../context/GameContext";
import { SQUARES } from "../../data/boardData";
import {
  canBuildHouse,
  canSellHouse,
  canMortgageProperty,
  canUnmortgageProperty,
} from "../../engine/gameEngine";
import {
  X,
  Plus,
  Minus,
  KeyRound,
  Check,
  Train,
  Zap,
  Droplets,
} from "lucide-react";
import { formatDID } from "../../utils/didUtils";

export const DeedModal: React.FC = () => {
  const { state, dispatch, inspectedPropertyIndex, setInspectedPropertyIndex } =
    useGame();
  if (inspectedPropertyIndex === null) return null;

  const square = SQUARES[inspectedPropertyIndex];
  const prop = state.properties[inspectedPropertyIndex];
  if (!square || !prop) return null;

  const owner = prop.ownerId !== null ? state.players[prop.ownerId] : null;
  const isHumanOwner = prop.ownerId === 0;
  const isCurrentTurnHuman = state.currentTurnPlayerId === 0;

  const canBuild =
    isHumanOwner &&
    isCurrentTurnHuman &&
    canBuildHouse(state, 0, inspectedPropertyIndex);
  const canSell =
    isHumanOwner &&
    isCurrentTurnHuman &&
    canSellHouse(state, 0, inspectedPropertyIndex);
  const canMortgage =
    isHumanOwner &&
    isCurrentTurnHuman &&
    canMortgageProperty(state, 0, inspectedPropertyIndex);
  const canUnmortgage =
    isHumanOwner &&
    isCurrentTurnHuman &&
    canUnmortgageProperty(state, 0, inspectedPropertyIndex);

  const mortgageValue = Math.round((square.price || 0) * 0.5);
  const unmortgageCost = Math.round((square.price || 0) * 0.55);

  const renderDeedBody = () => {
    if (square.type === "STREET" && square.rent) {
      const rentLabels = [
        "Base Rent",
        "With 1 House",
        "With 2 Houses",
        "With 3 Houses",
        "With 4 Houses",
        "With Hotel",
      ];
      return (
        <div className="flex flex-col text-xs text-black">
          <div className="divide-y-[1.5px] divide-black border-b-[1.5px] border-black">
            {square.rent.map((r, i) => (
              <div
                key={i}
                className={`flex justify-between py-1.5 px-2 ${
                  i === 5
                    ? "font-bold bg-[#eb1c24] text-white"
                    : i % 2 === 0
                      ? "bg-neutral-50"
                      : "bg-white"
                }`}
              >
                <span className="font-semibold">{rentLabels[i]}</span>
                <span className="font-extrabold tabular-nums">${r}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-black">
            <div className="p-1.5 bg-neutral-100 border border-black rounded">
              House Cost:{" "}
              <span className="font-extrabold tabular-nums">
                ${square.housePrice}
              </span>
            </div>
            <div className="p-1.5 bg-neutral-100 border border-black rounded">
              Hotel Cost:{" "}
              <span className="font-extrabold tabular-nums">
                ${square.housePrice}
              </span>
            </div>
            <div className="p-1.5 bg-neutral-100 border border-black rounded">
              Mortgage:{" "}
              <span className="font-extrabold tabular-nums">
                ${mortgageValue}
              </span>
            </div>
            <div className="p-1.5 bg-neutral-100 border border-black rounded">
              Unmortgage:{" "}
              <span className="font-extrabold tabular-nums">
                ${unmortgageCost}
              </span>
            </div>
          </div>
        </div>
      );
    }
    if (square.type === "RAILROAD") {
      return (
        <div className="flex flex-col gap-1 text-xs text-black py-2">
          <div className="flex justify-center my-2">
            <Train className="w-8 h-8 text-black" />
          </div>
          <div className="divide-y-[1.5px] divide-black border-y-[1.5px] border-black">
            {[
              ["1 Railroad", 25],
              ["2 Railroads", 50],
              ["3 Railroads", 100],
              ["4 Railroads", 200],
            ].map(([label, rent], i) => (
              <div
                key={i}
                className="flex justify-between py-1.5 px-2 bg-white"
              >
                <span className="font-semibold">{label}</span>
                <span className="font-extrabold tabular-nums">${rent}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (square.type === "UTILITY") {
      return (
        <div className="flex flex-col gap-3 text-xs text-black py-4 text-center">
          <div className="flex justify-center my-1">
            {square.index === 12 ? (
              <Zap className="w-8 h-8 text-black" />
            ) : (
              <Droplets className="w-8 h-8 text-black" />
            )}
          </div>
          <div className="p-2 bg-neutral-100 border-[1.5px] border-black rounded font-bold">
            If 1 Utility is owned: Rent is 4× dice roll
          </div>
          <div className="p-2 bg-neutral-100 border-[1.5px] border-black rounded font-bold">
            If 2 Utilities are owned: Rent is 10× dice roll
          </div>
        </div>
      );
    }
    return (
      <div className="py-6 text-center text-black font-semibold text-xs">
        {square.type === "GO" && "Collect $200 salary when you pass."}
        {square.type === "JAIL" &&
          "Just visiting, or locked until bail/doubles."}
        {square.type === "FREE_PARKING" && "Safe haven. No fees."}
        {square.type === "GO_TO_JAIL" && "Go directly to Jail."}
        {square.type === "TAX" && `Pay $${square.taxAmount} to the Bank.`}
        {square.type === "CHANCE" && "Draw a Chance card."}
        {square.type === "COMMUNITY_CHEST" && "Draw a Community Chest card."}
      </div>
    );
  };

  const btnBase =
    "py-2 px-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-[1.5px] border-black transition-colors active:translate-y-px";
  const btnDisabled =
    "bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={() => setInspectedPropertyIndex(null)}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-lg border-2 border-black overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setInspectedPropertyIndex(null)}
          className="absolute top-3 right-3 p-1 rounded bg-white hover:bg-neutral-100 text-black border border-black transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Deed Header */}
        {square.color ? (
          <div
            className="p-4 text-center text-white border-b-2 border-black select-none"
            style={{ backgroundColor: square.color }}
          >
            <span className="text-[9px] font-extrabold tracking-widest uppercase text-white/90">
              TITLE DEED
            </span>
            <h3 className="text-base font-extrabold uppercase tracking-wide mt-0.5">
              {square.name}
            </h3>
          </div>
        ) : (
          <div className="p-4 text-center bg-[#c9daf8] border-b-2 border-black select-none">
            <span className="text-[9px] font-extrabold tracking-widest uppercase text-neutral-700">
              BOARD SQUARE
            </span>
            <h3 className="text-base font-extrabold text-black uppercase tracking-wide mt-0.5">
              {square.name}
            </h3>
          </div>
        )}

        {/* Deed Body */}
        <div className="p-4">{renderDeedBody()}</div>

        {/* Ownership Status */}
        <div className="px-4 py-2 bg-neutral-100 border-t-2 border-black flex items-center justify-between text-xs font-bold select-none">
          <span className="text-neutral-600 uppercase tracking-wider text-[10px]">
            Owner
          </span>
          {owner ? (
            <div className="flex items-center gap-1.5">
              <span className="text-black font-mono font-black uppercase tracking-tight">
                {formatDID(owner.did || owner.name, owner.id)}
              </span>
              {isHumanOwner && (
                <span className="bg-[#ffc905] text-black text-[8px] font-black px-1.5 py-0.5 rounded-xs border border-black uppercase tracking-wider">
                  YOU
                </span>
              )}
            </div>
          ) : (
            <span className="text-neutral-500 uppercase tracking-wider">
              Unowned (${square.price || "N/A"})
            </span>
          )}
        </div>

        {/* Interactive Management Controls */}
        {isHumanOwner && (
          <div className="p-3 bg-[#c9daf8] border-t-2 border-black flex flex-col gap-2">
            {/* Mobile Lock Banner */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 py-1 text-[10px] font-black uppercase text-neutral-800 text-center">
              <span>Actions locked on mobile</span>
            </div>

            {/* Desktop Property Actions */}
            <div className="hidden sm:flex flex-col gap-2">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-black text-center">
                Property Actions
              </span>

              {/* Build & Sell Houses */}
              {square.type === "STREET" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!canBuild}
                    onClick={() =>
                      dispatch({
                        type: "BUILD_HOUSE",
                        payload: { propertyIndex: inspectedPropertyIndex },
                      })
                    }
                    className={`${btnBase} ${
                      canBuild
                        ? "bg-[#a5cd39] hover:bg-[#94b833] text-black"
                        : btnDisabled
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Build ( ${square.housePrice})
                  </button>

                  <button
                    type="button"
                    disabled={!canSell}
                    onClick={() =>
                      dispatch({
                        type: "SELL_HOUSE",
                        payload: { propertyIndex: inspectedPropertyIndex },
                      })
                    }
                    className={`${btnBase} ${
                      canSell
                        ? "bg-[#ffc905] hover:bg-[#e6b504] text-black"
                        : btnDisabled
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> Sell ( $
                    {Math.round((square.housePrice || 0) * 0.5)})
                  </button>
                </div>
              )}

              {/* Mortgage & Unmortgage */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!canMortgage}
                  onClick={() =>
                    dispatch({
                      type: "MORTGAGE_PROPERTY",
                      payload: { propertyIndex: inspectedPropertyIndex },
                    })
                  }
                  className={`${btnBase} ${
                    canMortgage
                      ? "bg-[#eb1c24] hover:bg-[#d61920] text-white"
                      : btnDisabled
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> Mortgage (+ $
                  {mortgageValue})
                </button>

                <button
                  type="button"
                  disabled={!canUnmortgage}
                  onClick={() =>
                    dispatch({
                      type: "UNMORTGAGE_PROPERTY",
                      payload: { propertyIndex: inspectedPropertyIndex },
                    })
                  }
                  className={`${btnBase} ${
                    canUnmortgage
                      ? "bg-[#008ed2] hover:bg-[#007cb8] text-white"
                      : btnDisabled
                  }`}
                >
                  <Check className="w-3.5 h-3.5" /> Unmortgage (- $
                  {unmortgageCost})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
