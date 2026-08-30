import { BotProfile, PlayerToken } from "../types/game";

export const PLAYER_TOKENS: PlayerToken[] = [
  { id: "top_hat", name: "Top Hat", icon: "🎩", color: "#1E3A8A" }, // Player 1 (Human)
  { id: "battleship", name: "Battleship", icon: "🚢", color: "#B91C1C" }, // Bot 1
  { id: "racecar", name: "Racecar", icon: "🏎️", color: "#047857" }, // Bot 2
  { id: "thimble", name: "Thimble", icon: "🧵", color: "#D97706" }, // Bot 3
  { id: "boot", name: "Boot", icon: "👢", color: "#6D28D9" }, // Bot 4
  { id: "scottie_dog", name: "Scottie Dog", icon: "🐕", color: "#BE185D" }, // Bot 5
  { id: "wheelbarrow", name: "Wheelbarrow", icon: "🛒", color: "#0F766E" }, // Bot 6
  { id: "iron", name: "Classic Iron", icon: "⚓", color: "#4338CA" }, // Bot 7
];

export const BOT_PROFILES: BotProfile[] = [
  {
    id: 1,
    name: "Vanderbilt",
    title: "The Aggressive Tycoon",
    bio: "Relentlessly bids in auctions, quickly builds hotels, and takes calculated financial risks.",
    avatarColor: "#B91C1C",
    preferredGroups: ["DARK_BLUE", "GREEN", "RED"],
    reserveCash: 120,
    auctionAggressiveness: 1.3,
    tradeWillingness: 1.05,
    housingRushThreshold: 4,
    jailTolerance: "early_exit",
  },
  {
    id: 2,
    name: "Morgan",
    title: "The Conservative Banker",
    bio: "Maintains immense cash reserves, rarely takes debt, and only buys properties with safe buffers.",
    avatarColor: "#047857",
    preferredGroups: ["ORANGE", "LIGHT_BLUE", "YELLOW"],
    reserveCash: 450,
    auctionAggressiveness: 0.9,
    tradeWillingness: 0.95,
    housingRushThreshold: 3,
    jailTolerance: "conservative",
  },
  {
    id: 3,
    name: "Astor",
    title: "The Network Baron",
    bio: "Obsessed with acquiring all 4 Railroads and Utilities; open to lucrative property swaps.",
    avatarColor: "#D97706",
    preferredGroups: ["ORANGE", "PINK"],
    reserveCash: 250,
    auctionAggressiveness: 1.15,
    tradeWillingness: 1.1,
    housingRushThreshold: 3,
    jailTolerance: "strategic",
  },
  {
    id: 4,
    name: "Carnegie",
    title: "The Strategic Industrialist",
    bio: "Calculates high-probability landing zones (Orange & Red) and rushes 3 houses per property.",
    avatarColor: "#6D28D9",
    preferredGroups: ["ORANGE", "RED"],
    reserveCash: 200,
    auctionAggressiveness: 1.2,
    tradeWillingness: 1.0,
    housingRushThreshold: 3,
    jailTolerance: "strategic",
  },
  {
    id: 5,
    name: "Gould",
    title: "The Auction Speculator",
    bio: "Snipes properties at auctions below market value and leverages them as trade bargaining chips.",
    avatarColor: "#BE185D",
    preferredGroups: ["YELLOW", "GREEN", "LIGHT_BLUE"],
    reserveCash: 150,
    auctionAggressiveness: 1.25,
    tradeWillingness: 1.15,
    housingRushThreshold: 3,
    jailTolerance: "early_exit",
  },
  {
    id: 6,
    name: "Rockefeller",
    title: "The Steady Landlord",
    bio: "Even development across multiple monopolies; prioritizes steady compound rent and quick unmortgaging.",
    avatarColor: "#0F766E",
    preferredGroups: ["GREEN", "YELLOW", "BROWN"],
    reserveCash: 300,
    auctionAggressiveness: 1.05,
    tradeWillingness: 1.0,
    housingRushThreshold: 3,
    jailTolerance: "strategic",
  },
  {
    id: 7,
    name: "Girard",
    title: "The Pragmatic Merchant",
    bio: "Evaluates trades strictly by expected ROI, balances cashflow, and negotiates fairly.",
    avatarColor: "#4338CA",
    preferredGroups: ["PINK", "LIGHT_BLUE", "BROWN"],
    reserveCash: 220,
    auctionAggressiveness: 1.1,
    tradeWillingness: 1.05,
    housingRushThreshold: 3,
    jailTolerance: "early_exit",
  },
];
