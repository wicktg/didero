import { GameState, TradeOffer } from "../types/game";
import { SQUARES } from "../data/boardData";
import {
  createInitialGameState,
  canBuildHouse,
  canSellHouse,
  canMortgageProperty,
  canUnmortgageProperty,
  createLogEntry,
} from "./gameEngine";
import { handleLanding } from "./cardEngine";
import { startAuction, placeBid, passBid, exitAuction } from "./auctionEngine";
import { proposeTrade, acceptTrade, rejectTrade } from "./tradeEngine";

export type GameAction =
  | { type: "ROLL_DICE"; payload?: { diceOverride?: [number, number] } }
  | { type: "BUY_PROPERTY"; payload: { propertyIndex: number } }
  | { type: "DECLINE_BUY"; payload: { propertyIndex: number } }
  | { type: "BUILD_HOUSE"; payload: { propertyIndex: number } }
  | { type: "SELL_HOUSE"; payload: { propertyIndex: number } }
  | { type: "MORTGAGE_PROPERTY"; payload: { propertyIndex: number } }
  | { type: "UNMORTGAGE_PROPERTY"; payload: { propertyIndex: number } }
  | { type: "PAY_JAIL_FINE"; payload?: { playerId?: number } }
  | {
      type: "USE_JAIL_CARD";
      payload: { cardType: "chance" | "communityChest"; playerId?: number };
    }
  | { type: "RESOLVE_DEBT" }
  | { type: "DECLARE_BANKRUPTCY"; payload?: { playerId?: number } }
  | { type: "END_TURN" }
  | { type: "PLACE_AUCTION_BID"; payload: { playerId: number; amount: number } }
  | { type: "PASS_AUCTION_BID"; payload: { playerId: number } }
  | { type: "EXIT_AUCTION"; payload: { playerId: number } }
  | { type: "PROPOSE_TRADE"; payload: { trade: TradeOffer } }
  | { type: "ACCEPT_TRADE" }
  | { type: "REJECT_TRADE" }
  | { type: "SET_BOT_SPEED"; payload: { speed: "normal" | "fast" | "instant" } }
  | { type: "TOGGLE_AUTO_PLAY"; payload?: { autoPlay?: boolean } }
  | { type: "RESET_GAME" };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESET_GAME": {
      return createInitialGameState();
    }

    case "SET_BOT_SPEED": {
      return { ...state, botSpeed: action.payload.speed };
    }

    case "TOGGLE_AUTO_PLAY": {
      const autoPlay =
        action.payload?.autoPlay !== undefined
          ? action.payload.autoPlay
          : !state.isAutoPlaying;
      return { ...state, isAutoPlaying: autoPlay };
    }

    case "ROLL_DICE": {
      if (state.turnPhase !== "ROLL") return state;

      const playerId = state.currentTurnPlayerId;
      const player = { ...state.players[playerId] };
      const nextPlayers = [...state.players];
      nextPlayers[playerId] = player;

      const die1 = action.payload?.diceOverride
        ? action.payload.diceOverride[0]
        : Math.floor(Math.random() * 6) + 1;
      const die2 = action.payload?.diceOverride
        ? action.payload.diceOverride[1]
        : Math.floor(Math.random() * 6) + 1;
      const isDoubles = die1 === die2;
      const totalRoll = die1 + die2;

      let nextState: GameState = {
        ...state,
        players: nextPlayers,
        dice: [die1, die2],
        isDiceRolled: true,
      };

      // 1. If player is currently in Jail
      if (player.inJail) {
        if (isDoubles) {
          player.inJail = false;
          player.jailTurns = 0;
          nextState.consecutiveDoubles = 0;
          nextState.gameLog = [
            createLogEntry(
              `${player.name} rolled doubles (${die1}, ${die2}) and broke out of Jail!`,
              "jail",
              playerId,
            ),
            ...nextState.gameLog,
          ];

          // Move player by roll
          player.position = (player.position + totalRoll) % 40;
          return handleLanding(nextState, playerId);
        } else {
          player.jailTurns += 1;
          if (player.jailTurns >= 3) {
            // Must pay $50 on 3rd failed turn
            player.money -= 50;
            player.inJail = false;
            player.jailTurns = 0;
            nextState.gameLog = [
              createLogEntry(
                `${player.name} served 3 turns in Jail, paid $50 fine, and is released.`,
                "jail",
                playerId,
              ),
              ...nextState.gameLog,
            ];

            if (player.money < 0) {
              nextState.turnPhase = "DEBT_RESOLUTION";
              nextState.debtInfo = {
                debtorId: playerId,
                creditorId: null,
                amountOwed: 50,
              };
              return nextState;
            }

            player.position = (player.position + totalRoll) % 40;
            return handleLanding(nextState, playerId);
          } else {
            nextState.turnPhase = "END_TURN";
            nextState.gameLog = [
              createLogEntry(
                `${player.name} failed to roll doubles (${die1}, ${die2}) in Jail (turn ${player.jailTurns}/3).`,
                "jail",
                playerId,
              ),
              ...nextState.gameLog,
            ];
            return nextState;
          }
        }
      }

      // 2. Normal movement (Not in Jail)
      if (isDoubles) {
        nextState.consecutiveDoubles += 1;
        if (nextState.consecutiveDoubles >= 3) {
          // 3 consecutive doubles -> Go to Jail
          player.position = 10;
          player.inJail = true;
          player.jailTurns = 0;
          nextState.consecutiveDoubles = 0;
          nextState.turnPhase = "END_TURN";
          nextState.gameLog = [
            createLogEntry(
              `${player.name} rolled 3 consecutive doubles and was sent to Jail!`,
              "jail",
              playerId,
            ),
            ...nextState.gameLog,
          ];
          return nextState;
        }
      } else {
        nextState.consecutiveDoubles = 0;
      }

      const oldPos = player.position;
      const newPos = (oldPos + totalRoll) % 40;
      player.position = newPos;

      // Pass GO check
      if (newPos < oldPos) {
        player.money += 200;
        nextState.gameLog = [
          createLogEntry(
            `${player.name} passed GO and collected $200.`,
            "move",
            playerId,
          ),
          ...nextState.gameLog,
        ];
      }

      const square = SQUARES[newPos];
      nextState.gameLog = [
        createLogEntry(
          `${player.name} rolled a ${totalRoll} (${die1}, ${die2}) and landed on ${square.name}.`,
          "move",
          playerId,
        ),
        ...nextState.gameLog,
      ];

      return handleLanding(nextState, playerId);
    }

    case "BUY_PROPERTY": {
      const pIdx = action.payload.propertyIndex;
      const playerId = state.currentTurnPlayerId;
      const player = { ...state.players[playerId] };
      const square = SQUARES[pIdx];
      const prop = state.properties[pIdx];

      if (
        !square ||
        !prop ||
        prop.ownerId !== null ||
        !square.price ||
        player.money < square.price
      ) {
        return state;
      }

      player.money -= square.price;
      const nextPlayers = [...state.players];
      nextPlayers[playerId] = player;

      const nextProperties = {
        ...state.properties,
        [pIdx]: {
          ...prop,
          ownerId: playerId,
        },
      };

      const isDoubles =
        state.dice[0] === state.dice[1] &&
        !player.inJail &&
        state.consecutiveDoubles > 0;

      return {
        ...state,
        players: nextPlayers,
        properties: nextProperties,
        turnPhase: isDoubles ? "ROLL" : "END_TURN",
        gameLog: [
          createLogEntry(
            `${player.name} bought ${square.name} for $${square.price}.`,
            "buy",
            playerId,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "DECLINE_BUY": {
      return startAuction(state, action.payload.propertyIndex);
    }

    case "BUILD_HOUSE": {
      const pIdx = action.payload.propertyIndex;
      const square = SQUARES[pIdx];
      const prop = state.properties[pIdx];
      const playerId = prop?.ownerId;

      if (
        playerId === null ||
        playerId === undefined ||
        !canBuildHouse(state, playerId, pIdx)
      ) {
        return state;
      }

      const player = { ...state.players[playerId] };
      player.money -= square.housePrice || 0;

      const nextPlayers = [...state.players];
      nextPlayers[playerId] = player;

      const nextProperties = {
        ...state.properties,
        [pIdx]: {
          ...prop,
          houses: prop.houses + 1,
        },
      };

      const buildingType =
        prop.houses + 1 === 5 ? "a Hotel" : `House #${prop.houses + 1}`;

      return {
        ...state,
        players: nextPlayers,
        properties: nextProperties,
        gameLog: [
          createLogEntry(
            `${player.name} built ${buildingType} on ${square.name} for $${square.housePrice}.`,
            "build",
            playerId,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "SELL_HOUSE": {
      const pIdx = action.payload.propertyIndex;
      const square = SQUARES[pIdx];
      const prop = state.properties[pIdx];
      const playerId = prop?.ownerId;

      if (
        playerId === null ||
        playerId === undefined ||
        !canSellHouse(state, playerId, pIdx)
      ) {
        return state;
      }

      const refund = Math.round((square.housePrice || 0) * 0.5);
      const player = { ...state.players[playerId] };
      player.money += refund;

      const nextPlayers = [...state.players];
      nextPlayers[playerId] = player;

      const nextProperties = {
        ...state.properties,
        [pIdx]: {
          ...prop,
          houses: prop.houses - 1,
        },
      };

      return {
        ...state,
        players: nextPlayers,
        properties: nextProperties,
        gameLog: [
          createLogEntry(
            `${player.name} sold a house on ${square.name} for $${refund}.`,
            "build",
            playerId,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "MORTGAGE_PROPERTY": {
      const pIdx = action.payload.propertyIndex;
      const square = SQUARES[pIdx];
      const prop = state.properties[pIdx];
      const playerId = prop?.ownerId;

      if (
        playerId === null ||
        playerId === undefined ||
        !canMortgageProperty(state, playerId, pIdx)
      ) {
        return state;
      }

      const mortgageValue = Math.round((square.price || 0) * 0.5);
      const player = { ...state.players[playerId] };
      player.money += mortgageValue;

      const nextPlayers = [...state.players];
      nextPlayers[playerId] = player;

      const nextProperties = {
        ...state.properties,
        [pIdx]: {
          ...prop,
          isMortgaged: true,
        },
      };

      return {
        ...state,
        players: nextPlayers,
        properties: nextProperties,
        gameLog: [
          createLogEntry(
            `${player.name} mortgaged ${square.name} for $${mortgageValue}.`,
            "mortgage",
            playerId,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "UNMORTGAGE_PROPERTY": {
      const pIdx = action.payload.propertyIndex;
      const square = SQUARES[pIdx];
      const prop = state.properties[pIdx];
      const playerId = prop?.ownerId;

      if (
        playerId === null ||
        playerId === undefined ||
        !canUnmortgageProperty(state, playerId, pIdx)
      ) {
        return state;
      }

      const cost = Math.round((square.price || 0) * 0.55);
      const player = { ...state.players[playerId] };
      player.money -= cost;

      const nextPlayers = [...state.players];
      nextPlayers[playerId] = player;

      const nextProperties = {
        ...state.properties,
        [pIdx]: {
          ...prop,
          isMortgaged: false,
        },
      };

      return {
        ...state,
        players: nextPlayers,
        properties: nextProperties,
        gameLog: [
          createLogEntry(
            `${player.name} unmortgaged ${square.name} for $${cost}.`,
            "mortgage",
            playerId,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "PAY_JAIL_FINE": {
      const playerId = action.payload?.playerId ?? state.currentTurnPlayerId;
      const player = { ...state.players[playerId] };

      if (!player.inJail || player.money < 50) return state;

      player.money -= 50;
      player.inJail = false;
      player.jailTurns = 0;

      const nextPlayers = [...state.players];
      nextPlayers[playerId] = player;

      return {
        ...state,
        players: nextPlayers,
        turnPhase: "ROLL",
        gameLog: [
          createLogEntry(
            `${player.name} paid $50 fine and was released from Jail.`,
            "jail",
            playerId,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "USE_JAIL_CARD": {
      const playerId = action.payload?.playerId ?? state.currentTurnPlayerId;
      const player = { ...state.players[playerId] };

      if (!player.inJail) return state;

      if (
        action.payload.cardType === "chance" &&
        player.getOutOfJailCards.chance > 0
      ) {
        player.getOutOfJailCards.chance -= 1;
      } else if (
        action.payload.cardType === "communityChest" &&
        player.getOutOfJailCards.communityChest > 0
      ) {
        player.getOutOfJailCards.communityChest -= 1;
      } else {
        return state;
      }

      player.inJail = false;
      player.jailTurns = 0;

      const nextPlayers = [...state.players];
      nextPlayers[playerId] = player;

      return {
        ...state,
        players: nextPlayers,
        turnPhase: "ROLL",
        gameLog: [
          createLogEntry(
            `${player.name} used a "Get Out of Jail Free" card and is released.`,
            "jail",
            playerId,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "RESOLVE_DEBT": {
      if (!state.debtInfo) return state;
      const debtor = state.players[state.debtInfo.debtorId];
      if (debtor.money < 0) return state;

      // Debt resolved!
      const isDoubles =
        state.dice[0] === state.dice[1] &&
        !debtor.inJail &&
        state.consecutiveDoubles > 0;
      return {
        ...state,
        debtInfo: null,
        turnPhase: isDoubles ? "ROLL" : "END_TURN",
        gameLog: [
          createLogEntry(
            `${debtor.name} successfully raised funds to clear all debt obligations.`,
            "info",
            debtor.id,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "DECLARE_BANKRUPTCY": {
      const playerId =
        action.payload?.playerId ??
        (state.debtInfo ? state.debtInfo.debtorId : state.currentTurnPlayerId);
      const bankruptPlayer = { ...state.players[playerId] };
      const creditorId = state.debtInfo?.creditorId ?? null;

      bankruptPlayer.isBankrupt = true;
      bankruptPlayer.bankruptedBy = creditorId;

      const nextPlayers = [...state.players];
      nextPlayers[playerId] = bankruptPlayer;

      const nextProperties = { ...state.properties };

      // Asset transfer
      if (creditorId !== null) {
        const creditor = { ...nextPlayers[creditorId] };
        creditor.money += Math.max(0, bankruptPlayer.money);
        creditor.getOutOfJailCards.chance +=
          bankruptPlayer.getOutOfJailCards.chance;
        creditor.getOutOfJailCards.communityChest +=
          bankruptPlayer.getOutOfJailCards.communityChest;

        Object.values(nextProperties).forEach((prop) => {
          if (prop.ownerId === playerId) {
            nextProperties[prop.index] = { ...prop, ownerId: creditorId };
          }
        });

        nextPlayers[creditorId] = creditor;
      } else {
        // Bankrupt to Bank: all properties reset to unowned
        Object.values(nextProperties).forEach((prop) => {
          if (prop.ownerId === playerId) {
            nextProperties[prop.index] = {
              index: prop.index,
              ownerId: null,
              houses: 0,
              isMortgaged: false,
            };
          }
        });
      }

      bankruptPlayer.money = 0;
      bankruptPlayer.getOutOfJailCards = { chance: 0, communityChest: 0 };

      // Check remaining active players
      const remainingActive = nextPlayers.filter((p) => !p.isBankrupt);

      let winnerId: number | null = null;
      let phase: GameState["turnPhase"] = "END_TURN";

      if (remainingActive.length === 1) {
        winnerId = remainingActive[0].id;
        phase = "GAME_OVER";
      }

      return {
        ...state,
        players: nextPlayers,
        properties: nextProperties,
        debtInfo: null,
        turnPhase: phase,
        gameWinnerId: winnerId,
        gameLog: [
          createLogEntry(
            `${bankruptPlayer.name} declared bankruptcy! All assets transferred to ${creditorId !== null ? nextPlayers[creditorId].name : "the Bank"}.`,
            "bankruptcy",
            playerId,
          ),
          ...state.gameLog,
        ],
      };
    }

    case "END_TURN": {
      if (state.turnPhase !== "END_TURN") return state;

      // Find next active non-bankrupt player
      let nextPlayerId = (state.currentTurnPlayerId + 1) % state.players.length;
      while (state.players[nextPlayerId].isBankrupt) {
        nextPlayerId = (nextPlayerId + 1) % state.players.length;
      }

      return {
        ...state,
        currentTurnPlayerId: nextPlayerId,
        turnNumber: state.turnNumber + 1,
        isDiceRolled: false,
        consecutiveDoubles: 0,
        turnPhase: "ROLL",
        lastDrawnCard: null,
      };
    }

    // Auction Actions
    case "PLACE_AUCTION_BID":
      return placeBid(state, action.payload.playerId, action.payload.amount);
    case "PASS_AUCTION_BID":
      return passBid(state, action.payload.playerId);
    case "EXIT_AUCTION":
      return exitAuction(state, action.payload.playerId);

    // Trade Actions
    case "PROPOSE_TRADE":
      return proposeTrade(state, action.payload.trade);
    case "ACCEPT_TRADE":
      return acceptTrade(state);
    case "REJECT_TRADE":
      return rejectTrade(state);

    default:
      return state;
  }
}
