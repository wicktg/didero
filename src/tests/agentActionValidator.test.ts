import { describe, it, expect } from "vitest";
import { createInitialGameState } from "../engine/gameEngine";
import {
  validateAndSanitizeAgentAction,
  getSafeFallbackAction,
} from "../ai/agentActionValidator";
import { GameState, TradeOffer } from "../types/game";
import { startAuction } from "../engine/auctionEngine";

describe("Agent Action Validator", () => {
  describe("getSafeFallbackAction", () => {
    it("returns ROLL_DICE for ROLL phase", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      const fallback = getSafeFallbackAction(state, 0);
      expect(fallback).toEqual({ type: "ROLL_DICE" });
    });

    it("returns DECLINE_BUY for LANDED_ACTION phase", () => {
      const state = createInitialGameState();
      state.turnPhase = "LANDED_ACTION";
      state.players[0].position = 3;
      const fallback = getSafeFallbackAction(state, 0);
      expect(fallback).toEqual({
        type: "DECLINE_BUY",
        payload: { propertyIndex: 3 },
      });
    });

    it("returns PASS_AUCTION_BID for AUCTION phase", () => {
      const state = createInitialGameState();
      state.turnPhase = "AUCTION";
      const fallback = getSafeFallbackAction(state, 1);
      expect(fallback).toEqual({
        type: "PASS_AUCTION_BID",
        payload: { playerId: 1 },
      });
    });

    it("returns RESOLVE_DEBT for DEBT_RESOLUTION when money >= 0", () => {
      const state = createInitialGameState();
      state.turnPhase = "DEBT_RESOLUTION";
      state.players[0].money = 100;
      const fallback = getSafeFallbackAction(state, 0);
      expect(fallback).toEqual({ type: "RESOLVE_DEBT" });
    });

    it("returns DECLARE_BANKRUPTCY for DEBT_RESOLUTION when money < 0", () => {
      const state = createInitialGameState();
      state.turnPhase = "DEBT_RESOLUTION";
      state.players[0].money = -50;
      const fallback = getSafeFallbackAction(state, 0);
      expect(fallback).toEqual({
        type: "DECLARE_BANKRUPTCY",
        payload: { playerId: 0 },
      });
    });

    it("returns END_TURN for END_TURN phase", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      const fallback = getSafeFallbackAction(state, 0);
      expect(fallback).toEqual({ type: "END_TURN" });
    });

    it("returns REJECT_TRADE for TRADE phase", () => {
      const state = createInitialGameState();
      state.turnPhase = "TRADE";
      const fallback = getSafeFallbackAction(state, 1);
      expect(fallback).toEqual({ type: "REJECT_TRADE" });
    });
  });

  describe("ROLL phase validation & fallbacks", () => {
    it("validates ROLL_DICE when it is agent's turn", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "ROLL_DICE",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({ type: "ROLL_DICE" });
    });

    it("accepts string shorthand 'ROLL' or 'ROLL_DICE'", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;

      const result = validateAndSanitizeAgentAction(state, 0, "ROLL");
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({ type: "ROLL_DICE" });
    });

    it("rejects ROLL_DICE when it is not agent's turn", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;

      const result = validateAndSanitizeAgentAction(state, 1, {
        type: "ROLL_DICE",
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "ROLL_DICE" });
      expect(result.reason).toContain("not player 1's turn");
    });

    it("validates PAY_JAIL_FINE when agent is in jail and has $50+", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      state.players[0].inJail = true;
      state.players[0].money = 500;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "PAY_JAIL_FINE",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "PAY_JAIL_FINE",
        payload: { playerId: 0 },
      });
    });

    it("falls back to ROLL_DICE if PAY_JAIL_FINE is attempted when not in jail", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      state.players[0].inJail = false;
      state.players[0].money = 500;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "PAY_JAIL_FINE",
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "ROLL_DICE" });
      expect(result.reason).toContain("not in jail");
    });

    it("falls back to ROLL_DICE if PAY_JAIL_FINE is attempted with insufficient funds", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      state.players[0].inJail = true;
      state.players[0].money = 30;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "PAY_JAIL_FINE",
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "ROLL_DICE" });
      expect(result.reason).toContain("Insufficient funds");
    });

    it("validates USE_JAIL_CARD with Chance card when in jail", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      state.players[0].inJail = true;
      state.players[0].getOutOfJailCards.chance = 1;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "USE_JAIL_CARD",
        payload: { cardType: "chance" },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "USE_JAIL_CARD",
        payload: { cardType: "chance", playerId: 0 },
      });
    });

    it("validates USE_JAIL_CARD with Community Chest card when in jail", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      state.players[0].inJail = true;
      state.players[0].getOutOfJailCards.communityChest = 1;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "USE_JAIL_CARD",
        payload: { cardType: "communityChest" },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "USE_JAIL_CARD",
        payload: { cardType: "communityChest", playerId: 0 },
      });
    });

    it("auto-selects available jail card if cardType is unspecified", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      state.players[0].inJail = true;
      state.players[0].getOutOfJailCards.communityChest = 1;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "USE_JAIL_CARD",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "USE_JAIL_CARD",
        payload: { cardType: "communityChest", playerId: 0 },
      });
    });

    it("falls back to ROLL_DICE if USE_JAIL_CARD is attempted without cards", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      state.players[0].inJail = true;
      state.players[0].getOutOfJailCards = { chance: 0, communityChest: 0 };

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "USE_JAIL_CARD",
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "ROLL_DICE" });
      expect(result.reason).toContain(
        "does not possess any Get Out of Jail Free cards",
      );
    });

    it("falls back to ROLL_DICE when out of phase action is proposed in ROLL phase", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "BUY_PROPERTY",
        payload: { propertyIndex: 1 },
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "ROLL_DICE" });
      expect(result.reason).toContain(
        'Action "BUY_PROPERTY" is not allowed during ROLL phase',
      );
    });
  });

  describe("LANDED_ACTION phase validation & fallbacks", () => {
    it("validates BUY_PROPERTY when property is unowned and player has sufficient funds", () => {
      const state = createInitialGameState();
      state.turnPhase = "LANDED_ACTION";
      state.currentTurnPlayerId = 0;
      state.players[0].position = 1; // Mediterranean Ave ($60)
      state.players[0].money = 1500;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "BUY_PROPERTY",
        payload: { propertyIndex: 1 },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "BUY_PROPERTY",
        payload: { propertyIndex: 1 },
      });
    });

    it("defaults propertyIndex to player.position if omitted in BUY_PROPERTY", () => {
      const state = createInitialGameState();
      state.turnPhase = "LANDED_ACTION";
      state.currentTurnPlayerId = 0;
      state.players[0].position = 3; // Baltic Ave ($60)
      state.players[0].money = 1500;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "BUY_PROPERTY",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "BUY_PROPERTY",
        payload: { propertyIndex: 3 },
      });
    });

    it("falls back to DECLINE_BUY if player attempts BUY_PROPERTY without enough money", () => {
      const state = createInitialGameState();
      state.turnPhase = "LANDED_ACTION";
      state.currentTurnPlayerId = 0;
      state.players[0].position = 39; // Boardwalk ($400)
      state.players[0].money = 100;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "BUY_PROPERTY",
        payload: { propertyIndex: 39 },
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({
        type: "DECLINE_BUY",
        payload: { propertyIndex: 39 },
      });
      expect(result.reason).toContain("insufficient funds");
    });

    it("falls back to DECLINE_BUY if property is already owned", () => {
      const state = createInitialGameState();
      state.turnPhase = "LANDED_ACTION";
      state.currentTurnPlayerId = 0;
      state.players[0].position = 1;
      state.properties[1].ownerId = 1;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "BUY_PROPERTY",
        payload: { propertyIndex: 1 },
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({
        type: "DECLINE_BUY",
        payload: { propertyIndex: 1 },
      });
      expect(result.reason).toContain("not available for purchase");
    });

    it("validates DECLINE_BUY", () => {
      const state = createInitialGameState();
      state.turnPhase = "LANDED_ACTION";
      state.currentTurnPlayerId = 0;
      state.players[0].position = 1;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "DECLINE_BUY",
        payload: { propertyIndex: 1 },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "DECLINE_BUY",
        payload: { propertyIndex: 1 },
      });
    });

    it("falls back to DECLINE_BUY when invalid action is proposed in LANDED_ACTION phase", () => {
      const state = createInitialGameState();
      state.turnPhase = "LANDED_ACTION";
      state.currentTurnPlayerId = 0;
      state.players[0].position = 1;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "END_TURN",
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({
        type: "DECLINE_BUY",
        payload: { propertyIndex: 1 },
      });
      expect(result.reason).toContain(
        'Action "END_TURN" is not allowed during LANDED_ACTION phase',
      );
    });
  });

  describe("AUCTION phase validation & fallbacks", () => {
    function setupAuctionState(): GameState {
      let state = createInitialGameState();
      state = startAuction(state, 1); // Mediterranean Ave ($60)
      return state;
    }

    it("validates PLACE_AUCTION_BID / PLACE_BID with valid amount", () => {
      const state = setupAuctionState();
      // currentBidderId is 0 initially (or starting bidder)
      const currentBidder = state.activeAuction!.currentBidderId;

      const result = validateAndSanitizeAgentAction(state, currentBidder, {
        type: "PLACE_BID",
        payload: { amount: 20 },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "PLACE_AUCTION_BID",
        payload: { playerId: currentBidder, amount: 20 },
      });
    });

    it("falls back to PASS_AUCTION_BID when bid is below minimum increment", () => {
      const state = setupAuctionState();
      state.activeAuction!.highestBid = 50;
      state.activeAuction!.minIncrement = 10;
      const currentBidder = state.activeAuction!.currentBidderId;

      const result = validateAndSanitizeAgentAction(state, currentBidder, {
        type: "PLACE_BID",
        payload: { amount: 55 }, // Needs at least 60
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({
        type: "PASS_AUCTION_BID",
        payload: { playerId: currentBidder },
      });
      expect(result.reason).toContain("below minimum required bid");
    });

    it("falls back to PASS_AUCTION_BID when bid exceeds available funds", () => {
      const state = setupAuctionState();
      const currentBidder = state.activeAuction!.currentBidderId;
      state.players[currentBidder].money = 100;

      const result = validateAndSanitizeAgentAction(state, currentBidder, {
        type: "PLACE_BID",
        payload: { amount: 500 },
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({
        type: "PASS_AUCTION_BID",
        payload: { playerId: currentBidder },
      });
      expect(result.reason).toContain("exceeds player's available funds");
    });

    it("falls back to PASS_AUCTION_BID when bid is not a valid number", () => {
      const state = setupAuctionState();
      const currentBidder = state.activeAuction!.currentBidderId;

      const result = validateAndSanitizeAgentAction(state, currentBidder, {
        type: "BID",
        payload: { amount: "not-a-number" },
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({
        type: "PASS_AUCTION_BID",
        payload: { playerId: currentBidder },
      });
      expect(result.reason).toContain("Invalid bid amount");
    });

    it("falls back when non-current bidder attempts to bid", () => {
      const state = setupAuctionState();
      const nonCurrentBidder =
        state.activeAuction!.currentBidderId === 0 ? 1 : 0;

      const result = validateAndSanitizeAgentAction(state, nonCurrentBidder, {
        type: "PLACE_BID",
        payload: { amount: 50 },
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({
        type: "PASS_AUCTION_BID",
        payload: { playerId: nonCurrentBidder },
      });
      expect(result.reason).toContain("not player");
    });

    it("validates PASS_AUCTION / PASS_AUCTION_BID", () => {
      const state = setupAuctionState();
      const currentBidder = state.activeAuction!.currentBidderId;

      const result = validateAndSanitizeAgentAction(state, currentBidder, {
        type: "PASS_AUCTION",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "PASS_AUCTION_BID",
        payload: { playerId: currentBidder },
      });
    });

    it("validates EXIT_AUCTION", () => {
      const state = setupAuctionState();
      const currentBidder = state.activeAuction!.currentBidderId;

      const result = validateAndSanitizeAgentAction(state, currentBidder, {
        type: "EXIT_AUCTION",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "EXIT_AUCTION",
        payload: { playerId: currentBidder },
      });
    });
  });

  describe("DEBT_RESOLUTION phase validation & fallbacks", () => {
    it("validates RESOLVE_DEBT when player has cleared debt (money >= 0)", () => {
      const state = createInitialGameState();
      state.turnPhase = "DEBT_RESOLUTION";
      state.debtInfo = { debtorId: 0, creditorId: null, amountOwed: 50 };
      state.players[0].money = 0;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "RESOLVE_DEBT",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({ type: "RESOLVE_DEBT" });
    });

    it("falls back to DECLARE_BANKRUPTCY if RESOLVE_DEBT is attempted with negative balance", () => {
      const state = createInitialGameState();
      state.turnPhase = "DEBT_RESOLUTION";
      state.debtInfo = { debtorId: 0, creditorId: null, amountOwed: 100 };
      state.players[0].money = -50;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "RESOLVE_DEBT",
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({
        type: "DECLARE_BANKRUPTCY",
        payload: { playerId: 0 },
      });
      expect(result.reason).toContain(
        "Cannot resolve debt while balance is negative",
      );
    });

    it("validates DECLARE_BANKRUPTCY", () => {
      const state = createInitialGameState();
      state.turnPhase = "DEBT_RESOLUTION";
      state.debtInfo = { debtorId: 0, creditorId: null, amountOwed: 100 };
      state.players[0].money = -50;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "DECLARE_BANKRUPTCY",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "DECLARE_BANKRUPTCY",
        payload: { playerId: 0 },
      });
    });

    it("validates MORTGAGE_PROPERTY during debt resolution when property is eligible", () => {
      const state = createInitialGameState();
      state.turnPhase = "DEBT_RESOLUTION";
      state.debtInfo = { debtorId: 0, creditorId: null, amountOwed: 100 };
      state.players[0].money = -50;
      state.properties[1] = {
        index: 1,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "MORTGAGE_PROPERTY",
        payload: { propertyIndex: 1 },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "MORTGAGE_PROPERTY",
        payload: { propertyIndex: 1 },
      });
    });

    it("validates SELL_HOUSE during debt resolution when house is sellable", () => {
      const state = createInitialGameState();
      state.turnPhase = "DEBT_RESOLUTION";
      state.debtInfo = { debtorId: 0, creditorId: null, amountOwed: 100 };
      state.players[0].money = -50;
      // Setup brown monopoly with 1 house each
      state.properties[1] = {
        index: 1,
        ownerId: 0,
        houses: 1,
        isMortgaged: false,
      };
      state.properties[3] = {
        index: 3,
        ownerId: 0,
        houses: 1,
        isMortgaged: false,
      };

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "SELL_HOUSE",
        payload: { propertyIndex: 1 },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "SELL_HOUSE",
        payload: { propertyIndex: 1 },
      });
    });
  });

  describe("END_TURN phase validation & fallbacks", () => {
    it("validates END_TURN when it is agent's turn", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "END_TURN",
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({ type: "END_TURN" });
    });

    it("validates BUILD_HOUSE when player owns full monopoly, has funds, and follows even build rule", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;
      state.players[0].money = 1000;
      state.properties[1] = {
        index: 1,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };
      state.properties[3] = {
        index: 3,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "BUILD_HOUSE",
        payload: { propertyIndex: 1 },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "BUILD_HOUSE",
        payload: { propertyIndex: 1 },
      });
    });

    it("falls back to END_TURN when attempting BUILD_HOUSE without monopoly", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;
      state.players[0].money = 1000;
      state.properties[1] = {
        index: 1,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };
      state.properties[3] = {
        index: 3,
        ownerId: 1, // owned by opponent
        houses: 0,
        isMortgaged: false,
      };

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "BUILD_HOUSE",
        payload: { propertyIndex: 1 },
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "END_TURN" });
      expect(result.reason).toContain("Cannot build house");
    });

    it("validates MORTGAGE_PROPERTY and UNMORTGAGE_PROPERTY during END_TURN", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;
      state.properties[1] = {
        index: 1,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };

      // Mortgage
      const mortResult = validateAndSanitizeAgentAction(state, 0, {
        type: "MORTGAGE_PROPERTY",
        payload: { propertyIndex: 1 },
      });
      expect(mortResult.isValid).toBe(true);
      expect(mortResult.action).toEqual({
        type: "MORTGAGE_PROPERTY",
        payload: { propertyIndex: 1 },
      });

      // Unmortgage
      state.properties[1].isMortgaged = true;
      state.players[0].money = 500;
      const unmortResult = validateAndSanitizeAgentAction(state, 0, {
        type: "UNMORTGAGE_PROPERTY",
        payload: { propertyIndex: 1 },
      });
      expect(unmortResult.isValid).toBe(true);
      expect(unmortResult.action).toEqual({
        type: "UNMORTGAGE_PROPERTY",
        payload: { propertyIndex: 1 },
      });
    });

    it("validates PROPOSE_TRADE with legal trade offer", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;
      state.properties[1] = {
        index: 1,
        ownerId: 0,
        houses: 0,
        isMortgaged: false,
      };
      state.properties[3] = {
        index: 3,
        ownerId: 1,
        houses: 0,
        isMortgaged: false,
      };

      const trade: TradeOffer = {
        id: "test-trade-1",
        initiatorId: 0,
        recipientId: 1,
        offeredMoney: 100,
        requestedMoney: 0,
        offeredProperties: [1],
        requestedProperties: [3],
        offeredJailCards: { chance: false, communityChest: false },
        requestedJailCards: { chance: false, communityChest: false },
      };

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "PROPOSE_TRADE",
        payload: { trade },
      });
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({
        type: "PROPOSE_TRADE",
        payload: { trade },
      });
    });

    it("falls back to END_TURN when PROPOSE_TRADE exceeds available funds", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;
      state.players[0].money = 50;

      const trade: TradeOffer = {
        id: "test-trade-2",
        initiatorId: 0,
        recipientId: 1,
        offeredMoney: 500, // exceeds funds
        requestedMoney: 0,
        offeredProperties: [],
        requestedProperties: [],
        offeredJailCards: { chance: false, communityChest: false },
        requestedJailCards: { chance: false, communityChest: false },
      };

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "PROPOSE_TRADE",
        payload: { trade },
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "END_TURN" });
      expect(result.reason).toContain("Insufficient funds");
    });

    it("falls back to END_TURN when invalid or unknown action is proposed in END_TURN phase", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "ROLL_DICE",
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "END_TURN" });
      expect(result.reason).toContain(
        'Action "ROLL_DICE" is not allowed during END_TURN phase',
      );
    });
  });

  describe("TRADE phase validation & fallbacks", () => {
    it("validates ACCEPT_TRADE and REJECT_TRADE when agent is recipient", () => {
      const state = createInitialGameState();
      state.turnPhase = "TRADE";
      state.activeTrade = {
        id: "trade-1",
        initiatorId: 0,
        recipientId: 1,
        offeredMoney: 50,
        requestedMoney: 0,
        offeredProperties: [],
        requestedProperties: [],
        offeredJailCards: { chance: false, communityChest: false },
        requestedJailCards: { chance: false, communityChest: false },
      };

      const acceptResult = validateAndSanitizeAgentAction(state, 1, {
        type: "ACCEPT_TRADE",
      });
      expect(acceptResult.isValid).toBe(true);
      expect(acceptResult.action).toEqual({ type: "ACCEPT_TRADE" });

      const rejectResult = validateAndSanitizeAgentAction(state, 1, {
        type: "REJECT_TRADE",
      });
      expect(rejectResult.isValid).toBe(true);
      expect(rejectResult.action).toEqual({ type: "REJECT_TRADE" });
    });

    it("falls back to REJECT_TRADE when agent is not the recipient", () => {
      const state = createInitialGameState();
      state.turnPhase = "TRADE";
      state.activeTrade = {
        id: "trade-1",
        initiatorId: 0,
        recipientId: 1,
        offeredMoney: 50,
        requestedMoney: 0,
        offeredProperties: [],
        requestedProperties: [],
        offeredJailCards: { chance: false, communityChest: false },
        requestedJailCards: { chance: false, communityChest: false },
      };

      const result = validateAndSanitizeAgentAction(state, 0, {
        type: "ACCEPT_TRADE",
      });
      expect(result.isValid).toBe(false);
      expect(result.action).toEqual({ type: "REJECT_TRADE" });
    });
  });

  describe("Malformed, null, undefined, and edge-case inputs", () => {
    it("handles null and undefined proposedAction gracefully", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;

      const resultNull = validateAndSanitizeAgentAction(state, 0, null);
      expect(resultNull.isValid).toBe(false);
      expect(resultNull.action).toEqual({ type: "ROLL_DICE" });

      const resultUndef = validateAndSanitizeAgentAction(state, 0, undefined);
      expect(resultUndef.isValid).toBe(false);
      expect(resultUndef.action).toEqual({ type: "ROLL_DICE" });
    });

    it("handles empty object or garbage types", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;

      const resultEmpty = validateAndSanitizeAgentAction(state, 0, {});
      expect(resultEmpty.isValid).toBe(false);
      expect(resultEmpty.action).toEqual({ type: "ROLL_DICE" });

      const resultGarbage = validateAndSanitizeAgentAction(state, 0, {
        type: "SOME_RANDOM_GARBAGE_TYPE",
      });
      expect(resultGarbage.isValid).toBe(false);
      expect(resultGarbage.action).toEqual({ type: "ROLL_DICE" });
    });

    it("unwraps nested action object from LLM response structure", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;

      const llmResponse = {
        thought: "I should roll the dice to advance on the board.",
        action: {
          type: "ROLL_DICE",
        },
      };

      const result = validateAndSanitizeAgentAction(state, 0, llmResponse);
      expect(result.isValid).toBe(true);
      expect(result.action).toEqual({ type: "ROLL_DICE" });
    });

    it("handles non-existent player or bankrupt player", () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";

      const nonExistent = validateAndSanitizeAgentAction(state, 99, {
        type: "ROLL_DICE",
      });
      expect(nonExistent.isValid).toBe(false);
      expect(nonExistent.reason).toContain("not found");

      state.players[0].isBankrupt = true;
      const bankrupt = validateAndSanitizeAgentAction(state, 0, {
        type: "ROLL_DICE",
      });
      expect(bankrupt.isValid).toBe(false);
      expect(bankrupt.reason).toContain("bankrupt");
    });
  });
});
