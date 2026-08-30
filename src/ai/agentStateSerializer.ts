import { GameState, ColorGroup, SquareType, TurnPhase } from "../types/game";
import { SQUARES, COLOR_GROUPS } from "../data/boardData";
import {
  calculatePlayerNetWorth,
  ownsFullGroup,
  canBuildHouse,
  canSellHouse,
  canMortgageProperty,
  canUnmortgageProperty,
} from "../engine/gameEngine";
import { calculateRent } from "../engine/rentCalculator";

export interface LegalActionDescriptor {
  type: string;
  description: string;
  payload?: Record<string, any>;
}

export interface PlayerSummaryState {
  id: number;
  name: string;
  money: number;
  position: number;
  positionName: string;
  inJail: boolean;
  jailTurns: number;
  jailCards: number;
  ownedProperties: number[];
  monopolies: ColorGroup[];
  netWorth: number;
}

export interface CurrentSquareSummary {
  index: number;
  name: string;
  type: SquareType;
  price?: number;
  group?: ColorGroup;
  ownerId: number | null;
  houses?: number;
  isMortgaged?: boolean;
}

export interface DangerZone {
  squareIndex: number;
  squareName: string;
  square: string;
  distance: number;
  rent: number;
  ownerId: number;
  probability: number;
  expectedRent: number;
}

export interface BoardContext {
  currentSquare: CurrentSquareSummary;
  unownedPropertiesRemaining: number;
  unownedStreetsRemaining: number;
  opponentNearbyDanger: DangerZone[];
}

export interface AgentStateContext {
  activePlayerId: number;
  isMyTurn: boolean;
  turnPhase: TurnPhase;
  turnNumber: number;
  myState: PlayerSummaryState;
  opponentState: PlayerSummaryState;
  allOpponents?: PlayerSummaryState[];
  boardContext: BoardContext;
  legalActions: LegalActionDescriptor[];
}

/**
 * Standard 2d6 dice total probabilities for sums 2 through 12.
 */
export const DICE_PROBABILITIES: Record<number, number> = {
  2: 1 / 36,
  3: 2 / 36,
  4: 3 / 36,
  5: 4 / 36,
  6: 5 / 36,
  7: 6 / 36,
  8: 5 / 36,
  9: 4 / 36,
  10: 3 / 36,
  11: 2 / 36,
  12: 1 / 36,
};

/**
 * Calculates all completed color monopolies for a given player ID.
 */
export function calculatePlayerMonopolies(
  state: GameState,
  playerId: number,
): ColorGroup[] {
  const monopolies: ColorGroup[] = [];
  (Object.keys(COLOR_GROUPS) as ColorGroup[]).forEach((group) => {
    if (ownsFullGroup(state, playerId, group)) {
      monopolies.push(group);
    }
  });
  return monopolies;
}

/**
 * Summarizes a player's finances, holdings, jail status, and net worth.
 */
export function summarizePlayer(
  state: GameState,
  playerId: number,
): PlayerSummaryState {
  const player = state.players[playerId];
  if (!player) {
    return {
      id: playerId,
      name: "Unknown",
      money: 0,
      position: 0,
      positionName: SQUARES[0]?.name || "GO",
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      ownedProperties: [],
      monopolies: [],
      netWorth: 0,
    };
  }

  const ownedProperties = Object.values(state.properties)
    .filter((prop) => prop.ownerId === playerId)
    .map((prop) => prop.index)
    .sort((a, b) => a - b);

  const monopolies = calculatePlayerMonopolies(state, playerId);
  const netWorth = calculatePlayerNetWorth(state, playerId);
  const totalJailCards =
    (player.getOutOfJailCards?.chance || 0) +
    (player.getOutOfJailCards?.communityChest || 0);

  return {
    id: player.id,
    name: player.name,
    money: player.money,
    position: player.position,
    positionName: SQUARES[player.position]?.name || "Unknown",
    inJail: player.inJail,
    jailTurns: player.jailTurns,
    jailCards: totalJailCards,
    ownedProperties,
    monopolies,
    netWorth,
  };
}

/**
 * Calculates danger zones (opponent-owned properties) within 2-12 dice roll distance.
 */
export function calculateDangerZones(
  state: GameState,
  playerId: number,
): DangerZone[] {
  const player = state.players[playerId];
  if (!player) return [];

  const dangerZones: DangerZone[] = [];
  const currentPos = player.position;

  for (let d = 2; d <= 12; d++) {
    const targetIndex = (currentPos + d) % 40;
    const prop = state.properties[targetIndex];
    const square = SQUARES[targetIndex];

    if (
      prop &&
      prop.ownerId !== null &&
      prop.ownerId !== playerId &&
      !prop.isMortgaged &&
      square
    ) {
      const rent = calculateRent(targetIndex, playerId, d, state.properties);
      if (rent > 0) {
        const prob = DICE_PROBABILITIES[d] || 0;
        const expectedRent = Number((prob * rent).toFixed(2));
        dangerZones.push({
          squareIndex: targetIndex,
          squareName: square.name,
          square: square.name,
          distance: d,
          rent,
          ownerId: prop.ownerId,
          probability: Number(prob.toFixed(4)),
          expectedRent,
        });
      }
    }
  }

  return dangerZones;
}

