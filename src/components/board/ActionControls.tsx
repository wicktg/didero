import React, { useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { SQUARES } from "../../data/boardData";
import { getActiveDecisionMakerId } from "../../hooks/useAutonomousRunner";
import {
  Dices,
  ShoppingCart,
  Gavel,
  ArrowRight,
  Shield,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { IdenticonAvatar } from "../ui/IdenticonAvatar";

export const ActionControls: React.FC = () => {
  const { state, dispatch, isAutonomousRunning, secondsUntilNextTurn } =
    useGame();

  const isHumanTurn = state.currentTurnPlayerId === 0;
  const human = state.players[0];
  const currentSquare = SQUARES[human.position];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName,
        )
      )
        return;
      if (isHumanTurn) {
        if (e.code === "Space" && state.turnPhase === "ROLL") {
          e.preventDefault();
          dispatch({ type: "ROLL_DICE" });
        } else if (e.code === "Enter" && state.turnPhase === "END_TURN") {
          e.preventDefault();
          dispatch({ type: "END_TURN" });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHumanTurn, state.turnPhase, dispatch]);

  // If autonomous mode is active, display the autonomous match status card
  if (isAutonomousRunning) {
    const activePlayerId = getActiveDecisionMakerId(state);
    const activeAgent = state.players[activePlayerId];
    const phaseLabel =
      state.turnPhase === "ROLL"
        ? "Rolling dice & moving..."
        : state.turnPhase === "LANDED_ACTION"
          ? "Evaluating property acquisition..."
          : state.turnPhase === "AUCTION"
            ? "Auction in progress..."
            : state.turnPhase === "TRADE"
              ? "Evaluating trade offer..."
              : state.turnPhase === "DEBT_RESOLUTION"
                ? "Resolving outstanding debt..."
                : state.turnPhase === "GAME_OVER"
                  ? "Match finished!"
                  : "Concluding turn...";

    const progressPercent = Math.min(
      100,
      Math.max(0, ((5 - secondsUntilNextTurn) / 5) * 100),
    );

    return (
      <div className="flex flex-col gap-2 p-3 bg-white border-2 border-black rounded-lg text-center select-none shadow-xs animate-card-slide-in">
        {/* Top Header: Autonomous Mode Active & Countdown Badge */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a5cd39] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a5cd39]"></span>
            </span>
            <Sparkles className="w-3 h-3 text-[#008ed2]" />
            <span>Autonomous Match</span>
          </div>
          <div className="text-[10px] font-mono font-black text-black bg-[#ffc905] px-1.5 py-0.5 rounded border border-black shadow-2xs">
            {secondsUntilNextTurn}s
          </div>
        </div>

        {/* Current Agent Info */}
        <div className="flex items-center justify-center gap-2">
          {activeAgent && (
            <IdenticonAvatar
              name={activeAgent.name}
              size={20}
              color={activeAgent.token.color}
            />
          )}
          <span className="text-xs font-black text-black uppercase tracking-wide">
            {activeAgent?.name || "Agent"}&apos;s Turn
          </span>
        </div>

        {/* Current Phase description */}
        <span className="text-[11px] font-extrabold text-neutral-600 uppercase tracking-wide">
          {phaseLabel}
        </span>

        {/* Countdown Progress Bar */}
        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden border border-neutral-300">
          <div
            className="bg-[#008ed2] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  if (!isHumanTurn) {
    const currentBot = state.players[state.currentTurnPlayerId];
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white border-2 border-black rounded-lg text-center select-none">
        <div className="flex items-center gap-2">
          {currentBot && (
            <IdenticonAvatar
              name={currentBot.name}
              size={18}
              color={currentBot.token.color}
            />
          )}
          <span className="text-xs font-black text-black uppercase tracking-wide">
            {currentBot?.name}&apos;s Turn
          </span>
        </div>
        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mt-1">
          {state.turnPhase === "ROLL"
            ? "Rolling dice..."
            : state.turnPhase === "LANDED_ACTION"
              ? "Evaluating property..."
              : state.turnPhase === "AUCTION"
                ? "Bidding..."
                : "Finishing turn..."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full select-none">
      {state.turnPhase === "ROLL" && (
        <div className="flex flex-col gap-1.5">
          {human.inJail ? (
            <div className="flex flex-col gap-1.5 bg-white border-2 border-black p-2.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-black uppercase tracking-wide">
                <Shield className="w-3.5 h-3.5" /> In Jail (Turn{" "}
                {human.jailTurns + 1}/3)
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {human.money >= 50 && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "PAY_JAIL_FINE" })}
                    className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-black border-[1.5px] border-black rounded-md text-[11px] font-extrabold uppercase tracking-wider transition-colors active:translate-y-px"
                  >
                    Pay $50 Fine
                  </button>
                )}
                {(human.getOutOfJailCards.chance > 0 ||
                  human.getOutOfJailCards.communityChest > 0) && (
                  <button
                    type="button"
                    onClick={() => {
                      const cardType =
                        human.getOutOfJailCards.chance > 0
                          ? "chance"
                          : "communityChest";
                      dispatch({
                        type: "USE_JAIL_CARD",
                        payload: { cardType },
                      });
                    }}
                    className="px-2.5 py-1.5 bg-[#ffc905] text-black border-[1.5px] border-black rounded-md text-[11px] font-extrabold uppercase tracking-wider transition-colors active:translate-y-px"
                  >
                    Use Card
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "ROLL_DICE" })}
                className="w-full py-2 bg-[#008ed2] text-white hover:bg-[#007cb8] border-2 border-black rounded-md text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:translate-y-px"
              >
                <Dices className="w-4 h-4 text-white" /> Roll for Doubles
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: "ROLL_DICE" })}
              className="w-full py-2.5 bg-[#008ed2] hover:bg-[#007cb8] text-white border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:translate-y-px"
            >
              <Dices className="w-4 h-4 text-white" /> Roll Dice
              <span className="text-[10px] text-blue-100 font-bold tracking-normal">
                [Space]
              </span>
            </button>
          )}
        </div>
      )}

      {state.turnPhase === "LANDED_ACTION" && currentSquare.price && (
        <div className="flex flex-col gap-1.5 bg-white border-2 border-black p-2.5 rounded-lg animate-card-slide-in">
          <div className="text-center">
            <span className="text-[9px] text-neutral-600 uppercase tracking-widest font-extrabold">
              Unowned Property
            </span>
            <div className="text-xs font-extrabold text-black uppercase tracking-wide">
              {currentSquare.name}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            <button
              type="button"
              disabled={human.money < currentSquare.price}
              onClick={() =>
                dispatch({
                  type: "BUY_PROPERTY",
                  payload: { propertyIndex: human.position },
                })
              }
              className={`py-2 px-2 rounded-md text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 border-[1.5px] border-black transition-colors active:translate-y-px ${
                human.money >= currentSquare.price
                  ? "bg-[#a5cd39] hover:bg-[#94b833] text-black"
                  : "bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Buy $
              {currentSquare.price}
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: "DECLINE_BUY",
                  payload: { propertyIndex: human.position },
                })
              }
              className="py-2 px-2 bg-white hover:bg-neutral-100 text-black border-[1.5px] border-black rounded-md text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors active:translate-y-px"
            >
              <Gavel className="w-3.5 h-3.5" /> Auction
            </button>
          </div>
        </div>
      )}

      {state.turnPhase === "DEBT_RESOLUTION" && (
        <div className="flex flex-col gap-1.5 bg-white border-2 border-[#eb1c24] p-2.5 rounded-lg animate-card-slide-in">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#eb1c24] uppercase tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5" /> In Debt ($
            {Math.abs(human.money)})
          </div>
          <p className="text-[10px] text-neutral-700 font-bold">
            Mortgage properties or sell houses to raise cash.
          </p>
          <div className="mt-1">
            {human.money >= 0 ? (
              <button
                type="button"
                onClick={() => dispatch({ type: "RESOLVE_DEBT" })}
                className="w-full py-2 bg-[#a5cd39] hover:bg-[#94b833] text-black border-2 border-black rounded-md text-xs font-black uppercase tracking-wider transition-colors active:translate-y-px"
              >
                Confirm Debt Cleared
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "DECLARE_BANKRUPTCY",
                    payload: { playerId: 0 },
                  })
                }
                className="w-full py-2 bg-[#eb1c24] hover:bg-[#d61920] text-white border-2 border-black rounded-md text-xs font-black uppercase tracking-wider transition-colors active:translate-y-px"
              >
                Declare Bankruptcy
              </button>
            )}
          </div>
        </div>
      )}

      {state.turnPhase === "END_TURN" && (
        <button
          type="button"
          onClick={() => dispatch({ type: "END_TURN" })}
          className="w-full py-2.5 bg-[#ffc905] hover:bg-[#e6b504] text-black border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:translate-y-px"
        >
          End Turn <ArrowRight className="w-4 h-4 text-black" />
          <span className="text-[10px] text-neutral-700 font-bold tracking-normal">
            [Enter]
          </span>
        </button>
      )}
    </div>
  );
};
