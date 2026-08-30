import { useEffect, useRef } from "react";
import { GameState } from "../types/game";
import { GameAction } from "../engine/gameReducer";
import {
  evaluateBotBuy,
  evaluateBotAuctionBid,
  evaluateBotHouseBuilding,
  evaluateBotJail,
  evaluateBotDebtLiquidation,
} from "../ai/botDecisionEngine";
import { evaluateTradeForBot } from "../ai/tradeEvaluator";

export function useBotRunner(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
  options?: { disabled?: boolean },
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDelay = (speed: GameState["botSpeed"]) => {
    switch (speed) {
      case "instant":
        return 20;
      case "fast":
        return 200;
      case "normal":
      default:
        return 650;
    }
  };

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (
      options?.disabled ||
      state.turnPhase === "GAME_OVER" ||
      !state.isAutoPlaying
    ) {
      return;
    }

    const delay = getDelay(state.botSpeed);

    // 1. Handle Active Auction involving Bot
    if (state.turnPhase === "AUCTION" && state.activeAuction) {
      const currentBidderId = state.activeAuction.currentBidderId;
      const bidder = state.players[currentBidderId];

      if (bidder && bidder.isAI && !bidder.isBankrupt) {
        timeoutRef.current = setTimeout(() => {
          const decision = evaluateBotAuctionBid(state, currentBidderId);
          if (typeof decision === "number") {
            dispatch({
              type: "PLACE_AUCTION_BID",
              payload: { playerId: currentBidderId, amount: decision },
            });
          } else if (decision === "PASS") {
            dispatch({
              type: "PASS_AUCTION_BID",
              payload: { playerId: currentBidderId },
            });
          } else {
            dispatch({
              type: "EXIT_AUCTION",
              payload: { playerId: currentBidderId },
            });
          }
        }, delay);
      }
      return;
    }

    // 2. Handle Active Trade involving Bot Recipient
    if (state.turnPhase === "TRADE" && state.activeTrade) {
      const recipient = state.players[state.activeTrade.recipientId];
      if (recipient && recipient.isAI) {
        timeoutRef.current = setTimeout(() => {
          const accepted = evaluateTradeForBot(
            state,
            recipient.id,
            state.activeTrade!,
          );
          if (accepted) {
            dispatch({ type: "ACCEPT_TRADE" });
          } else {
            dispatch({ type: "REJECT_TRADE" });
          }
        }, delay);
      }
      return;
    }

    // 3. Handle Active Turn if Current Player is Bot
    const currentPlayer = state.players[state.currentTurnPlayerId];
    if (!currentPlayer || !currentPlayer.isAI || currentPlayer.isBankrupt) {
      return;
    }

    const botId = currentPlayer.id;

    // A. Bot Roll Phase
    if (state.turnPhase === "ROLL") {
      timeoutRef.current = setTimeout(() => {
        if (currentPlayer.inJail) {
          const jailDecision = evaluateBotJail(state, botId);
          if (jailDecision === "USE_CARD") {
            const cardType =
              currentPlayer.getOutOfJailCards.chance > 0
                ? "chance"
                : "communityChest";
            dispatch({
              type: "USE_JAIL_CARD",
              payload: { cardType, playerId: botId },
            });
            return;
          } else if (jailDecision === "PAY_FINE") {
            dispatch({ type: "PAY_JAIL_FINE", payload: { playerId: botId } });
            return;
          }
        }
        dispatch({ type: "ROLL_DICE" });
      }, delay);
      return;
    }

    // B. Bot Landed Action Phase (Unowned Property)
    if (state.turnPhase === "LANDED_ACTION") {
      timeoutRef.current = setTimeout(() => {
        const wantsBuy = evaluateBotBuy(state, botId, currentPlayer.position);
        if (wantsBuy) {
          dispatch({
            type: "BUY_PROPERTY",
            payload: { propertyIndex: currentPlayer.position },
          });
        } else {
          dispatch({
            type: "DECLINE_BUY",
            payload: { propertyIndex: currentPlayer.position },
          });
        }
      }, delay);
      return;
    }

    // C. Bot Debt Resolution Phase
    if (state.turnPhase === "DEBT_RESOLUTION" && state.debtInfo) {
      timeoutRef.current = setTimeout(() => {
        const plan = evaluateBotDebtLiquidation(
          state,
          botId,
          state.debtInfo!.amountOwed,
        );
        if (plan.canSurvive && plan.actions.length > 0) {
          for (const action of plan.actions) {
            dispatch(action);
          }
          dispatch({ type: "RESOLVE_DEBT" });
        } else {
          dispatch({
            type: "DECLARE_BANKRUPTCY",
            payload: { playerId: botId },
          });
        }
      }, delay);
      return;
    }

    // D. Bot End Turn Phase (Optional house building + End Turn)
    if (state.turnPhase === "END_TURN") {
      timeoutRef.current = setTimeout(() => {
        const houseTargets = evaluateBotHouseBuilding(state, botId);
        for (const target of houseTargets) {
          dispatch({ type: "BUILD_HOUSE", payload: { propertyIndex: target } });
        }
        dispatch({ type: "END_TURN" });
      }, delay);
      return;
    }
  }, [state, dispatch, options?.disabled]);

  return null;
}
