import type { GameAction } from "../engine/gameReducer";
import type { AgentStateContext } from "../ai/agentStateSerializer";

export type SquareType =
  | "GO"
  | "STREET"
  | "COMMUNITY_CHEST"
  | "TAX"
  | "RAILROAD"
  | "CHANCE"
  | "JAIL"
  | "UTILITY"
  | "FREE_PARKING"
  | "GO_TO_JAIL";

export type ColorGroup =
  | "BROWN"
  | "LIGHT_BLUE"
  | "PINK"
  | "ORANGE"
  | "RED"
  | "YELLOW"
  | "GREEN"
  | "DARK_BLUE";

export interface SquareConfig {
  index: number;
  name: string;
  shortName?: string;
  type: SquareType;
  group?: ColorGroup;
  groupNumber?: number; // 1: Utility, 2: Railroad, 3: Brown, 4: LightBlue, 5: Pink, 6: Orange, 7: Red, 8: Yellow, 9: Green, 10: DarkBlue
  price?: number;
  color?: string;
  rent?: [number, number, number, number, number, number]; // [base, 1H, 2H, 3H, 4H, Hotel]
  housePrice?: number;
  taxAmount?: number;
}

export interface PlayerToken {
  id: string;
  name: string;
  icon: string; // Emoji or SVG key
  color: string;
}

export interface PlayerState {
  id: number; // 0 for Human, 1-7 for Bots
  name: string;
  did?: string;
  token: PlayerToken;
  isAI: boolean;
  money: number; // Starts at $1500
  position: number; // 0-39
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: {
    chance: number;
    communityChest: number;
  };
  isBankrupt: boolean;
  bankruptedBy: number | null; // Player id or null if bank
}

export interface PropertyState {
  index: number;
  ownerId: number | null;
  houses: number; // 0-4 houses, 5 = hotel
  isMortgaged: boolean;
}

export interface Card {
  id: string;
  deck: "chance" | "communityChest";
  text: string;
  action:
    | { type: "ADVANCE_TO"; targetIndex: number; passGoCheck: boolean }
    | { type: "ADVANCE_TO_NEAREST_RAILROAD" }
    | { type: "ADVANCE_TO_NEAREST_UTILITY" }
    | { type: "COLLECT_MONEY"; amount: number }
    | { type: "PAY_MONEY"; amount: number }
    | { type: "PAY_EACH_PLAYER"; amount: number }
    | { type: "COLLECT_FROM_EACH_PLAYER"; amount: number }
    | { type: "GENERAL_REPAIRS"; perHouse: number; perHotel: number }
    | { type: "GO_TO_JAIL" }
    | { type: "GET_OUT_OF_JAIL_FREE" }
    | { type: "GO_BACK_3_SPACES" };
}

export interface AuctionState {
  propertyIndex: number;
  highestBid: number;
  highestBidderId: number | null;
  currentBidderId: number;
  activeParticipants: number[]; // Player IDs still participating
  minIncrement: number;
}

export interface TradeOffer {
  id: string;
  initiatorId: number;
  recipientId: number;
  offeredMoney: number;
  requestedMoney: number;
  offeredProperties: number[]; // Square indices
  requestedProperties: number[]; // Square indices
  offeredJailCards: { chance: boolean; communityChest: boolean };
  requestedJailCards: { chance: boolean; communityChest: boolean };
}

export type TurnPhase =
  | "ROLL"
  | "LANDED_ACTION"
  | "AUCTION"
  | "TRADE"
  | "DEBT_RESOLUTION"
  | "END_TURN"
  | "GAME_OVER";

export interface LogEntry {
  id: string;
  timestamp: number;
  playerId?: number;
  text: string;
  type:
    | "move"
    | "buy"
    | "rent"
    | "card"
    | "auction"
    | "trade"
    | "jail"
    | "build"
    | "mortgage"
    | "bankruptcy"
    | "info";
}

export interface AgentTelemetryEntry {
  id: string;
  timestamp: number;
  agentId: number;
  agentName: string;
  turnNumber: number;
  phase: TurnPhase;
  thought: string;
  action: GameAction;
  isValid: boolean;
  validationReason?: string;
  stateSnapshot: AgentStateContext;
  rawResponse?: string;
  error?: string;
}

export interface GameState {
  players: PlayerState[];
  properties: Record<number, PropertyState>;
  currentTurnPlayerId: number;
  turnNumber: number;
  dice: [number, number];
  isDiceRolled: boolean;
  consecutiveDoubles: number;
  turnPhase: TurnPhase;
  chanceDeck: number[]; // indices of cards
  chanceDiscard: number[];
  communityChestDeck: number[];
  communityChestDiscard: number[];
  activeAuction: AuctionState | null;
  activeTrade: TradeOffer | null;
  debtInfo: {
    debtorId: number;
    creditorId: number | null; // null = Bank
    amountOwed: number;
  } | null;
  lastDrawnCard: Card | null;
  gameWinnerId: number | null;
  gameLog: LogEntry[];
  agentTelemetryLogs?: AgentTelemetryEntry[];
  botSpeed: "normal" | "fast" | "instant";
  isAutoPlaying: boolean;
}

export interface BotProfile {
  id: number;
  name: string;
  did?: string;
  title: string;
  bio: string;
  avatarColor: string;
  preferredGroups: ColorGroup[];
  reserveCash: number; // Minimum cash reserve to maintain
  auctionAggressiveness: number; // Multiplier over market value (e.g., 0.9 to 1.35)
  tradeWillingness: number; // Valuation bias for trades (e.g. 0.95 to 1.1)
  housingRushThreshold: number; // Target house level (3, 4, 5)
  jailTolerance: "early_exit" | "strategic" | "conservative";
}