/**
 * Returns a list of all legal actions an agent can perform based on the current game state and turn phase.
 */
export function getLegalActionsForAgent(
  state: GameState,
  agentId: number,
): LegalActionDescriptor[] {
  const player = state.players[agentId];
  if (!player || player.isBankrupt || state.turnPhase === "GAME_OVER") {
    return [];
  }

  const actions: LegalActionDescriptor[] = [];
  const isMyTurn = state.currentTurnPlayerId === agentId;

  switch (state.turnPhase) {
    case "ROLL": {
      if (!isMyTurn) return [];

      if (player.inJail) {
        actions.push({
          type: "ROLL_DICE",
          description: "Roll dice to attempt rolling doubles to escape Jail",
        });

        if (player.money >= 50) {
          actions.push({
            type: "PAY_JAIL_FINE",
            description: "Pay $50 fine to leave Jail immediately",
            payload: { playerId: agentId },
          });
        }

        if (player.getOutOfJailCards?.chance > 0) {
          actions.push({
            type: "USE_JAIL_CARD",
            description: "Use Chance Get Out of Jail Free card",
            payload: { cardType: "chance", playerId: agentId },
          });
        }

        if (player.getOutOfJailCards?.communityChest > 0) {
          actions.push({
            type: "USE_JAIL_CARD",
            description: "Use Community Chest Get Out of Jail Free card",
            payload: { cardType: "communityChest", playerId: agentId },
          });
        }
      } else {
        actions.push({
          type: "ROLL_DICE",
          description: "Roll the dice",
        });
      }
      break;
    }

    case "LANDED_ACTION": {
      if (!isMyTurn) return [];

      const pos = player.position;
      const square = SQUARES[pos];
      const prop = state.properties[pos];

      if (prop && prop.ownerId === null && square && square.price) {
        if (player.money >= square.price) {
          actions.push({
            type: "BUY_PROPERTY",
            description: `Buy ${square.name} for $${square.price}`,
            payload: { propertyIndex: pos },
          });
        }

        actions.push({
          type: "DECLINE_BUY",
          description: `Decline purchase of ${square.name} and send to public auction`,
          payload: { propertyIndex: pos },
        });
      }
      break;
    }

    case "AUCTION": {
      if (!state.activeAuction) return [];
      const auction = state.activeAuction;
      const square = SQUARES[auction.propertyIndex];
      const isCurrentBidder = auction.currentBidderId === agentId;
      const isParticipant = auction.activeParticipants.includes(agentId);

      if (isCurrentBidder && isParticipant && square) {
        const minRequired =
          auction.highestBid === 0
            ? 10
            : auction.highestBid + auction.minIncrement;

        if (player.money >= minRequired) {
          actions.push({
            type: "BID",
            description: `Place bid on ${square.name} (min $${minRequired}, max $${player.money})`,
            payload: {
              amount: minRequired,
              minAmount: minRequired,
              maxAmount: player.money,
              propertyIndex: auction.propertyIndex,
              playerId: agentId,
            },
          });
        }

        actions.push({
          type: "PASS_AUCTION",
          description: `Pass current bid round for ${square.name}`,
          payload: { playerId: agentId },
        });

        actions.push({
          type: "EXIT_AUCTION",
          description: `Withdraw from auction for ${square.name}`,
          payload: { playerId: agentId },
        });
      }
      break;
    }

    case "DEBT_RESOLUTION": {
      const debtorId = state.debtInfo
        ? state.debtInfo.debtorId
        : state.currentTurnPlayerId;
      if (agentId !== debtorId) return [];

      if (player.money >= 0) {
        actions.push({
          type: "RESOLVE_DEBT",
          description: "Confirm debt obligations are cleared and resume turn",
        });
      } else {
        // Mortgage options
        Object.values(state.properties).forEach((prop) => {
          if (
            prop.ownerId === agentId &&
            canMortgageProperty(state, agentId, prop.index)
          ) {
            const sq = SQUARES[prop.index];
            const val = Math.round((sq?.price || 0) * 0.5);
            actions.push({
              type: "MORTGAGE_PROPERTY",
              description: `Mortgage ${sq?.name || `Property #${prop.index}`} for $${val}`,
              payload: { propertyIndex: prop.index },
            });
          }
        });

        // Sell house options
        Object.values(state.properties).forEach((prop) => {
          if (
            prop.ownerId === agentId &&
            canSellHouse(state, agentId, prop.index)
          ) {
            const sq = SQUARES[prop.index];
            const refund = Math.round((sq?.housePrice || 0) * 0.5);
            actions.push({
              type: "SELL_HOUSE",
              description: `Sell house on ${sq?.name || `Property #${prop.index}`} for $${refund}`,
              payload: { propertyIndex: prop.index },
            });
          }
        });

        actions.push({
          type: "DECLARE_BANKRUPTCY",
          description: "Declare bankruptcy and surrender all assets",
          payload: { playerId: agentId },
        });
      }
      break;
    }

    case "END_TURN": {
      if (!isMyTurn) return [];

      actions.push({
        type: "END_TURN",
        description: "End current turn and pass to next player",
      });

      // House building options
      for (let idx = 0; idx < 40; idx++) {
        if (canBuildHouse(state, agentId, idx)) {
          const sq = SQUARES[idx];
          actions.push({
            type: "BUILD_HOUSE",
            description: `Build house on ${sq?.name || `Property #${idx}`} for $${sq?.housePrice}`,
            payload: { propertyIndex: idx },
          });
        }
      }

      // Unmortgage options
      Object.values(state.properties).forEach((prop) => {
        if (
          prop.ownerId === agentId &&
          canUnmortgageProperty(state, agentId, prop.index)
        ) {
          const sq = SQUARES[prop.index];
          const cost = Math.round((sq?.price || 0) * 0.55);
          actions.push({
            type: "UNMORTGAGE_PROPERTY",
            description: `Unmortgage ${sq?.name || `Property #${prop.index}`} for $${cost}`,
            payload: { propertyIndex: prop.index },
          });
        }
      });

      // Propose Trade options
      const opponents = state.players.filter(
        (p) => p.id !== agentId && !p.isBankrupt,
      );
      if (opponents.length > 0) {
        actions.push({
          type: "PROPOSE_TRADE",
          description: "Propose a property or cash trade to opponent",
          payload: { recipientId: opponents[0].id },
        });
      }
      break;
    }

    case "TRADE": {
      if (state.activeTrade && state.activeTrade.recipientId === agentId) {
        actions.push({
          type: "ACCEPT_TRADE",
          description: "Accept the proposed trade",
        });
        actions.push({
          type: "REJECT_TRADE",
          description: "Reject the proposed trade",
        });
      }
      break;
    }

    default:
      break;
  }

  return actions;
}

