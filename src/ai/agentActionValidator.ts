import { GameState, TradeOffer } from "../types/game";
import { GameAction } from "../engine/gameReducer";
import { SQUARES } from "../data/boardData";
import {
  canBuildHouse,
  canSellHouse,
  canMortgageProperty,
  canUnmortgageProperty,
} from "../engine/gameEngine";
import { validateTradeOffer } from "../engine/tradeEngine";

export interface ValidationResult {
  action: GameAction;
  isValid: boolean;
  reason?: string;
}

/**
 * Returns a safe, deterministic fallback action for an agent based on the current game state and turn phase.
 */
export function getSafeFallbackAction(
  state: GameState,
  agentId: number,
): GameAction {
  const player = state.players[agentId];
  if (!player || player.isBankrupt || state.turnPhase === "GAME_OVER") {
    return { type: "END_TURN" };
  }

  switch (state.turnPhase) {
    case "ROLL":
      return { type: "ROLL_DICE" };

    case "LANDED_ACTION":
      return {
        type: "DECLINE_BUY",
        payload: { propertyIndex: player.position },
      };

    case "AUCTION":
      return {
        type: "PASS_AUCTION_BID",
        payload: { playerId: agentId },
      };

    case "DEBT_RESOLUTION":
      if (player.money >= 0) {
        return { type: "RESOLVE_DEBT" };
      }
      return {
        type: "DECLARE_BANKRUPTCY",
        payload: { playerId: agentId },
      };

    case "END_TURN":
      return { type: "END_TURN" };

    case "TRADE":
      return { type: "REJECT_TRADE" };

    default:
      return { type: "END_TURN" };
  }
}

/**
 * Extracts normalized action type and payload from potentially malformed or nested agent output.
 */
function extractActionAndPayload(proposedAction: any): {
  type: string;
  payload: Record<string, any>;
} {
  if (!proposedAction) {
    return { type: "", payload: {} };
  }

  if (typeof proposedAction === "string") {
    return { type: proposedAction.trim().toUpperCase(), payload: {} };
  }

  if (typeof proposedAction === "object") {
    if (proposedAction.action !== undefined && proposedAction.action !== null) {
      if (typeof proposedAction.action === "string") {
        return {
          type: proposedAction.action.trim().toUpperCase(),
          payload:
            typeof proposedAction.payload === "object" &&
            proposedAction.payload !== null
              ? proposedAction.payload
              : {},
        };
      }
      if (typeof proposedAction.action === "object") {
        const nestedType = String(proposedAction.action.type || "")
          .trim()
          .toUpperCase();
        const nestedPayload =
          typeof proposedAction.action.payload === "object" &&
          proposedAction.action.payload !== null
            ? proposedAction.action.payload
            : typeof proposedAction.payload === "object" &&
                proposedAction.payload !== null
              ? proposedAction.payload
              : {};
        return { type: nestedType, payload: nestedPayload };
      }
    }

    const directType = String(proposedAction.type || "")
      .trim()
      .toUpperCase();
    const directPayload =
      typeof proposedAction.payload === "object" &&
      proposedAction.payload !== null
        ? proposedAction.payload
        : {};
    return { type: directType, payload: directPayload };
  }

  return { type: "", payload: {} };
}

/**
 * Strictly validates and sanitizes a proposed agent action against the current game state and rules.
 * If the proposed action is illegal, malformed, or out of phase, a safe fallback action is returned with isValid: false.
 */
