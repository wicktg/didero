import { GameState, PlayerState, PropertyState, ColorGroup } from '../types/game';
import { SQUARES } from '../data/boardData';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '../data/cardsData';
import { BOT_PROFILES, PLAYER_TOKENS } from '../data/botProfiles';

// Fisher-Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createInitialGameState(): GameState {
  const players: PlayerState[] = [];

  // Player 0 (Human)
  players.push({
    id: 0,
    name: 'You (Player 1)',
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

  // Players 1 to 7 (Bots)
  for (let i = 0; i < 7; i++) {
    const bot = BOT_PROFILES[i];
    players.push({
      id: i + 1,
      name: bot.name,
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
  const communityChestDeck = shuffleArray(COMMUNITY_CHEST_CARDS.map((_, idx) => idx));

  return {
    players,
    properties,
    currentTurnPlayerId: 0,
    turnNumber: 1,
    dice: [1, 1],
    isDiceRolled: false,
    consecutiveDoubles: 0,
    turnPhase: 'ROLL',
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
      {
        id: 'init-1',
        timestamp: Date.now(),
        text: 'Game started with 8 players! Each player receives $1500.',
        type: 'info',
      },
    ],
    botSpeed: 'normal',
    isAutoPlaying: true,
  };
}

// Check if player owns all properties in a color group
export function ownsFullGroup(state: GameState, playerId: number, group: ColorGroup): boolean {
  const groupSquares = SQUARES.filter((s) => s.group === group);
  if (groupSquares.length === 0) return false;
  return groupSquares.every((s) => state.properties[s.index]?.ownerId === playerId);
}

// Can build house check
export function canBuildHouse(state: GameState, playerId: number, propertyIndex: number): boolean {
  const square = SQUARES[propertyIndex];
  const prop = state.properties[propertyIndex];
  const player = state.players[playerId];

  if (!square || !prop || !player || prop.ownerId !== playerId || square.type !== 'STREET' || !square.group) {
    return false;
  }

  if (prop.houses >= 5) return false; // Max hotel
  if (prop.isMortgaged) return false;
  if (player.money < (square.housePrice || 0)) return false;

  // Must own all properties in the group
  if (!ownsFullGroup(state, playerId, square.group)) return false;

  // No property in the group can be mortgaged
  const groupSquares = SQUARES.filter((s) => s.group === square.group);
  const anyMortgaged = groupSquares.some((s) => state.properties[s.index]?.isMortgaged);
  if (anyMortgaged) return false;

  // Even building rule: current houses cannot exceed the min houses in group
  const houseCounts = groupSquares.map((s) => state.properties[s.index]?.houses || 0);
  const minHouses = Math.min(...houseCounts);
  return prop.houses === minHouses;
}

// Can sell house check
export function canSellHouse(state: GameState, playerId: number, propertyIndex: number): boolean {
  const square = SQUARES[propertyIndex];
  const prop = state.properties[propertyIndex];

  if (!square || !prop || prop.ownerId !== playerId || square.type !== 'STREET' || !square.group) {
    return false;
  }

  if (prop.houses <= 0) return false;

  // Even building rule: current houses must equal the max houses in group
  const groupSquares = SQUARES.filter((s) => s.group === square.group);
  const houseCounts = groupSquares.map((s) => state.properties[s.index]?.houses || 0);
  const maxHouses = Math.max(...houseCounts);
  return prop.houses === maxHouses;
}

// Can mortgage property check
export function canMortgageProperty(state: GameState, playerId: number, propertyIndex: number): boolean {
  const square = SQUARES[propertyIndex];
  const prop = state.properties[propertyIndex];

  if (!square || !prop || prop.ownerId !== playerId || prop.isMortgaged || !square.price) {
    return false;
  }

  // If street, no property in group can have houses
  if (square.group) {
    const groupSquares = SQUARES.filter((s) => s.group === square.group);
    const anyHouses = groupSquares.some((s) => (state.properties[s.index]?.houses || 0) > 0);
    if (anyHouses) return false;
  }

  return true;
}

// Can unmortgage property check
export function canUnmortgageProperty(state: GameState, playerId: number, propertyIndex: number): boolean {
  const square = SQUARES[propertyIndex];
  const prop = state.properties[propertyIndex];
  const player = state.players[playerId];

  if (!square || !prop || !player || prop.ownerId !== playerId || !prop.isMortgaged || !square.price) {
    return false;
  }

  const unmortgageCost = Math.round(square.price * 0.55); // 50% + 10% interest
  return player.money >= unmortgageCost;
}

// Helper to log event
export function createLogEntry(
  text: string,
  type: GameState['gameLog'][0]['type'],
  playerId?: number,
): GameState['gameLog'][0] {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    text,
    type,
    playerId,
  };
}
