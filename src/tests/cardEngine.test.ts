import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../engine/gameEngine';
import { applyCardEffect, drawCard } from '../engine/cardEngine';
import { Card } from '../types/game';

describe('Card Engine (Chance & Community Chest)', () => {
  it('draws cards and cycles discards when empty', () => {
    let state = createInitialGameState();
    state.chanceDeck = [0]; // 1 card left
    state.chanceDiscard = [1, 2, 3];

    const res1 = drawCard(state, 'chance');
    expect(res1.card).toBeDefined();
    expect(res1.state.chanceDeck).toHaveLength(0);

    // Drawing again should reshuffle discard into deck
    const res2 = drawCard(res1.state, 'chance');
    expect(res2.card).toBeDefined();
    expect(res2.state.chanceDeck.length).toBeGreaterThan(0);
  });

  it('handles ADVANCE_TO card with pass GO check', () => {
    let state = createInitialGameState();
    state.players[0].position = 35;
    state.players[0].money = 1000;

    const advanceGoCard: Card = {
      id: 'test_go',
      deck: 'chance',
      text: 'Advance to GO',
      action: { type: 'ADVANCE_TO', targetIndex: 0, passGoCheck: true },
    };

    state = applyCardEffect(state, advanceGoCard, 0);
    expect(state.players[0].position).toBe(0);
    expect(state.players[0].money).toBe(1200); // 1000 + 200
  });

  it('handles ADVANCE_TO_NEAREST_RAILROAD with 2x rent on owned railroad', () => {
    let state = createInitialGameState();
    state.players[0].position = 2; // Near Reading Railroad (index 5)
    // Reading RR owned by Player 1
    state.properties[5].ownerId = 1;

    const advanceRailroadCard: Card = {
      id: 'test_rr',
      deck: 'chance',
      text: 'Advance to nearest Railroad',
      action: { type: 'ADVANCE_TO_NEAREST_RAILROAD' },
    };

    state = applyCardEffect(state, advanceRailroadCard, 0);
    expect(state.players[0].position).toBe(5);
    // Standard 1 RR rent is $25 -> 2x rent is $50
    expect(state.players[0].money).toBe(1450); // 1500 - 50
    expect(state.players[1].money).toBe(1550); // 1500 + 50
  });

  it('handles ADVANCE_TO_NEAREST_UTILITY with 10x dice on owned utility', () => {
    let state = createInitialGameState();
    state.players[0].position = 7; // Near Electric Company (index 12)
    state.dice = [3, 4]; // Total 7
    // Electric Co owned by Player 1
    state.properties[12].ownerId = 1;

    const advanceUtilityCard: Card = {
      id: 'test_util',
      deck: 'chance',
      text: 'Advance to nearest Utility',
      action: { type: 'ADVANCE_TO_NEAREST_UTILITY' },
    };

    state = applyCardEffect(state, advanceUtilityCard, 0);
    expect(state.players[0].position).toBe(12);
    // 10x dice = 10 * 7 = 70 rent
    expect(state.players[0].money).toBe(1430); // 1500 - 70
    expect(state.players[1].money).toBe(1570); // 1500 + 70
  });

  it('handles PAY_EACH_PLAYER and COLLECT_FROM_EACH_PLAYER', () => {
    let state = createInitialGameState();
    // Chairman of the board: pay each player $50 (7 other players = $350)
    const payEachCard: Card = {
      id: 'test_pay_each',
      deck: 'chance',
      text: 'Pay each player $50',
      action: { type: 'PAY_EACH_PLAYER', amount: 50 },
    };

    state = applyCardEffect(state, payEachCard, 0);
    expect(state.players[0].money).toBe(1150); // 1500 - (7 * 50) = 1150
    expect(state.players[1].money).toBe(1550); // 1500 + 50

    // Birthday: collect $10 from each player (7 other players = $70)
    const collectEachCard: Card = {
      id: 'test_collect_each',
      deck: 'communityChest',
      text: 'Collect $10 from each player',
      action: { type: 'COLLECT_FROM_EACH_PLAYER', amount: 10 },
    };

    state = applyCardEffect(state, collectEachCard, 0);
    expect(state.players[0].money).toBe(1220); // 1150 + 70
    expect(state.players[1].money).toBe(1540); // 1550 - 10
  });

  it('handles GENERAL_REPAIRS for houses and hotels', () => {
    let state = createInitialGameState();
    // Player 0 owns Boardwalk with 1 hotel (5 houses) and Park Place with 3 houses
    state.properties[39].ownerId = 0;
    state.properties[39].houses = 5; // Hotel

    state.properties[37].ownerId = 0;
    state.properties[37].houses = 3; // 3 Houses

    const repairsCard: Card = {
      id: 'test_repairs',
      deck: 'chance',
      text: 'Property repairs: $25 per house, $100 per hotel',
      action: { type: 'GENERAL_REPAIRS', perHouse: 25, perHotel: 100 },
    };

    // Total: (3 * 25) + (1 * 100) = 75 + 100 = $175
    state = applyCardEffect(state, repairsCard, 0);
    expect(state.players[0].money).toBe(1325); // 1500 - 175
  });

  it('handles GET_OUT_OF_JAIL_FREE cards', () => {
    let state = createInitialGameState();
    const jailCard: Card = {
      id: 'test_jail_card',
      deck: 'chance',
      text: 'Get Out of Jail Free',
      action: { type: 'GET_OUT_OF_JAIL_FREE' },
    };

    state = applyCardEffect(state, jailCard, 0);
    expect(state.players[0].getOutOfJailCards.chance).toBe(1);
  });
});
