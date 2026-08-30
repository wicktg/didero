# Monopoly Game Design Specification

**Date:** 2026-08-30  
**Status:** Approved  
**Reference:** `intrepidcoder/monopoly`  

---

## 1. Overview & Goals
Build a complete, browser-based Monopoly game adhering strictly to official Monopoly tournament rules, featuring:
- **8 Fixed Players**: 1 Human Player (Player 1) vs 7 Distinct AI Bot Opponents.
- **Rules Fidelity**: Complete implementation of all standard rules (auctions upon buy rejection, housing/hotel limits, even building rule, 50% mortgage + 10% unmortgage fee, jail mechanics with 3-turn max / doubles / $50 fine, Chance and Community Chest decks, bankruptcy asset transfer/liquidation).
- **Modern Minimalist Aesthetic**: A polished, responsive, tactile board game interface replacing the legacy 1990s black-and-white look with warm parchment tones, crisp typography, authentic color swatches, clear tokens, and zero AI tropes or tacky gradients.
- **Pacing Controls**: Configurable bot speed (Normal 800ms, Fast 250ms, Instant 0ms) with interactive human takeover on auctions and trades.

---

## 2. System Architecture & State Machine

### 2.1 State Model (`MonopolyEngine`)
The game engine maintains pure immutable state transitions:

```typescript
export interface PlayerState {
  id: number; // 0 for Human, 1-7 for Bots
  name: string;
  token: string; // Top Hat, Battleship, Racecar, Thimble, Boot, Scottie Dog, Wheelbarrow, Iron
  color: string; // Token distinct accent color
  isAI: boolean;
  money: number; // Starts at $1500
  position: number; // 0 to 39
  inJail: boolean;
  jailTurns: number;
  getOutOfJailCards: {
    chance: number;
    communityChest: number;
  };
  isBankrupt: boolean;
  bankruptedBy: number | null; // Player id or null (bank)
}

export interface PropertyState {
  index: number;
  name: string;
  groupNumber: number; // 1-10 (1: Utilities, 2: Railroads, 3: Brown, 4: Light Blue, 5: Pink, 6: Orange, 7: Red, 8: Yellow, 9: Green, 10: Dark Blue)
  color: string;
  price: number;
  rent: [number, number, number, number, number, number]; // [base, 1H, 2H, 3H, 4H, Hotel]
  housePrice: number;
  ownerId: number | null;
  houses: number; // 0-4 houses, 5 = hotel
  isMortgaged: boolean;
}

export interface AuctionState {
  propertyIndex: number;
  highestBid: number;
  highestBidderId: number | null;
  currentBidderIndex: number; // Index into activeParticipants
  activeParticipants: number[]; // Player IDs still in bidding
  log: string[];
}

export interface TradeOffer {
  initiatorId: number;
  recipientId: number;
  offeredMoney: number;
  requestedMoney: number;
  offeredProperties: number[]; // Property indices
  requestedProperties: number[];
  offeredJailCards: { chance: boolean; communityChest: boolean };
  requestedJailCards: { chance: boolean; communityChest: boolean };
}

export interface GameState {
  players: PlayerState[];
  properties: PropertyState[];
  currentTurnPlayerId: number;
  dice: [number, number];
  isDiceRolled: boolean;
  consecutiveDoubles: number;
  turnPhase: 'ROLL' | 'LANDED_ACTION' | 'AUCTION' | 'TRADE' | 'DEBT_RESOLUTION' | 'END_TURN';
  chanceDeck: number[]; // Shuffled card indices
  chanceDiscard: number[];
  communityChestDeck: number[];
  communityChestDiscard: number[];
  activeAuction: AuctionState | null;
  activeTrade: TradeOffer | null;
  gameWinnerId: number | null;
  gameLog: Array<{ id: string; timestamp: number; text: string; type: 'move' | 'buy' | 'rent' | 'card' | 'auction' | 'trade' | 'jail' | 'bankruptcy' }>;
}
```

