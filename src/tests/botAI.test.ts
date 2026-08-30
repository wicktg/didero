import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../engine/gameEngine';
import {
  evaluateBotBuy,
  evaluateBotAuctionBid,
  evaluateBotHouseBuilding,
  evaluateBotDebtLiquidation,
} from '../ai/botDecisionEngine';
import { calculatePropertyValuation } from '../ai/propertyValuation';
import { evaluateTradeForBot } from '../ai/tradeEvaluator';
import { TradeOffer } from '../types/game';

describe('7-AI Bot Decision Engine', () => {
  it('evaluates property buy decision with personality cash reserves', () => {
    const state = createInitialGameState();
    // Bot 1 (Vanderbilt - aggressive, reserve $120) with $300 money
    state.players[1].money = 300;
    // Boardwalk (index 39, cost $400) -> Cannot afford
    expect(evaluateBotBuy(state, 1, 39)).toBe(false);

    // St. Charles Place (index 11, cost $140) -> 300 - 140 = $160 > $120 reserve -> Buys!
    expect(evaluateBotBuy(state, 1, 11)).toBe(true);

    // Bot 2 (Morgan - conservative, reserve $450) with $500 money
    state.players[2].money = 500;
    // St. Charles ($140) -> 500 - 140 = $360 < $450 reserve -> Declines (triggers auction)
    expect(evaluateBotBuy(state, 2, 11)).toBe(false);
  });

  it('calculates higher valuation when property completes or nears monopoly', () => {
    const state = createInitialGameState();
    // Bot 1 owns Mediterranean (1)
    state.properties[1].ownerId = 1;

    // Valuation of Baltic (3) for Bot 1 should have monopoly completion multiplier
    const valBalticForBot1 = calculatePropertyValuation(state, 1, 3);
    const valBalticForBot2 = calculatePropertyValuation(state, 2, 3);

    expect(valBalticForBot1).toBeGreaterThan(valBalticForBot2);
  });

  it('bids strategically in auctions based on valuation', () => {
    let state = createInitialGameState();
    // Start auction on Boardwalk (index 39, price $400)
    state.turnPhase = 'AUCTION';
    state.activeAuction = {
      propertyIndex: 39,
      highestBid: 200,
      highestBidderId: 0,
      currentBidderId: 1,
      activeParticipants: [0, 1, 2],
      minIncrement: 10,
    };

    // Bot 1 (Vanderbilt) evaluates auction with $1500 money
    const decision = evaluateBotAuctionBid(state, 1);
    expect(typeof decision === 'number' && decision > 200).toBe(true);
  });

  it('identifies valid house building candidates for owned monopolies', () => {
    const state = createInitialGameState();
    // Give Bot 1 (Vanderbilt) the Orange monopoly (16, 18, 19)
    state.properties[16].ownerId = 1;
    state.properties[18].ownerId = 1;
    state.properties[19].ownerId = 1;
    state.players[1].money = 1200;

    const buildTargets = evaluateBotHouseBuilding(state, 1);
    expect(buildTargets.length).toBeGreaterThan(0);
    expect([16, 18, 19]).toContain(buildTargets[0]);
  });

  it('evaluates trades objectively with net gain thresholds', () => {
    const state = createInitialGameState();
    state.properties[1].ownerId = 0; // Human owns Mediterranean
    state.properties[3].ownerId = 1; // Bot 1 owns Baltic

    // Human offers $500 for Baltic (price $60)
    const generousTrade: TradeOffer = {
      id: 'trade_test',
      initiatorId: 0,
      recipientId: 1,
      offeredMoney: 500,
      requestedMoney: 0,
      offeredProperties: [],
      requestedProperties: [3],
      offeredJailCards: { chance: false, communityChest: false },
      requestedJailCards: { chance: false, communityChest: false },
    };

    expect(evaluateTradeForBot(state, 1, generousTrade)).toBe(true);

    // Human offers $10 for Baltic
    const lowballTrade: TradeOffer = {
      ...generousTrade,
      offeredMoney: 10,
    };

    expect(evaluateTradeForBot(state, 1, lowballTrade)).toBe(false);
  });

  it('formulates liquidation actions for debt resolution', () => {
    const state = createInitialGameState();
    state.players[1].money = -100; // In debt
    // Bot 1 owns Reading RR (index 5, price $200, mortgage $100)
    state.properties[5].ownerId = 1;

    const liquidation = evaluateBotDebtLiquidation(state, 1, 100);
    expect(liquidation.canSurvive).toBe(true);
    expect(liquidation.actions).toEqual([
      { type: 'MORTGAGE_PROPERTY', payload: { propertyIndex: 5 } },
    ]);
  });
});
