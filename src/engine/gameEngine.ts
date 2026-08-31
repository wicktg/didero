import {
  GameState,
  PlayerState,
  PropertyState,
  ColorGroup,
  LogEntry,
} from "../types/game";
import { SQUARES, COLOR_GROUPS } from "../data/boardData";
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from "../data/cardsData";
import { BOT_PROFILES, PLAYER_TOKENS } from "../data/botProfiles";
import { DEFAULT_AGENT_DIDS } from "../utils/didUtils";

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createInitialGameState(playerCount: number = 2): GameState {
  const players: PlayerState[] = [];

  // Player 0 (Human/Our Agent)
  players.push({
    id: 0,
    name: DEFAULT_AGENT_DIDS[0],
    did: DEFAULT_AGENT_DIDS[0],
    token: PLAYER_TOKENS[0],
    isAI: false,
    money: 1500,
    position: 0,
    inJail: false,
    jailTurns: 0,
    getOutOfJailCards: { chance: 0, communityChest: 0 },
    isBankrupt: false,
    bankruptedBy: null,
  });

  // Bots (playerCount - 1 bots)
  const botCount = Math.max(1, Math.min(7, playerCount - 1));
  for (let i = 0; i < botCount; i++) {
    const bot = BOT_PROFILES[i];
    const botDid = DEFAULT_AGENT_DIDS[i + 1] || bot.did || bot.name;
    players.push({
      id: i + 1,
      name: botDid,
      did: botDid,
      token: PLAYER_TOKENS[i + 1],
      isAI: true,
      money: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      getOutOfJailCards: { chance: 0, communityChest: 0 },
      isBankrupt: false,
      bankruptedBy: null,
    });
  }

  // Properties mapping (0 to 39)
  const properties: Record<number, PropertyState> = {};
  for (let i = 0; i < 40; i++) {
    properties[i] = {
      index: i,
      ownerId: null,
      houses: 0,
      isMortgaged: false,
    };
  }

  const chanceDeck = shuffleArray(CHANCE_CARDS.map((_, idx) => idx));
  const communityChestDeck = shuffleArray(
    COMMUNITY_CHEST_CARDS.map((_, idx) => idx),
  );

  return {
    players,
    properties,
    currentTurnPlayerId: 0,
    turnNumber: 1,
    dice: [1, 1],
    isDiceRolled: false,
    consecutiveDoubles: 0,
    turnPhase: "ROLL",
    chanceDeck,
    chanceDiscard: [],
    communityChestDeck,
    communityChestDiscard: [],
    activeAuction: null,
    activeTrade: null,
    debtInfo: null,
    lastDrawnCard: null,
    gameWinnerId: null,
    gameLog: [
      createLogEntry(
        "New 2-Player Match started. Player 1's turn to roll!",
        "info",
      ),
    ],
    botSpeed: "normal",
    isAutoPlaying: false,
  };
}

export function createLogEntry(
  text: string,
  type: LogEntry["type"] = "info",
  playerId?: number,
): LogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    playerId,
    text,
    type,
  };
}

export function ownsFullGroup(
  state: GameState,
  playerId: number,
  group: ColorGroup,
): boolean {
  const groupIndices = COLOR_GROUPS[group].squares;
  return groupIndices.every(
    (idx) => state.properties[idx]?.ownerId === playerId,
  );
}

export function canBuildHouse(
  state: GameState,
  playerId: number,
  propertyIndex: number,
): boolean {
  const square = SQUARES[propertyIndex];
  if (!square || square.type !== "STREET" || !square.group) return false;
  if (!ownsFullGroup(state, playerId, square.group)) return false;

  const prop = state.properties[propertyIndex];
  if (prop.isMortgaged || prop.houses >= 5) return false;

  const player = state.players[playerId];
  if (player.money < (square.housePrice || 0)) return false;

  // Even development rule: cannot build if this property has more houses than any other in the group
  const groupIndices = COLOR_GROUPS[square.group].squares;
  const currentHouses = prop.houses;
  const minHousesInGroup = Math.min(
    ...groupIndices.map((idx) => state.properties[idx].houses),
  );

  return currentHouses === minHousesInGroup;
}

export function canSellHouse(
  state: GameState,
  playerId: number,
  propertyIndex: number,
): boolean {
  const square = SQUARES[propertyIndex];
  if (!square || square.type !== "STREET" || !square.group) return false;
  if (state.properties[propertyIndex]?.ownerId !== playerId) return false;

  const prop = state.properties[propertyIndex];
  if (prop.houses <= 0) return false;

  // Even development rule: cannot sell if this property has fewer houses than any other in the group
  const groupIndices = COLOR_GROUPS[square.group].squares;
  const currentHouses = prop.houses;
  const maxHousesInGroup = Math.max(
    ...groupIndices.map((idx) => state.properties[idx].houses),
  );

  return currentHouses === maxHousesInGroup;
}

export function canMortgageProperty(
  state: GameState,
  playerId: number,
  propertyIndex: number,
): boolean {
  const prop = state.properties[propertyIndex];
  if (!prop || prop.ownerId !== playerId || prop.isMortgaged) return false;

  const square = SQUARES[propertyIndex];
  if (square.group) {
    const groupIndices = COLOR_GROUPS[square.group].squares;
    // Cannot mortgage if any property in the group has houses
    const hasBuildings = groupIndices.some(
      (idx) => state.properties[idx].houses > 0,
    );
    if (hasBuildings) return false;
  }

  return true;
}

export function canUnmortgageProperty(
  state: GameState,
  playerId: number,
  propertyIndex: number,
): boolean {
  const prop = state.properties[propertyIndex];
  if (!prop || prop.ownerId !== playerId || !prop.isMortgaged) return false;

  const square = SQUARES[propertyIndex];
  const cost = Math.round((square.price || 0) * 0.55);
  return state.players[playerId].money >= cost;
}

export function calculatePlayerNetWorth(
  state: GameState,
  playerId: number,
): number {
  const player = state.players[playerId];
  if (!player || player.isBankrupt) return 0;

  let total = player.money;

  Object.values(state.properties).forEach((prop) => {
    if (prop.ownerId === playerId) {
      const square = SQUARES[prop.index];
      if (square) {
        if (prop.isMortgaged) {
          total += (square.price || 0) * 0.5;
        } else {
          total += square.price || 0;
          if (prop.houses > 0) {
            total += prop.houses * ((square.housePrice || 0) * 0.5);
          }
        }
      }
    }
  });

  return total;
}
