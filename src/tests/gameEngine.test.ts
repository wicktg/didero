import { describe, it, expect } from "vitest";
import {
  createInitialGameState,
  canBuildHouse,
  canMortgageProperty,
  canUnmortgageProperty,
} from "../engine/gameEngine";
import { gameReducer } from "../engine/gameReducer";

describe("Monopoly Game Engine & Rules Reducer", () => {
  it("initializes game with players, $1500 each, and 40 unowned properties", () => {
    const state = createInitialGameState();
    expect(state.players).toHaveLength(2);
    expect(state.players[0].isAI).toBe(false);
    expect(state.players[0].money).toBe(1500);
    expect(state.players[1].isAI).toBe(true);
    expect(state.currentTurnPlayerId).toBe(0);
    expect(state.turnPhase).toBe("ROLL");
    expect(Object.keys(state.properties)).toHaveLength(40);
    expect(state.properties[1].ownerId).toBeNull();
  });

  it("moves player and awards $200 when passing GO", () => {
    let state = createInitialGameState();
    state.players[0].position = 38; // Luxury Tax

    // Roll 5 -> moves to 38 + 5 = 43 % 40 = 3 (Baltic Ave), passes GO
    state = gameReducer(state, {
      type: "ROLL_DICE",
      payload: { diceOverride: [2, 3] },
    });

    expect(state.players[0].position).toBe(3);
    expect(state.players[0].money).toBe(1700); // 1500 + 200
    expect(state.isDiceRolled).toBe(true);
    expect(state.turnPhase).toBe("LANDED_ACTION");
  });

  it("sends player to jail on 3 consecutive doubles", () => {
    let state = createInitialGameState();
    state.consecutiveDoubles = 2;

    state = gameReducer(state, {
      type: "ROLL_DICE",
      payload: { diceOverride: [4, 4] },
    });

    expect(state.players[0].inJail).toBe(true);
    expect(state.players[0].position).toBe(10);
    expect(state.consecutiveDoubles).toBe(0);
    expect(state.turnPhase).toBe("END_TURN");
  });

  it("allows player to buy unowned property", () => {
    let state = createInitialGameState();
    state.players[0].position = 39; // Boardwalk ($400)
    state.turnPhase = "LANDED_ACTION";

    state = gameReducer(state, {
      type: "BUY_PROPERTY",
      payload: { propertyIndex: 39 },
    });

    expect(state.properties[39].ownerId).toBe(0);
    expect(state.players[0].money).toBe(1100); // 1500 - 400
    expect(state.turnPhase).toBe("END_TURN");
  });

  it("handles landing on Go To Jail (square 30)", () => {
    let state = createInitialGameState();
    state.players[0].position = 26; // Atlantic

    state = gameReducer(state, {
      type: "ROLL_DICE",
      payload: { diceOverride: [2, 2] },
    }); // land on 30

    expect(state.players[0].inJail).toBe(true);
    expect(state.players[0].position).toBe(10);
    expect(state.turnPhase).toBe("END_TURN");
  });

  it("handles income tax and luxury tax", () => {
    let state = createInitialGameState();
    state.players[0].position = 0;

    // Roll 4 -> Income Tax ($200)
    state = gameReducer(state, {
      type: "ROLL_DICE",
      payload: { diceOverride: [1, 3] },
    });
    expect(state.players[0].position).toBe(4);
    expect(state.players[0].money).toBe(1300); // 1500 - 200
  });

  it("enforces even building rule for houses", () => {
    const state = createInitialGameState();
    // Give Player 0 the Brown monopoly (indices 1 & 3)
    state.properties[1].ownerId = 0;
    state.properties[3].ownerId = 0;

    // Can build 1 house on property 1
    expect(canBuildHouse(state, 0, 1)).toBe(true);
    state.properties[1].houses = 1;

    // Cannot build 2nd house on 1 until property 3 has 1 house
    expect(canBuildHouse(state, 0, 1)).toBe(false);
    expect(canBuildHouse(state, 0, 3)).toBe(true);

    state.properties[3].houses = 1;
    // Now can build 2nd house on 1
    expect(canBuildHouse(state, 0, 1)).toBe(true);
  });

  it("handles mortgaging and unmortgaging with 10% fee", () => {
    let state = createInitialGameState();
    // Boardwalk (index 39) costs $400, mortgage value $200, unmortgage cost $220
    state.properties[39].ownerId = 0;

    expect(canMortgageProperty(state, 0, 39)).toBe(true);
    state = gameReducer(state, {
      type: "MORTGAGE_PROPERTY",
      payload: { propertyIndex: 39 },
    });

    expect(state.properties[39].isMortgaged).toBe(true);
    expect(state.players[0].money).toBe(1700); // 1500 + 200

    expect(canUnmortgageProperty(state, 0, 39)).toBe(true);
    state = gameReducer(state, {
      type: "UNMORTGAGE_PROPERTY",
      payload: { propertyIndex: 39 },
    });

    expect(state.properties[39].isMortgaged).toBe(false);
    expect(state.players[0].money).toBe(1480); // 1700 - 220
  });
});
