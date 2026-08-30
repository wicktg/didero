import { describe, it, expect } from "vitest";
import { createInitialGameState } from "../engine/gameEngine";
import { gameReducer } from "../engine/gameReducer";

describe("Turn Progression and Orchestration", () => {
  it("advances currentTurnPlayerId through 8 players and skips bankrupt players", () => {
    let state = createInitialGameState(8);
    expect(state.currentTurnPlayerId).toBe(0);

    // End human's turn
    state.turnPhase = "END_TURN";
    state = gameReducer(state, { type: "END_TURN" });
    expect(state.currentTurnPlayerId).toBe(1);
    expect(state.turnPhase).toBe("ROLL");

    // Make Player 2 bankrupt
    state.players[2].isBankrupt = true;

    // End Player 1's turn -> should skip Player 2 and go to Player 3
    state.turnPhase = "END_TURN";
    state = gameReducer(state, { type: "END_TURN" });
    expect(state.currentTurnPlayerId).toBe(3);
  });

  it("updates bot speed settings", () => {
    let state = createInitialGameState();
    expect(state.botSpeed).toBe("normal");

    state = gameReducer(state, {
      type: "SET_BOT_SPEED",
      payload: { speed: "fast" },
    });
    expect(state.botSpeed).toBe("fast");

    state = gameReducer(state, {
      type: "SET_BOT_SPEED",
      payload: { speed: "instant" },
    });
    expect(state.botSpeed).toBe("instant");
  });

  it("declares winner and GAME_OVER when only 1 active player remains", () => {
    let state = createInitialGameState(8);
    // Bankrupt players 1 through 6
    for (let i = 1; i <= 6; i++) {
      state.players[i].isBankrupt = true;
    }

    // Now Player 7 goes bankrupt to Player 0
    state.turnPhase = "DEBT_RESOLUTION";
    state.debtInfo = { debtorId: 7, creditorId: 0, amountOwed: 500 };
    state = gameReducer(state, {
      type: "DECLARE_BANKRUPTCY",
      payload: { playerId: 7 },
    });

    expect(state.turnPhase).toBe("GAME_OVER");
    expect(state.gameWinnerId).toBe(0);
  });
});