export function validateAndSanitizeAgentAction(
  state: GameState,
  agentId: number,
  proposedAction: any,
): ValidationResult {
  const fallback = getSafeFallbackAction(state, agentId);
  const player = state.players[agentId];

  if (!player) {
    return {
      action: fallback,
      isValid: false,
      reason: `Player with id ${agentId} not found in game state`,
    };
  }

  if (player.isBankrupt) {
    return {
      action: fallback,
      isValid: false,
      reason: `Player ${player.name} (${agentId}) is bankrupt`,
    };
  }

  if (state.turnPhase === "GAME_OVER") {
    return {
      action: fallback,
      isValid: false,
      reason: "Game is already over",
    };
  }

  const { type, payload } = extractActionAndPayload(proposedAction);

  if (!type || type === "SAFE_FALLBACK") {
    return {
      action: fallback,
      isValid: false,
      reason: "No valid action type specified or SAFE_FALLBACK requested",
    };
  }

  switch (state.turnPhase) {
    // -------------------------------------------------------------
    // Phase: ROLL
    // -------------------------------------------------------------
    case "ROLL": {
      if (state.currentTurnPlayerId !== agentId) {
        return {
          action: fallback,
          isValid: false,
          reason: `It is not player ${agentId}'s turn to roll`,
        };
      }

      if (type === "ROLL_DICE" || type === "ROLL") {
        return {
          action: { type: "ROLL_DICE" },
          isValid: true,
        };
      }

      if (type === "PAY_JAIL_FINE" || type === "PAY_FINE") {
        if (!player.inJail) {
          return {
            action: fallback,
            isValid: false,
            reason: `Player ${player.name} is not in jail`,
          };
        }
        if (player.money < 50) {
          return {
            action: fallback,
            isValid: false,
            reason: `Insufficient funds ($${player.money}) to pay $50 jail fine`,
          };
        }
        return {
          action: { type: "PAY_JAIL_FINE", payload: { playerId: agentId } },
          isValid: true,
        };
      }

      if (
        type === "USE_JAIL_CARD" ||
        type === "USE_CARD" ||
        type === "USE_GET_OUT_OF_JAIL_CARD"
      ) {
        if (!player.inJail) {
          return {
            action: fallback,
            isValid: false,
            reason: `Player ${player.name} is not in jail`,
          };
        }

        const requestedCard = String(payload.cardType || "").toLowerCase();
        let cardType: "chance" | "communityChest" | null = null;

        if (requestedCard === "chance" && player.getOutOfJailCards.chance > 0) {
          cardType = "chance";
        } else if (
          (requestedCard === "communitychest" ||
            requestedCard === "community_chest") &&
          player.getOutOfJailCards.communityChest > 0
        ) {
          cardType = "communityChest";
        } else if (player.getOutOfJailCards.chance > 0) {
          cardType = "chance";
        } else if (player.getOutOfJailCards.communityChest > 0) {
          cardType = "communityChest";
        }

        if (!cardType) {
          return {
            action: fallback,
            isValid: false,
            reason: `Player ${player.name} does not possess any Get Out of Jail Free cards`,
          };
        }

        return {
          action: {
            type: "USE_JAIL_CARD",
            payload: { cardType, playerId: agentId },
          },
          isValid: true,
        };
      }

      return {
        action: fallback,
        isValid: false,
        reason: `Action "${type}" is not allowed during ROLL phase`,
      };
    }

    // -------------------------------------------------------------
    // Phase: LANDED_ACTION
    // -------------------------------------------------------------
    case "LANDED_ACTION": {
      if (state.currentTurnPlayerId !== agentId) {
        return {
          action: fallback,
          isValid: false,
          reason: `It is not player ${agentId}'s landed action phase`,
        };
      }

      const defaultPos = player.position;

      if (type === "BUY_PROPERTY" || type === "BUY") {
        const pIdx =
          payload.propertyIndex !== undefined
            ? Number(payload.propertyIndex)
            : defaultPos;

        const square = SQUARES[pIdx];
        const prop = state.properties[pIdx];

        if (
          !square ||
          !prop ||
          prop.ownerId !== null ||
          square.price === undefined
        ) {
          return {
            action: fallback,
            isValid: false,
            reason: `Property at index ${pIdx} is not available for purchase`,
          };
        }

        if (player.money < square.price) {
          return {
            action: fallback,
            isValid: false,
            reason: `Player has insufficient funds ($${player.money}) to buy ${square.name} ($${square.price})`,
          };
        }

        return {
          action: { type: "BUY_PROPERTY", payload: { propertyIndex: pIdx } },
          isValid: true,
        };
      }

      if (
        type === "DECLINE_BUY" ||
        type === "DECLINE" ||
        type === "PASS_BUY" ||
        type === "PASS"
      ) {
        const pIdx =
          payload.propertyIndex !== undefined
            ? Number(payload.propertyIndex)
            : defaultPos;

        return {
          action: { type: "DECLINE_BUY", payload: { propertyIndex: pIdx } },
          isValid: true,
        };
      }

      return {
        action: fallback,
        isValid: false,
        reason: `Action "${type}" is not allowed during LANDED_ACTION phase`,
      };
    }

    // -------------------------------------------------------------
    // Phase: AUCTION
    // -------------------------------------------------------------
    case "AUCTION": {
      if (!state.activeAuction) {
        return {
          action: fallback,
          isValid: false,
          reason: "No active auction in progress",
        };
      }

      const auction = state.activeAuction;
      if (!auction.activeParticipants.includes(agentId)) {
        return {
          action: fallback,
          isValid: false,
          reason: `Player ${agentId} is not an active participant in this auction`,
        };
      }

      if (
        type === "PLACE_AUCTION_BID" ||
        type === "PLACE_BID" ||
        type === "BID" ||
        type === "AUCTION_BID"
      ) {
        if (auction.currentBidderId !== agentId) {
          return {
            action: fallback,
            isValid: false,
            reason: `It is not player ${agentId}'s turn to bid in the auction`,
          };
        }

        const amount = Number(payload.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          return {
            action: fallback,
            isValid: false,
            reason: `Invalid bid amount: ${payload.amount}`,
          };
        }

        const minRequired =
          auction.highestBid === 0
            ? 10
            : auction.highestBid + auction.minIncrement;

        if (amount < minRequired) {
          return {
            action: fallback,
            isValid: false,
            reason: `Bid of $${amount} is below minimum required bid of $${minRequired}`,
          };
        }

        if (amount > player.money) {
          return {
            action: fallback,
            isValid: false,
            reason: `Bid of $${amount} exceeds player's available funds of $${player.money}`,
          };
        }

        return {
          action: {
            type: "PLACE_AUCTION_BID",
            payload: { playerId: agentId, amount },
          },
          isValid: true,
        };
      }

      if (
        type === "PASS_AUCTION_BID" ||
        type === "PASS_AUCTION" ||
        type === "PASS" ||
        type === "PASS_BID"
      ) {
        if (auction.currentBidderId !== agentId) {
          return {
            action: fallback,
            isValid: false,
            reason: `It is not player ${agentId}'s turn to pass in the auction`,
          };
        }

        return {
          action: {
            type: "PASS_AUCTION_BID",
            payload: { playerId: agentId },
          },
          isValid: true,
        };
      }

      if (type === "EXIT_AUCTION" || type === "EXIT" || type === "WITHDRAW") {
        return {
          action: {
            type: "EXIT_AUCTION",
            payload: { playerId: agentId },
          },
          isValid: true,
        };
      }

      return {
        action: fallback,
        isValid: false,
        reason: `Action "${type}" is not allowed during AUCTION phase`,
      };
    }

    // -------------------------------------------------------------
    // Phase: DEBT_RESOLUTION
    // -------------------------------------------------------------
    case "DEBT_RESOLUTION": {
      const debtorId = state.debtInfo
        ? state.debtInfo.debtorId
        : state.currentTurnPlayerId;

      if (debtorId !== agentId) {
        return {
          action: fallback,
          isValid: false,
          reason: `Player ${agentId} is not the debtor in DEBT_RESOLUTION phase`,
        };
      }

      if (type === "RESOLVE_DEBT" || type === "PAY_DEBT") {
        if (player.money < 0) {
          return {
            action: fallback,
            isValid: false,
            reason: `Cannot resolve debt while balance is negative ($${player.money})`,
          };
        }
        return {
          action: { type: "RESOLVE_DEBT" },
          isValid: true,
        };
      }

      if (
        type === "DECLARE_BANKRUPTCY" ||
        type === "BANKRUPT" ||
        type === "BANKRUPTCY"
      ) {
        return {
          action: {
            type: "DECLARE_BANKRUPTCY",
            payload: { playerId: agentId },
          },
          isValid: true,
        };
      }

      if (type === "MORTGAGE_PROPERTY" || type === "MORTGAGE") {
        const pIdx = Number(payload.propertyIndex);
        if (
          !Number.isInteger(pIdx) ||
          !canMortgageProperty(state, agentId, pIdx)
        ) {
          return {
            action: fallback,
            isValid: false,
            reason: `Cannot mortgage property at index ${payload.propertyIndex}`,
          };
        }
        return {
          action: {
            type: "MORTGAGE_PROPERTY",
            payload: { propertyIndex: pIdx },
          },
          isValid: true,
        };
      }

      if (type === "SELL_HOUSE" || type === "SELL_BUILDING") {
        const pIdx = Number(payload.propertyIndex);
        if (!Number.isInteger(pIdx) || !canSellHouse(state, agentId, pIdx)) {
          return {
            action: fallback,
            isValid: false,
            reason: `Cannot sell house on property at index ${payload.propertyIndex}`,
          };
        }
        return {
          action: {
            type: "SELL_HOUSE",
            payload: { propertyIndex: pIdx },
          },
          isValid: true,
        };
      }

      return {
        action: fallback,
        isValid: false,
        reason: `Action "${type}" is not allowed during DEBT_RESOLUTION phase`,
      };
    }

    // -------------------------------------------------------------
    // Phase: END_TURN
    // -------------------------------------------------------------
    case "END_TURN": {
      if (state.currentTurnPlayerId !== agentId) {
        return {
          action: fallback,
          isValid: false,
          reason: `It is not player ${agentId}'s end turn phase`,
        };
      }

      if (type === "END_TURN" || type === "PASS_TURN" || type === "DONE") {
        return {
          action: { type: "END_TURN" },
          isValid: true,
        };
      }

      if (
        type === "BUILD_HOUSE" ||
        type === "BUILD" ||
        type === "BUILD_HOTEL"
      ) {
        const pIdx = Number(payload.propertyIndex);
        if (!Number.isInteger(pIdx) || !canBuildHouse(state, agentId, pIdx)) {
          return {
            action: fallback,
            isValid: false,
            reason: `Cannot build house on property at index ${payload.propertyIndex}`,
          };
        }
        return {
          action: {
            type: "BUILD_HOUSE",
            payload: { propertyIndex: pIdx },
          },
          isValid: true,
        };
      }

      if (type === "SELL_HOUSE" || type === "SELL_BUILDING") {
        const pIdx = Number(payload.propertyIndex);
        if (!Number.isInteger(pIdx) || !canSellHouse(state, agentId, pIdx)) {
          return {
            action: fallback,
            isValid: false,
            reason: `Cannot sell house on property at index ${payload.propertyIndex}`,
          };
        }
        return {
          action: {
            type: "SELL_HOUSE",
            payload: { propertyIndex: pIdx },
          },
          isValid: true,
        };
      }

      if (type === "MORTGAGE_PROPERTY" || type === "MORTGAGE") {
        const pIdx = Number(payload.propertyIndex);
        if (
          !Number.isInteger(pIdx) ||
          !canMortgageProperty(state, agentId, pIdx)
        ) {
          return {
            action: fallback,
            isValid: false,
            reason: `Cannot mortgage property at index ${payload.propertyIndex}`,
          };
        }
        return {
          action: {
            type: "MORTGAGE_PROPERTY",
            payload: { propertyIndex: pIdx },
          },
          isValid: true,
        };
      }

      if (type === "UNMORTGAGE_PROPERTY" || type === "UNMORTGAGE") {
        const pIdx = Number(payload.propertyIndex);
        if (
          !Number.isInteger(pIdx) ||
          !canUnmortgageProperty(state, agentId, pIdx)
        ) {
          return {
            action: fallback,
            isValid: false,
            reason: `Cannot unmortgage property at index ${payload.propertyIndex}`,
          };
        }
        return {
          action: {
            type: "UNMORTGAGE_PROPERTY",
            payload: { propertyIndex: pIdx },
          },
          isValid: true,
        };
      }

      if (type === "PROPOSE_TRADE" || type === "TRADE") {
        const tradeOffer: TradeOffer = payload.trade || {
          id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          initiatorId: agentId,
          recipientId: Number(payload.recipientId),
          offeredMoney: Number(payload.offeredMoney || 0),
          requestedMoney: Number(payload.requestedMoney || 0),
          offeredProperties: Array.isArray(payload.offeredProperties)
            ? payload.offeredProperties.map(Number)
            : [],
          requestedProperties: Array.isArray(payload.requestedProperties)
            ? payload.requestedProperties.map(Number)
            : [],
          offeredJailCards: {
            chance: !!payload.offeredJailCards?.chance,
            communityChest: !!payload.offeredJailCards?.communityChest,
          },
          requestedJailCards: {
            chance: !!payload.requestedJailCards?.chance,
            communityChest: !!payload.requestedJailCards?.communityChest,
          },
        };

        const tradeValidation = validateTradeOffer(state, tradeOffer);
        if (!tradeValidation.valid) {
          return {
            action: fallback,
            isValid: false,
            reason: tradeValidation.reason || "Invalid trade proposal",
          };
        }

        return {
          action: {
            type: "PROPOSE_TRADE",
            payload: { trade: tradeOffer },
          },
          isValid: true,
        };
      }

      return {
        action: fallback,
        isValid: false,
        reason: `Action "${type}" is not allowed during END_TURN phase`,
      };
    }

    // -------------------------------------------------------------
    // Phase: TRADE
    // -------------------------------------------------------------
    case "TRADE": {
      if (!state.activeTrade || state.activeTrade.recipientId !== agentId) {
        return {
          action: fallback,
          isValid: false,
          reason: `Player ${agentId} is not the recipient of an active trade offer`,
        };
      }

      if (type === "ACCEPT_TRADE" || type === "ACCEPT") {
        return {
          action: { type: "ACCEPT_TRADE" },
          isValid: true,
        };
      }

      if (
        type === "REJECT_TRADE" ||
        type === "REJECT" ||
        type === "DECLINE_TRADE" ||
        type === "DECLINE"
      ) {
        return {
          action: { type: "REJECT_TRADE" },
          isValid: true,
        };
      }

      return {
        action: fallback,
        isValid: false,
        reason: `Action "${type}" is not allowed during TRADE phase`,
      };
    }

    default: {
      return {
        action: fallback,
        isValid: false,
        reason: `Unsupported turn phase: ${state.turnPhase}`,
      };
    }
  }
}
