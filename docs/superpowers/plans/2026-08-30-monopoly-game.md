# Monopoly Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive, 8-player Monopoly web application (1 Human vs 7 distinct AI Bots) with strict official rules, full auction/trade/mortgage/housing mechanics, and a refined minimalist UI.

**Architecture:** Pure immutable TypeScript Game Engine & Reducer with automated asynchronous AI Bot Orchestrator, running a modular React 18 + Tailwind CSS + Lucide frontend featuring an interactive 11×11 CSS Grid board, flip-card deed modals, real-time auction arena, and live event ticker.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Vitest.

**Spec:** [`docs/superpowers/specs/2026-08-30-monopoly-game-design.md`](file:///c:/Users/hamma/blue/docs/superpowers/specs/2026-08-30-monopoly-game-design.md)

## Global Constraints

- Exactly 8 fixed players: Player 1 (Human) and Players 2–8 (AI Bots with unique strategies).
- Strict official Monopoly tournament rules (auction on buy rejection, even housing build, 50% mortgage / 10% unmortgage fee, standard jail rules, exact card decks).
- Minimalist board game UI: warm parchment canvas (`#F8F6F0`), high-contrast property headers, tabular typography, zero tacky AI gradients or neon cards.
- Vitest test suite covering engine rules, card actions, bot evaluations, auction & trade mechanics.

---

### Task 1: Project Setup & Tooling Configuration

**Files:**

- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/index.css`, `src/main.tsx`, `src/App.tsx`, `vitest.config.ts`

**Interfaces:**

- Produces: Working Vite + React + TypeScript + Tailwind CSS + Vitest build and dev environment.

- [ ] **Step 1: Initialize project files and dependencies**
      Create package.json with dependencies: `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`, and devDependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/react`, `jsdom`.

- [ ] **Step 2: Run npm install**
      Run: `npm install`
      Expected: Packages installed successfully.

- [ ] **Step 3: Verify build and test runner**
      Run: `npm test -- --run`
      Expected: Vitest runs cleanly.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: setup vite react typescript tailwind vitest project"
```

---

### Task 2: Core Game Types, Board Constants & Card Data

**Files:**

- Create: `src/types/game.ts`, `src/data/boardData.ts`, `src/data/cardsData.ts`, `src/data/botProfiles.ts`
- Test: `src/tests/boardData.test.ts`

**Interfaces:**

- Produces:
  - `SQUARES: ReadonlyArray<SquareConfig>`: 40 square definitions with prices, rents, groups, house costs.
  - `CHANCE_CARDS`, `COMMUNITY_CHEST_CARDS`: Exact classic card decks.
  - `BOT_PROFILES`: 7 distinct AI profiles with personality parameters.
  - `GameState`, `PlayerState`, `PropertyState`, `AuctionState`, `TradeOffer` interfaces.

- [ ] **Step 1: Write test for board configuration integrity**
      Verify 40 squares exist, all 8 color groups have correct property counts and prices, 4 railroads, 2 utilities, 4 corners.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test -- src/tests/boardData.test.ts --run`
      Expected: FAIL (missing files)

- [ ] **Step 3: Implement game types, board data, cards, and bot profiles**
      Implement `src/types/game.ts`, `src/data/boardData.ts`, `src/data/cardsData.ts`, `src/data/botProfiles.ts`.

- [ ] **Step 4: Run test to verify it passes**
      Run: `npm test -- src/tests/boardData.test.ts --run`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/ src/data/ src/tests/
git commit -m "feat: add monopoly types, board squares, cards data, and bot profiles"
```

---

### Task 3: Pure Game Engine & Rules Reducer

**Files:**

- Create: `src/engine/gameReducer.ts`, `src/engine/gameEngine.ts`, `src/engine/rentCalculator.ts`
- Test: `src/tests/gameEngine.test.ts`, `src/tests/rentCalculator.test.ts`

**Interfaces:**

- Produces:
  - `createInitialGameState()`: Initializes 8 players ($1500 each), shuffled decks, 40 unowned properties.
  - `gameReducer(state: GameState, action: GameAction): GameState`
  - Action handlers: `ROLL_DICE`, `BUY_PROPERTY`, `PAY_RENT`, `BUILD_HOUSE`, `SELL_HOUSE`, `MORTGAGE_PROPERTY`, `UNMORTGAGE_PROPERTY`, `PAY_JAIL_FINE`, `USE_JAIL_CARD`, `RESOLVE_DEBT`, `DECLARE_BANKRUPTCY`, `END_TURN`.
  - `calculateRent(square: PropertyState, diceTotal: number, allProperties: PropertyState[])`: Computes rent with monopoly doubling, houses, railroads, utilities.

- [ ] **Step 1: Write failing tests for core mechanics**
      Test roll & movement, passing GO +$200, 3 doubles -> Jail, unimproved monopoly 2x rent, house rents, railroad rents, utility multiplier, mortgaging 50% + unmortgaging 55%, even building rule.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test -- src/tests/gameEngine.test.ts --run`
      Expected: FAIL

- [ ] **Step 3: Implement GameEngine, GameReducer, and RentCalculator**
      Implement state transitions, validation, and rent formulas.

- [ ] **Step 4: Run test to verify it passes**
      Run: `npm test -- src/tests/gameEngine.test.ts src/tests/rentCalculator.test.ts --run`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/ src/tests/
git commit -m "feat: implement pure game engine, rules reducer, and rent calculator"
```

---

### Task 4: Card Decks Engine (Chance & Community Chest)

**Files:**

- Create: `src/engine/cardEngine.ts`
- Test: `src/tests/cardEngine.test.ts`

**Interfaces:**

- Consumes: `GameState`, `CardAction`
- Produces: `drawAndApplyCard(state: GameState, deckType: 'chance' | 'communityChest'): { state: GameState; card: Card; description: string }`

- [ ] **Step 1: Write failing tests for all card effects**
      Advance to GO, Advance to Boardwalk/Illinois/St. Charles/Reading, Advance to nearest Railroad/Utility with special rent multipliers, General repairs ($25/house, $100/hotel), Street repairs ($40/house, $115/hotel), Pay each player $50, Collect from each player $10, Get Out of Jail Free cards, Go to Jail.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test -- src/tests/cardEngine.test.ts --run`
      Expected: FAIL

- [ ] **Step 3: Implement card draw and state mutation engine**
      Implement card resolution, reshuffling discards on empty deck, and updating player money/positions.

- [ ] **Step 4: Run test to verify it passes**
      Run: `npm test -- src/tests/cardEngine.test.ts --run`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/cardEngine.ts src/tests/cardEngine.test.ts
git commit -m "feat: implement chance and community chest card engine"
```

---

### Task 5: Auction Engine

**Files:**

- Create: `src/engine/auctionEngine.ts`
- Test: `src/tests/auctionEngine.test.ts`

**Interfaces:**

- Produces:
  - `startAuction(state: GameState, propertyIndex: number): GameState`
  - `placeBid(state: GameState, playerId: number, amount: number): GameState`
  - `passBid(state: GameState, playerId: number): GameState`
  - `exitAuction(state: GameState, playerId: number): GameState`
  - `finalizeAuction(state: GameState): GameState`

- [ ] **Step 1: Write failing tests for auction state transitions**
      Auction initiation, rotational bidding order across all 8 players, outbidding validation, pass/exit removal from active bidders, and automatic property award to highest bidder when all others pass.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test -- src/tests/auctionEngine.test.ts --run`
      Expected: FAIL

- [ ] **Step 3: Implement Auction Engine**
      Implement robust auction state transitions and tie-ins with the main game state.

- [ ] **Step 4: Run test to verify it passes**
      Run: `npm test -- src/tests/auctionEngine.test.ts --run`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/auctionEngine.ts src/tests/auctionEngine.test.ts
git commit -m "feat: implement auction engine and state transitions"
```

---

### Task 6: Trade Negotiation Engine

**Files:**

- Create: `src/engine/tradeEngine.ts`
- Test: `src/tests/tradeEngine.test.ts`

**Interfaces:**

- Produces:
  - `proposeTrade(state: GameState, trade: TradeOffer): GameState`
  - `acceptTrade(state: GameState): GameState`
  - `rejectTrade(state: GameState): GameState`
  - `validateTradeOffer(state: GameState, trade: TradeOffer): { valid: boolean; reason?: string }`

- [ ] **Step 1: Write failing tests for trade validation & execution**
      Ensure no traded properties have houses in their color group, players have sufficient cash, jail cards transfer properly, and properties change ownership cleanly.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test -- src/tests/tradeEngine.test.ts --run`
      Expected: FAIL

- [ ] **Step 3: Implement Trade Engine**
      Implement validation, asset exchange, and state update.

- [ ] **Step 4: Run test to verify it passes**
      Run: `npm test -- src/tests/tradeEngine.test.ts --run`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/tradeEngine.ts src/tests/tradeEngine.test.ts
git commit -m "feat: implement trade negotiation engine"
```

---

### Task 7: 7-AI Bot Decision System

**Files:**

- Create: `src/ai/botDecisionEngine.ts`, `src/ai/propertyValuation.ts`, `src/ai/tradeEvaluator.ts`
- Test: `src/tests/botAI.test.ts`

**Interfaces:**

- Produces:
  - `evaluateBotTurn(state: GameState, botId: number): BotDecision`
  - `evaluateBotAuctionBid(state: GameState, botId: number): number | 'PASS' | 'EXIT'`
  - `evaluateBotTrade(state: GameState, botId: number, trade: TradeOffer): boolean`
  - `evaluateBotHousing(state: GameState, botId: number): number[]` (Property indices to build on)
  - `evaluateBotDebtLiquidation(state: GameState, botId: number, debt: number): LiquidationAction[]`

- [ ] **Step 1: Write failing tests for 7 Bot behaviors**
      Test Vanderbilt's aggressive bidding, Morgan's conservative cash retention, Astor's railroad priority, Carnegie's orange/red house rush, Gould's auction hunting, Rockefeller's balanced landlord style, Girard's fair trade evaluation.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test -- src/tests/botAI.test.ts --run`
      Expected: FAIL

- [ ] **Step 3: Implement Bot decision engine and valuation algorithms**
      Implement individual bot decision profiles with personality-specific weights and thresholds.

- [ ] **Step 4: Run test to verify it passes**
      Run: `npm test -- src/tests/botAI.test.ts --run`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/ai/ src/tests/botAI.test.ts
git commit -m "feat: implement 7 distinct AI bot decision profiles"
```

---

### Task 8: Turn Orchestrator & Game Context Hook

**Files:**

- Create: `src/context/GameContext.tsx`, `src/hooks/useGameEngine.ts`, `src/hooks/useBotRunner.ts`
- Test: `src/tests/useGameEngine.test.ts`

**Interfaces:**

- Produces:
  - React Context & Hook providing full game state, dispatch actions, bot execution runner, speed settings (`Normal` | `Fast` | `Instant`), and auto-pause for interactive human events.

- [ ] **Step 1: Write test for turn progression and bot speed runner**
      Verify turn transitions from player to player, bot action scheduling, and pause on human auction/trade.

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test -- src/tests/useGameEngine.test.ts --run`
      Expected: FAIL

- [ ] **Step 3: Implement GameContext and useBotRunner**
      Implement async loop with configurable delays, action dispatching, and sound/log hooks.

- [ ] **Step 4: Run test to verify it passes**
      Run: `npm test -- src/tests/useGameEngine.test.ts --run`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/context/ src/hooks/ src/tests/useGameEngine.test.ts
git commit -m "feat: implement game context and asynchronous bot runner"
```

---

### Task 9: Minimalist 11×11 Grid Board & Square Components

**Files:**

- Create: `src/components/board/MonopolyBoard.tsx`, `src/components/board/SquareCell.tsx`, `src/components/board/CornerCell.tsx`, `src/components/board/TokenBadge.tsx`, `src/components/board/HouseHotelPips.tsx`
- Test: `src/tests/MonopolyBoard.test.tsx`

**Interfaces:**

- Produces: Full interactive 11×11 grid board displaying all 40 squares, authentic color bands, price tags, owner indicator pips, house/hotel markers, player tokens with smooth transitions, and click-to-inspect deed handlers.

- [ ] **Step 1: Write unit test for Board render and square mapping**
      Verify 40 squares mapped in correct clockwise perimeter order (Bottom: 0-10, Left: 10-20, Top: 20-30, Right: 30-0).

- [ ] **Step 2: Run test to verify it fails**
      Run: `npm test -- src/tests/MonopolyBoard.test.tsx --run`
      Expected: FAIL

- [ ] **Step 3: Implement MonopolyBoard and SquareCell components**
      Implement responsive CSS Grid with custom styling matching our design tokens (warm canvas `#F8F6F0`, slate borders, authentic property swatches).

- [ ] **Step 4: Run test to verify it passes**
      Run: `npm test -- src/tests/MonopolyBoard.test.tsx --run`
      Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/board/ src/tests/MonopolyBoard.test.tsx
git commit -m "feat: implement 11x11 grid monopoly board and square components"
```

---

### Task 10: Center Arena & Interactive Controls

**Files:**

- Create: `src/components/board/CenterHub.tsx`, `src/components/board/DiceCup.tsx`, `src/components/board/ActionControls.tsx`, `src/components/board/CardReveal.tsx`

**Interfaces:**

- Produces: Center board hub with 3D-styled flat dice roll visual, action buttons (Roll Dice, Buy Property, Auction, Build House, Mortgage, Trade, End Turn), and card draw presentation.

- [ ] **Step 1: Implement DiceCup, ActionControls, and CardReveal**
      Build interactive tactile controls with keyboard navigation support (Space to roll, Enter to confirm).

- [ ] **Step 2: Commit**

```bash
git add src/components/board/
git commit -m "feat: implement center hub, dice cup, and action controls"
```

---

### Task 11: Modals (Deed Inspector, Auction Arena, Trade Table, Game Over)

**Files:**

- Create:
  - `src/components/modals/DeedModal.tsx`
  - `src/components/modals/AuctionModal.tsx`
  - `src/components/modals/TradeModal.tsx`
  - `src/components/modals/DebtModal.tsx`
  - `src/components/modals/GameOverModal.tsx`

**Interfaces:**

- Produces:
  - `DeedModal`: Card deed inspection with flip animation, rent tiers table, house buy/sell buttons, mortgage button.
  - `AuctionModal`: Live 8-player bidding arena with real-time bid updates, custom bid input, increment buttons, and exit/pass controls.
  - `TradeModal`: Interactive side-by-side asset exchange with cash sliders, property check-lists, jail card toggles, and live AI acceptance evaluation.
  - `GameOverModal`: Podium & stats leaderboard showing rounds played, total wealth, monopolies built.

- [ ] **Step 1: Implement all 5 modals with accessible dialog semantics**
      Build crisp, minimalist modals with clean typography and responsive layout.

- [ ] **Step 2: Commit**

```bash
git add src/components/modals/
git commit -m "feat: implement deed inspector, auction arena, trade, debt, and game over modals"
```

---

### Task 12: Player Leaderboard, Live Event Log & Navigation Bar

**Files:**

- Create:
  - `src/components/sidebar/PlayerLeaderboard.tsx`
  - `src/components/sidebar/EventLog.tsx`
  - `src/components/ui/TopNav.tsx`
  - `src/components/layout/GameLayout.tsx`

**Interfaces:**

- Produces: Complete game layout combining TopNav (turn count, speed toggle, reset), Left Board Arena, and Right Sidebar with 8-player standings, net worth cards, and filterable live game log.

- [ ] **Step 1: Implement Sidebar components, TopNav, and Main Layout**
      Assemble all layout modules into a unified, responsive interface.

- [ ] **Step 2: Commit**

```bash
git add src/components/sidebar/ src/components/ui/ src/components/layout/ src/App.tsx
git commit -m "feat: implement player leaderboard, live event log, top nav, and game layout"
```

---

### Task 13: End-to-End Game Flow Verification & Polish

**Files:**

- Test: `src/tests/e2eGameFlow.test.ts`
- Modify: Polish UI styling, animations, responsiveness across mobile/desktop viewports.

- [ ] **Step 1: Write and run full game simulation tests**
      Simulate 100+ turns with all 8 players, testing auctions, trades, housing rushes, and bankruptcy elimination.

- [ ] **Step 2: Run all test suites across the repository**
      Run: `npm test -- --run`
      Expected: 100% tests passing.

- [ ] **Step 3: Run production build and verify bundle**
      Run: `npm run build`
      Expected: Clean build with zero TypeScript or bundling errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "test: verify end-to-end 8-player game simulation and build"
```