### 2.2 Board Squares (0 to 39)
- **0**: GO (Collect $200)
- **1**: Mediterranean Avenue (Brown, $60, Rent: $2/$10/$30/$90/$160/$250, House: $50)
- **2**: Community Chest
- **3**: Baltic Avenue (Brown, $60, Rent: $4/$20/$60/$180/$320/$450, House: $50)
- **4**: Income Tax (Pay $200)
- **5**: Reading Railroad ($200, Rent: $25/$50/$100/$200)
- **6**: Oriental Avenue (Light Blue, $100, Rent: $6/$30/$90/$270/$400/$550, House: $50)
- **7**: Chance
- **8**: Vermont Avenue (Light Blue, $100, Rent: $6/$30/$90/$270/$400/$550, House: $50)
- **9**: Connecticut Avenue (Light Blue, $120, Rent: $8/$40/$100/$300/$450/$600, House: $50)
- **10**: In Jail / Just Visiting
- **11**: St. Charles Place (Pink, $140, Rent: $10/$50/$150/$450/$625/$750, House: $100)
- **12**: Electric Company (Utility, $150, Rent: 4x / 10x dice)
- **13**: States Avenue (Pink, $140, Rent: $10/$50/$150/$450/$625/$750, House: $100)
- **14**: Virginia Avenue (Pink, $160, Rent: $12/$60/$180/$500/$700/$900, House: $100)
- **15**: Pennsylvania Railroad ($200, Rent: $25/$50/$100/$200)
- **16**: St. James Place (Orange, $180, Rent: $14/$70/$200/$550/$750/$950, House: $100)
- **17**: Community Chest
- **18**: Tennessee Avenue (Orange, $180, Rent: $14/$70/$200/$550/$750/$950, House: $100)
- **19**: New York Avenue (Orange, $200, Rent: $16/$80/$220/$600/$800/$1000, House: $100)
- **20**: Free Parking (Safe haven, $0)
- **21**: Kentucky Avenue (Red, $220, Rent: $18/$90/$250/$700/$875/$1050, House: $150)
- **22**: Chance
- **23**: Indiana Avenue (Red, $220, Rent: $18/$90/$250/$700/$875/$1050, House: $150)
- **24**: Illinois Avenue (Red, $240, Rent: $20/$100/$300/$750/$925/$1100, House: $150)
- **25**: B. & O. Railroad ($200, Rent: $25/$50/$100/$200)
- **26**: Atlantic Avenue (Yellow, $260, Rent: $22/$110/$330/$800/$975/$1150, House: $150)
- **27**: Ventnor Avenue (Yellow, $260, Rent: $22/$110/$330/$800/$975/$1150, House: $150)
- **28**: Water Works (Utility, $150, Rent: 4x / 10x dice)
- **29**: Marvin Gardens (Yellow, $280, Rent: $24/$120/$360/$850/$1025/$1200, House: $150)
- **30**: Go To Jail (Send player to square 10, inJail = true)
- **31**: Pacific Avenue (Green, $300, Rent: $26/$130/$390/$900/$1100/$1275, House: $200)
- **32**: North Carolina Avenue (Green, $300, Rent: $26/$130/$390/$900/$1100/$1275, House: $200)
- **33**: Community Chest
- **34**: Pennsylvania Avenue (Green, $320, Rent: $28/$150/$450/$1000/$1200/$1400, House: $200)
- **35**: Short Line Railroad ($200, Rent: $25/$50/$100/$200)
- **36**: Chance
- **37**: Park Place (Dark Blue, $350, Rent: $35/$175/$500/$1100/$1300/$1500, House: $200)
- **38**: Luxury Tax (Pay $100)
- **39**: Boardwalk (Dark Blue, $400, Rent: $50/$200/$600/$1400/$1700/$2000, House: $200)

---

## 3. The 7 AI Bot Personalities & Decision Matrix

1. **Vanderbilt** (Aggressive Tycoon): High auction bid threshold (up to 1.35x value), builds houses immediately when $150 reserve left.
2. **Morgan** (Conservative Banker): Strict cash reserve ($450+), avoids high-risk debt, only builds with abundant capital.
3. **Astor** (Network Baron): Aggressively targets Railroads and Utilities; prioritizes trading to complete sets.
4. **Carnegie** (Industrialist): Targets Orange and Red color groups (statistically highest landing probability); rushes 3 houses per property.
5. **Gould** (Auction Speculator): Bids on any unowned property at auction below 90% price; uses acquisitions as trade leverage.
6. **Rockefeller** (Landlord): Focuses on steady color group acquisition, balanced house development across all monopolies, unmortgages promptly.
7. **Girard** (Pragmatic Trader): Evaluates trades objectively based on fair asset valuation + future expected rent values.

---

## 4. Visual Design System & Component Hierarchy

- **Color Tokens**:
  - Parchment Board Canvas: `#F8F6F0`
  - Deep Slate Ink: `#1C1F23`
  - Subtle Borders: `#E2DDD5`
  - High-contrast Property Badges:
    - Brown: `#8B4513`
    - Light Blue: `#70B5D8`
    - Pink: `#D84384`
    - Orange: `#F57C00`
    - Red: `#D32F2F`
    - Yellow: `#FBC02D`
    - Green: `#2E7D32`
    - Dark Blue: `#1565C0`
    - Railroad: `#37474F`
    - Utility: `#D97706`
  - Status Indicators: `#15803D` (Active/Success), `#B91C1C` (Mortgaged/Danger), `#64748B` (Neutral/Visiting).

- **Component Tree**:
  - `src/components/board/MonopolyBoard.tsx` (11x11 Grid Board)
  - `src/components/board/SquareCell.tsx` (Corner, Edge, Color Band, House Pips, Tokens)
  - `src/components/board/CenterHub.tsx` (Dice Cup, Action Buttons, Card Prompts)
  - `src/components/sidebar/PlayerLeaderboard.tsx` (8-Player Status & Net Worth)
  - `src/components/sidebar/EventLog.tsx` (Live Action Feed)
  - `src/components/modals/DeedModal.tsx` (Property Inspection, Building & Mortgaging)
  - `src/components/modals/AuctionModal.tsx` (Interactive Live Bidding Table)
  - `src/components/modals/TradeModal.tsx` (Asset Exchange & AI Counter-offers)
  - `src/components/modals/GameOverModal.tsx` (Victory Summary & Player Stats)
  - `src/components/ui/TopNav.tsx` (Turn counter, speed toggle, reset button)

---

## 5. Verification & Testing Strategy
- **Engine Unit Tests**:
  - Dice roll & doubles movement logic (including 3 doubles -> Jail).
  - Passing GO salary collection ($200).
  - Unowned property auction trigger on decline.
  - Rent calculations (unimproved monopoly 2x, houses 1-4, hotel, railroads 1-4, utilities 4x/10x).
  - Even house building rule enforcement and selling houses at 50%.
  - Mortgaging (50%) and unmortgaging (55%).
  - In-jail turns, bail payment, card redemption, 3rd turn ejection.
  - Debt liquidation & bankruptcy asset transfer.
  - 7 Bot AI decision evaluations (buy, bid, build, mortgage, trade).
- **UI Integration Verification**:
  - Responsive board rendering in browser on various viewports.
  - Interactive deed modal clicking, house building, and mortgaging.
  - Full auction flow with human + 7 bots.
  - Full trade proposal and resolution flow.
  - Turn speed controls (Normal, Fast, Instant).
