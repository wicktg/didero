import { describe, it, expect } from "vitest";
import { createInitialGameState } from "../engine/gameEngine";
import {
  startAuction,
  placeBid,
  passBid,
  exitAuction,
} from "../engine/auctionEngine";

describe("Auction Engine", () => {
  it("starts an auction with all eligible players", () => {
    let state = createInitialGameState();
    state = startAuction(state, 39); // Boardwalk

    expect(state.turnPhase).toBe("AUCTION");
    expect(state.activeAuction).toBeDefined();
    expect(state.activeAuction?.propertyIndex).toBe(39);
    expect(state.activeAuction?.highestBid).toBe(0);
    expect(state.activeAuction?.highestBidderId).toBeNull();
    expect(state.activeAuction?.activeParticipants).toHaveLength(state.players.length);
  });

  it("records valid bids and advances current bidder", () => {
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
    expect(state.activeAuction?.currentBidderId).toBe(0);
  });

  it("rejects bids lower than highest bid + increment or exceeding money", () => {
    let state = createInitialGameState();
    state = startAuction(state, 39);

    state = placeBid(state, 0, 100);

    // Bid lower than min required ($110)
    const stateUnderbid = placeBid(state, 1, 105);
    expect(stateUnderbid.activeAuction?.highestBid).toBe(100);

    // Bid more than player has ($1500)
    const stateOverbid = placeBid(state, 1, 2000);
    expect(stateOverbid.activeAuction?.highestBid).toBe(100);
  });

  it("finalizes auction when all other participants pass", () => {
    let state = createInitialGameState();
    state = startAuction(state, 39);

    // Player 0 bids $300
    state = placeBid(state, 0, 300);

    // All other players pass
    for (let i = 1; i < state.players.length; i++) {
      state = passBid(state, i);
    }

    // Now turn returns to Player 0 (highest bidder) -> Auction finalized!
    expect(state.activeAuction).toBeNull();
    expect(state.properties[39].ownerId).toBe(0);
    expect(state.players[0].money).toBe(1200); // 1500 - 300
  });

  it("removes players who exit the auction", () => {
    let state = createInitialGameState();
    state = startAuction(state, 39);

    state = exitAuction(state, 1);
    expect(state.activeAuction?.activeParticipants).not.toContain(1);
  });
});
