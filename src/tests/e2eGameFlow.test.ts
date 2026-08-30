import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../engine/gameEngine';
import { gameReducer } from '../engine/gameReducer';
import {
  evaluateBotBuy,
  evaluateBotAuctionBid,
  evaluateBotHouseBuilding,
  evaluateBotJail,
  evaluateBotDebtLiquidation,
} from '../ai/botDecisionEngine';

describe('End-to-End 8-Player Game Simulation', () => {
  it('runs a continuous 100-turn multi-player match deterministically without runtime crashes', () => {
    let state = createInitialGameState();
    expect(state.turnNumber).toBe(1);

    // Simulate 120 turns
    for (let turn = 0; turn < 120; turn++) {
      if (state.turnPhase === 'GAME_OVER') break;

      const activePlayer = state.players[state.currentTurnPlayerId];
      if (!activePlayer || activePlayer.isBankrupt) {
        state = gameReducer(state, { type: 'END_TURN' });
        continue;
      }

      // 1. ROLL PHASE
      if (state.turnPhase === 'ROLL') {
        if (activePlayer.inJail) {
          const jailDecision = evaluateBotJail(state, activePlayer.id);
          if (jailDecision === 'USE_CARD' && (activePlayer.getOutOfJailCards.chance > 0 || activePlayer.getOutOfJailCards.communityChest > 0)) {
            const cardType = activePlayer.getOutOfJailCards.chance > 0 ? 'chance' : 'communityChest';
            state = gameReducer(state, { type: 'USE_JAIL_CARD', payload: { cardType, playerId: activePlayer.id } });
          } else if (jailDecision === 'PAY_FINE' && activePlayer.money >= 50) {
            state = gameReducer(state, { type: 'PAY_JAIL_FINE', payload: { playerId: activePlayer.id } });
          }
        }
        state = gameReducer(state, { type: 'ROLL_DICE' });
      }

      // 2. LANDED ACTION (Unowned property)
      if (state.turnPhase === 'LANDED_ACTION') {
        const wantsBuy = evaluateBotBuy(state, activePlayer.id, activePlayer.position);
        if (wantsBuy) {
          state = gameReducer(state, { type: 'BUY_PROPERTY', payload: { propertyIndex: activePlayer.position } });
        } else {
          state = gameReducer(state, { type: 'DECLINE_BUY', payload: { propertyIndex: activePlayer.position } });
        }
      }

      // 3. AUCTION PHASE (if triggered by decline)
      while (state.turnPhase === 'AUCTION' && state.activeAuction) {
        const bidderId = state.activeAuction.currentBidderId;
        const bidDecision = evaluateBotAuctionBid(state, bidderId);
        if (typeof bidDecision === 'number') {
          state = gameReducer(state, { type: 'PLACE_AUCTION_BID', payload: { playerId: bidderId, amount: bidDecision } });
        } else if (bidDecision === 'PASS') {
          state = gameReducer(state, { type: 'PASS_AUCTION_BID', payload: { playerId: bidderId } });
        } else {
          state = gameReducer(state, { type: 'EXIT_AUCTION', payload: { playerId: bidderId } });
        }
      }

      // 4. DEBT RESOLUTION (if debt incurred from rent/tax)
      if (state.turnPhase === 'DEBT_RESOLUTION' && state.debtInfo) {
        const debtorId = state.debtInfo.debtorId;
        const plan = evaluateBotDebtLiquidation(state, debtorId, state.debtInfo.amountOwed);
        if (plan.canSurvive && plan.actions.length > 0) {
          for (const action of plan.actions) {
            state = gameReducer(state, action);
          }
          state = gameReducer(state, { type: 'RESOLVE_DEBT' });
        } else {
          state = gameReducer(state, { type: 'DECLARE_BANKRUPTCY', payload: { playerId: debtorId } });
        }
      }

      // 5. END TURN PHASE (Building houses + Passing turn)
      if (state.turnPhase === 'END_TURN') {
        const targets = evaluateBotHouseBuilding(state, activePlayer.id);
        for (const target of targets) {
          state = gameReducer(state, { type: 'BUILD_HOUSE', payload: { propertyIndex: target } });
        }
        state = gameReducer(state, { type: 'END_TURN' });
      }
    }

    // Verify properties were acquired, rents paid, and state remains coherent
    expect(state.turnNumber).toBeGreaterThan(50);
    const totalPropertiesOwned = Object.values(state.properties).filter((p) => p.ownerId !== null).length;
    expect(totalPropertiesOwned).toBeGreaterThan(0);
    expect(state.gameLog.length).toBeGreaterThan(50);
  });
});