/**
 * Serializes the complete game state into deep contextual JSON for a specific agent.
 */
export function serializeStateForAgent(
  state: GameState,
  agentId: number,
): AgentStateContext {
  const isMyTurn = state.currentTurnPlayerId === agentId;
  const myState = summarizePlayer(state, agentId);

  // Opponents summary
  const allOpponents = state.players
    .filter((p) => p.id !== agentId)
    .map((p) => summarizePlayer(state, p.id));

  const primaryOpponent =
    allOpponents.find((p) => !state.players[p.id]?.isBankrupt) ||
    allOpponents[0] ||
    myState;

  // Board context
  const currentSquareConfig = SQUARES[myState.position] || SQUARES[0];
  const currentProp = state.properties[myState.position];

  const currentSquare: CurrentSquareSummary = {
    index: currentSquareConfig.index,
    name: currentSquareConfig.name,
    type: currentSquareConfig.type,
    price: currentSquareConfig.price,
    group: currentSquareConfig.group,
    ownerId: currentProp?.ownerId ?? null,
    houses: currentProp?.houses ?? 0,
    isMortgaged: currentProp?.isMortgaged ?? false,
  };

  const unownedPropertiesRemaining = Object.values(state.properties).filter(
    (prop) => {
      const sq = SQUARES[prop.index];
      return prop.ownerId === null && sq && sq.price !== undefined;
    },
  ).length;

  const unownedStreetsRemaining = Object.values(state.properties).filter(
    (prop) => {
      const sq = SQUARES[prop.index];
      return prop.ownerId === null && sq && sq.type === "STREET";
    },
  ).length;

  const opponentNearbyDanger = calculateDangerZones(state, agentId);

  const boardContext: BoardContext = {
    currentSquare,
    unownedPropertiesRemaining,
    unownedStreetsRemaining,
    opponentNearbyDanger,
  };

  const legalActions = getLegalActionsForAgent(state, agentId);

  return {
    activePlayerId: state.currentTurnPlayerId,
    isMyTurn,
    turnPhase: state.turnPhase,
    turnNumber: state.turnNumber,
    myState,
    opponentState: primaryOpponent,
    allOpponents,
    boardContext,
    legalActions,
  };
}
