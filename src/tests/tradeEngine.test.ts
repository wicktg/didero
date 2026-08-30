import { describe, it, expect } from "vitest";
import { createInitialGameState } from "../engine/gameEngine";
import {
  proposeTrade,
  acceptTrade,
  validateTradeOffer,
} from "../engine/tradeEngine";
import { TradeOffer } from "../types/game";

describe("Trade Negotiation Engine", () => {
  const createMockTrade = (overrides?: Partial<TradeOffer>): TradeOffer => ({
    id: "test_trade_1",
    initiatorId: 0,
    recipientId: 1,
    offeredMoney: 100,
    requestedMoney: 0,
    offeredProperties: [1], // Mediterranean Ave
    requestedProperties: [3], // Baltic Ave
    offeredJailCards: { chance: false, communityChest: false },
    requestedJailCards: { chance: false, communityChest: false },
    ...overrides,
  });

  it("validates and executes asset transfer on trade acceptance", () => {
    let state = createInitialGameState();
    state.properties[1].ownerId = 0;
    state.properties[3].ownerId = 1;

    const trade = createMockTrade();
    const validation = validateTradeOffer(state, trade);
    expect(validation.valid).toBe(true);

    state = proposeTrade(state, trade);
    expect(state.activeTrade).toEqual(trade);

    state = acceptTrade(state);
    expect(state.activeTrade).toBeNull();

    // Property ownership swapped
    expect(state.properties[1].ownerId).toBe(1);
    expect(state.properties[3].ownerId).toBe(0);

    // Cash swapped ($100 transferred from 0 to 1)
    expect(state.players[0].money).toBe(1400); // 1500 - 100
    expect(state.players[1].money).toBe(1600); // 1500 + 100
  });

  it("transfers get out of jail cards properly", () => {
    let state = createInitialGameState();
    state.players[0].getOutOfJailCards.chance = 1;

    const trade = createMockTrade({
      offeredProperties: [],
      requestedProperties: [],
      offeredMoney: 0,
      requestedMoney: 50,
      offeredJailCards: { chance: true, communityChest: false },
    });

    state = proposeTrade(state, trade);
    state = acceptTrade(state);

    expect(state.players[0].getOutOfJailCards.chance).toBe(0);
    expect(state.players[1].getOutOfJailCards.chance).toBe(1);
    expect(state.players[0].money).toBe(1550);
    expect(state.players[1].money).toBe(1450);
  });

  it("rejects trading properties if houses exist in the color group", () => {
    const state = createInitialGameState();
    state.properties[1].ownerId = 0;
    state.properties[3].ownerId = 0;
    state.properties[1].houses = 2; // Brown group has houses!

    const trade = createMockTrade({
      offeredProperties: [1],
      requestedProperties: [],
    });

    const validation = validateTradeOffer(state, trade);
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain("houses");
  });

  it("rejects trade if initiator has insufficient funds", () => {
    const state = createInitialGameState();
    state.players[0].money = 50;

    const trade = createMockTrade({
      offeredMoney: 500,
      offeredProperties: [],
      requestedProperties: [],
    });

    const validation = validateTradeOffer(state, trade);
    expect(validation.valid).toBe(false);
  });
});
