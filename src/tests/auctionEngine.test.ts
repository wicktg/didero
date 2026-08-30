import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../engine/gameEngine';
import { startAuction, placeBid, passBid, exitAuction } from '../engine/auctionEngine';

describe('Auction Engine', () => {
  it('starts an auction with all 8 eligible players', () => {
    let state = createInitialGameState();
    state = startAuction(state, 39); // Boardwalk

    expect(state.turnPhase).toBe('AUCTION');
    expect(state.activeAuction).toBeDefined();
    expect(state.activeAuction?.propertyIndex).toBe(39);
    expect(state.activeAuction?.highestBid).toBe(0);
    expect(state.activeAuction?.highestBidderId).toBeNull();
    expect(state.activeAuction?.activeParticipants).toHaveLength(8);
  });

  it('records valid bids and advances current bidder', () => {
    let state = createInitialGameState();
    state = startAuction(state, 39);

    // Player 0 bids $100
    state = placeBid(state, 0, 100);
    expect(state.activeAuction?.highestBid).toBe(100);
    expect(state.activeAuction?.highestBidderId).toBe(0);
    expect(state.activeAuction?.currentBidderId).toBe(1); // Advanced to Player 1

    // Player 1 bids $150
    state = placeBid(state, 1, 150);
    expect(state.activeAuction?.highestBid).toBe(150);
    expect(state.activeAuction?.highestBidderId).toBe(1);
    expect(state.activeAuction?.currentBidderId).toBe(2);
  });

  it('rejects bids lower than highest bid + increment or exceeding money', () => {
    let state = createInitialGameState();
    state = startAuction(state, 39);

    state = placeBid(state, 0, 200);

    // Player 1 bids $150 (too low)
    const stateTooLow = placeBid(state, 1, 150);
    expect(stateTooLow.activeAuction?.highestBid).toBe(200);
    expect(stateTooLow.activeAuction?.highestBidderId).toBe(0);

    // Player 1 bids $5000 (exceeds $1500 money)
    const stateTooHigh = placeBid(state, 1, 5000);
    expect(stateTooHigh.activeAuction?.highestBid).toBe(200);
  });

  it('awards property to highest bidder when all others pass', () => {
    let state = createInitialGameState();
    state = startAuction(state, 39);

    // Player 0 bids $300
    state = placeBid(state, 0, 300);

    // All players from 1 to 7 pass
    for (let i = 1; i <= 7; i++) {
      state = passBid(state, i);
    }

    // Now turn returns to Player 0 (highest bidder) -> Auction finalized!
    expect(state.activeAuction).toBeNull();
    expect(state.properties[39].ownerId).toBe(0);
    expect(state.players[0].money).toBe(1200); // 1500 - 300
  });

  it('removes players who exit the auction', () => {
    let state = createInitialGameState();
    state = startAuction(state, 39);

    state = exitAuction(state, 7);
    expect(state.activeAuction?.activeParticipants).not.toContain(7);
  });
});
