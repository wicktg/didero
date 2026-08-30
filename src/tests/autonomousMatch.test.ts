import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useAutonomousRunner,
  getActiveDecisionMakerId,
} from "../hooks/useAutonomousRunner";
import { createInitialGameState } from "../engine/gameEngine";
import { gameReducer, GameAction } from "../engine/gameReducer";
import * as groqClient from "../ai/groqClient";
import * as serializer from "../ai/agentStateSerializer";
import * as validator from "../ai/agentActionValidator";
import { AgentTelemetryEntry } from "../types/game";

describe("Autonomous Agent Match Integration Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // TEST 1: Continuous Multi-Turn Match Progression
  // =========================================================================
  describe("1. Continuous Multi-Turn Match Progression", () => {
    it("simulates continuous multi-turn match progression between Agent 1 (Player 0) and Agent 2 (Player 1)", async () => {
      let state = createInitialGameState();
      expect(state.turnNumber).toBe(1);
      expect(state.currentTurnPlayerId).toBe(0);
      expect(state.turnPhase).toBe("ROLL");

      // Custom deterministic decision engine for Agent 0 and Agent 1
      const mockDecisionHandler = vi.fn(
        async (agentId: number, stateContext: serializer.AgentStateContext) => {
          const phase = stateContext.turnPhase;

          if (phase === "ROLL") {
            return {
              thought: `Agent ${agentId + 1}: Rolling dice for turn ${stateContext.turnNumber}.`,
              action: { type: "ROLL_DICE" },
            };
          }

          if (phase === "LANDED_ACTION") {
            const currentSq = stateContext.boardContext.currentSquare;
            if (
              currentSq.ownerId === null &&
              currentSq.price &&
              stateContext.myState.money >= currentSq.price + 100
            ) {
              return {
                thought: `Agent ${agentId + 1}: Purchasing ${currentSq.name} for $${currentSq.price}.`,
                action: {
                  type: "BUY_PROPERTY",
                  payload: { propertyIndex: currentSq.index },
                },
              };
            }
            return {
              thought: `Agent ${agentId + 1}: Declining purchase of ${currentSq.name}.`,
              action: {
                type: "DECLINE_BUY",
                payload: { propertyIndex: currentSq.index },
              },
            };
          }

          if (phase === "AUCTION" && state.activeAuction) {
            const auction = state.activeAuction;
            const minBid =
              auction.highestBid === 0
                ? 10
                : auction.highestBid + auction.minIncrement;
            if (stateContext.myState.money >= minBid + 200 && minBid <= 150) {
              return {
                thought: `Agent ${agentId + 1}: Bidding $${minBid} in auction for property ${auction.propertyIndex}.`,
                action: {
                  type: "PLACE_AUCTION_BID",
                  payload: { playerId: agentId, amount: minBid },
                },
              };
            }
            return {
              thought: `Agent ${agentId + 1}: Passing on auction.`,
              action: {
                type: "PASS_AUCTION_BID",
                payload: { playerId: agentId },
              },
            };
          }

          if (phase === "END_TURN") {
            return {
              thought: `Agent ${agentId + 1}: Finishing turn ${stateContext.turnNumber}.`,
              action: { type: "END_TURN" },
            };
          }

          return {
            thought: `Agent ${agentId + 1}: Safe fallback action.`,
            action: { type: "END_TURN" },
          };
        },
      );

      vi.spyOn(groqClient, "requestAgentDecision").mockImplementation(
        mockDecisionHandler,
      );

      const dispatch = (action: GameAction) => {
        state = gameReducer(state, action);
      };

      // Simulate 30 full decision cycles
      const recordedTelemetry: AgentTelemetryEntry[] = [];
      const MAX_STEPS = 30;

      for (let step = 0; step < MAX_STEPS; step++) {
        if (state.turnPhase === "GAME_OVER") break;

        const activePlayerId = getActiveDecisionMakerId(state);
        const stateContext = serializer.serializeStateForAgent(
          state,
          activePlayerId,
        );

        const decision = await groqClient.requestAgentDecision(
          activePlayerId,
          stateContext,
        );

        const validation = validator.validateAndSanitizeAgentAction(
          state,
          activePlayerId,
          decision.action,
        );

        expect(validation.isValid).toBe(true);

        const telem: AgentTelemetryEntry = {
          id: `telem-${step}`,
          timestamp: Date.now(),
          agentId: activePlayerId,
          agentName: state.players[activePlayerId].name,
          turnNumber: state.turnNumber,
          phase: state.turnPhase,
          thought: decision.thought,
          action: validation.action,
          isValid: validation.isValid,
          stateSnapshot: stateContext,
        };
        recordedTelemetry.push(telem);

        dispatch(validation.action);
      }

      // Verify that turns progressed across multiple rounds
      expect(state.turnNumber).toBeGreaterThan(5);
      expect(recordedTelemetry.length).toBe(MAX_STEPS);

      // Verify that both Agent 1 (Player 0) and Agent 2 (Player 1) executed actions
      const agent0Actions = recordedTelemetry.filter((t) => t.agentId === 0);
      const agent1Actions = recordedTelemetry.filter((t) => t.agentId === 1);
      expect(agent0Actions.length).toBeGreaterThan(0);
      expect(agent1Actions.length).toBeGreaterThan(0);

      // Verify players moved from starting position
      const player0 = state.players[0];
      const player1 = state.players[1];
      expect(player0.position !== 0 || player1.position !== 0).toBe(true);

      // Verify game log recorded actions
      expect(state.gameLog.length).toBeGreaterThan(10);
    });

    it("simulates full auction interaction between Agent 1 and Agent 2 during autonomous match", async () => {
      let state = createInitialGameState();
      state.currentTurnPlayerId = 0;
      state.turnPhase = "LANDED_ACTION";
      state.players[0].position = 1; // Mediterranean Avenue ($60)

      // Agent 0 declines buy -> triggers auction
      const declineValidation = validator.validateAndSanitizeAgentAction(
        state,
        0,
        {
          type: "DECLINE_BUY",
          payload: { propertyIndex: 1 },
        },
      );
      state = gameReducer(state, declineValidation.action);

      expect(state.turnPhase).toBe("AUCTION");
      expect(state.activeAuction).not.toBeNull();

      // AUCTION LOOP
      let auctionTurns = 0;
      while (
        state.turnPhase === "AUCTION" &&
        state.activeAuction &&
        auctionTurns < 10
      ) {
        auctionTurns++;
        const bidderId = getActiveDecisionMakerId(state);
        const auction = state.activeAuction;

        let bidAction: any;
        if (bidderId === 1 && auction.highestBid < 50) {
          bidAction = {
            type: "PLACE_AUCTION_BID",
            payload: { playerId: bidderId, amount: 50 },
          };
        } else {
          bidAction = {
            type: "PASS_AUCTION_BID",
            payload: { playerId: bidderId },
          };
        }

        const validResult = validator.validateAndSanitizeAgentAction(
          state,
          bidderId,
          bidAction,
        );
        expect(validResult.isValid).toBe(true);
        state = gameReducer(state, validResult.action);
      }

      // Auction should resolve and property awarded
      expect(state.turnPhase).not.toBe("AUCTION");
      expect(state.properties[1].ownerId).toBe(1);
      expect(state.players[1].money).toBe(1450); // 1500 - 50
    });
  });

  // =========================================================================
  // TEST 2: Deep State Context Serialization for Each Turn
  // =========================================================================
  describe("2. Deep State Context Serialization", () => {
    it("verifies deep state context is correctly serialized for each agent's perspective", () => {
      const state = createInitialGameState();
      state.turnNumber = 4;
      state.currentTurnPlayerId = 0;
      state.turnPhase = "ROLL";

      // Setup Player 0 state
      state.players[0].money = 1250;
      state.players[0].position = 6; // Oriental Avenue
      state.properties[6].ownerId = 0;
      state.properties[8].ownerId = 0;
      state.properties[9].ownerId = 0; // Light Blue monopoly!

      // Setup Player 1 state
      state.players[1].money = 1600;
      state.players[1].position = 14; // Virginia Avenue
      state.properties[14].ownerId = 1;

      // 1. Serialize for Agent 0 (Player 0)
      const context0 = serializer.serializeStateForAgent(state, 0);

      expect(context0.activePlayerId).toBe(0);
      expect(context0.isMyTurn).toBe(true);
      expect(context0.turnPhase).toBe("ROLL");
      expect(context0.turnNumber).toBe(4);

      // Verify myState
      expect(context0.myState.id).toBe(0);
      expect(context0.myState.name).toBe(state.players[0].name);
      expect(context0.myState.money).toBe(1250);
      expect(context0.myState.position).toBe(6);
      expect(context0.myState.positionName).toBe("Oriental Avenue");
      expect(context0.myState.ownedProperties).toEqual([6, 8, 9]);
      expect(context0.myState.monopolies).toContain("LIGHT_BLUE");
      expect(context0.myState.netWorth).toBeGreaterThan(1250);

      // Verify opponentState
      expect(context0.opponentState.id).toBe(1);
      expect(context0.opponentState.name).toBe(state.players[1].name);
      expect(context0.opponentState.money).toBe(1600);
      expect(context0.opponentState.position).toBe(14);
      expect(context0.opponentState.ownedProperties).toEqual([14]);

      // Verify boardContext
      expect(context0.boardContext.currentSquare.index).toBe(6);
      expect(context0.boardContext.currentSquare.name).toBe("Oriental Avenue");
      expect(context0.boardContext.currentSquare.ownerId).toBe(0);
      expect(context0.boardContext.unownedPropertiesRemaining).toBe(24); // 28 total properties - 4 owned
      expect(context0.boardContext.unownedStreetsRemaining).toBe(18); // 22 streets - 4 owned

      // Verify legalActions
      expect(context0.legalActions).toEqual([
        {
          type: "ROLL_DICE",
          description: "Roll the dice",
        },
      ]);

      // 2. Serialize for Agent 1 (Player 1 - not their turn)
      const context1 = serializer.serializeStateForAgent(state, 1);
      expect(context1.activePlayerId).toBe(0);
      expect(context1.isMyTurn).toBe(false);
      expect(context1.myState.id).toBe(1);
      expect(context1.opponentState.id).toBe(0);
      expect(context1.legalActions).toEqual([]); // Not their turn
    });

    it("verifies danger zone calculations accurately compute expected rent within 2-12 roll range", () => {
      const state = createInitialGameState();
      state.players[0].position = 14; // Virginia Avenue
      // Place opponent property with houses at position 21 (Kentucky Avenue, distance = 7)
      state.properties[21].ownerId = 1;
      state.properties[21].houses = 3; // Rent with 3 houses on Kentucky ($220) is $700

      const dangerZones = serializer.calculateDangerZones(state, 0);
      const kentuckyDanger = dangerZones.find((d) => d.squareIndex === 21);

      expect(kentuckyDanger).toBeDefined();
      if (kentuckyDanger) {
        expect(kentuckyDanger.distance).toBe(7);
        expect(kentuckyDanger.ownerId).toBe(1);
        expect(kentuckyDanger.rent).toBe(700);
        expect(kentuckyDanger.probability).toBeCloseTo(6 / 36, 3); // 0.1667
        expect(kentuckyDanger.expectedRent).toBeCloseTo((6 / 36) * 700, 1); // ~116.67
      }
    });

    it("verifies legal actions serialization in END_TURN phase includes building on monopolies", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;
      state.players[0].money = 1000;

      // Grant Dark Blue monopoly (Park Place 37, Boardwalk 39)
      state.properties[37].ownerId = 0;
      state.properties[39].ownerId = 0;

      const context = serializer.serializeStateForAgent(state, 0);
      const buildActions = context.legalActions.filter(
        (a) => a.type === "BUILD_HOUSE",
      );

      expect(buildActions.length).toBe(2);
      expect(buildActions.some((a) => a.payload?.propertyIndex === 37)).toBe(
        true,
      );
      expect(buildActions.some((a) => a.payload?.propertyIndex === 39)).toBe(
        true,
      );
      expect(context.legalActions.some((a) => a.type === "END_TURN")).toBe(
        true,
      );
    });
  });

  // =========================================================================
  // TEST 3: Telemetry History Recording
  // =========================================================================
  describe("3. Telemetry History Recording", () => {
    it("verifies agent thoughts, actions, and snapshots are properly recorded into telemetry history", async () => {
      const state = createInitialGameState();
      const dispatch = vi.fn();

      vi.spyOn(groqClient, "requestAgentDecision").mockResolvedValueOnce({
        thought:
          "Agent 1: Opening turn by rolling dice to claim board real estate.",
        action: { type: "ROLL_DICE" },
        rawResponse:
          '{"thought": "Opening turn", "action": {"type": "ROLL_DICE"}}',
      });

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      await act(async () => {
        await result.current.executeStep();
      });

      expect(result.current.telemetryLogs.length).toBe(1);
      const entry = result.current.telemetryLogs[0];

      expect(entry.id).toMatch(/^telem-\d+-[a-z0-9]+/);
      expect(typeof entry.timestamp).toBe("number");
      expect(entry.agentId).toBe(0);
      expect(entry.agentName).toBe(state.players[0].name);
      expect(entry.turnNumber).toBe(1);
      expect(entry.phase).toBe("ROLL");
      expect(entry.thought).toBe(
        "Agent 1: Opening turn by rolling dice to claim board real estate.",
      );
      expect(entry.action).toEqual({ type: "ROLL_DICE" });
      expect(entry.isValid).toBe(true);
      expect(entry.validationReason).toBeUndefined();
      expect(entry.stateSnapshot).toBeDefined();
      expect(entry.stateSnapshot.activePlayerId).toBe(0);
      expect(entry.rawResponse).toBe(
        '{"thought": "Opening turn", "action": {"type": "ROLL_DICE"}}',
      );
      expect(dispatch).toHaveBeenCalledWith({ type: "ROLL_DICE" });
    });

    it("verifies telemetry logs accumulate across turns in reverse-chronological order and can be cleared", async () => {
      let state = createInitialGameState();
      const dispatch = (action: GameAction) => {
        state = gameReducer(state, action);
      };

      const mockRequest = vi.spyOn(groqClient, "requestAgentDecision");

      const { result, rerender } = renderHook(
        ({ s }) => useAutonomousRunner(s, dispatch),
        { initialProps: { s: state } },
      );

      // Step 1: Roll
      mockRequest.mockResolvedValueOnce({
        thought: "Turn 1: Rolling dice.",
        action: { type: "ROLL_DICE" },
      });

      await act(async () => {
        await result.current.executeStep();
      });
      rerender({ s: state });

      // Step 2: Landed Action or End Turn depending on landed spot
      const currentPhase = state.turnPhase;
      const expectedAction =
        currentPhase === "LANDED_ACTION"
          ? {
              type: "DECLINE_BUY",
              payload: { propertyIndex: state.players[0].position },
            }
          : { type: "END_TURN" };

      mockRequest.mockResolvedValueOnce({
        thought: `Turn 1: Handling ${currentPhase}.`,
        action: expectedAction,
      });

      await act(async () => {
        await result.current.executeStep();
      });

      expect(result.current.telemetryLogs.length).toBe(2);
      expect(result.current.telemetryLogs[0].thought).toBe(
        `Turn 1: Handling ${currentPhase}.`,
      );
      expect(result.current.telemetryLogs[1].thought).toBe(
        "Turn 1: Rolling dice.",
      );

      // Test clearTelemetry
      act(() => {
        result.current.clearTelemetry();
      });
      expect(result.current.telemetryLogs.length).toBe(0);
    });
  });

  // =========================================================================
  // TEST 4: Invalid Action Rejection & Safe Engine Fallbacks
  // =========================================================================
  describe("4. Invalid Action Rejection & Safe Engine Fallbacks", () => {
    it("rejects illegal action for current phase and executes safe fallback without crashing", async () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      const dispatch = vi.fn();

      // Agent hallucinates BUY_PROPERTY during ROLL phase
      vi.spyOn(groqClient, "requestAgentDecision").mockResolvedValueOnce({
        thought:
          "Agent hallucination: Attempting to buy property before rolling.",
        action: { type: "BUY_PROPERTY", payload: { propertyIndex: 39 } },
      });

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      await act(async () => {
        await result.current.executeStep();
      });

      expect(dispatch).toHaveBeenCalledWith({ type: "ROLL_DICE" });
      expect(result.current.telemetryLogs.length).toBe(1);

      const log = result.current.telemetryLogs[0];
      expect(log.isValid).toBe(false);
      expect(log.validationReason).toContain(
        'Action "BUY_PROPERTY" is not allowed during ROLL phase',
      );
      expect(log.action).toEqual({ type: "ROLL_DICE" });
    });

    it("rejects unaffordable property purchase and falls back to DECLINE_BUY", () => {
      const state = createInitialGameState();
      state.turnPhase = "LANDED_ACTION";
      state.currentTurnPlayerId = 0;
      state.players[0].position = 39; // Boardwalk ($400)
      state.players[0].money = 150; // Insufficient funds

      const validation = validator.validateAndSanitizeAgentAction(state, 0, {
        type: "BUY_PROPERTY",
        payload: { propertyIndex: 39 },
      });

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain("insufficient funds");
      expect(validation.action).toEqual({
        type: "DECLINE_BUY",
        payload: { propertyIndex: 39 },
      });

      // Reducer safely executes fallback
      const nextState = gameReducer(state, validation.action);
      expect(nextState.turnPhase).toBe("AUCTION");
    });

    it("rejects illegal house construction without monopoly and falls back to END_TURN", () => {
      const state = createInitialGameState();
      state.turnPhase = "END_TURN";
      state.currentTurnPlayerId = 0;
      state.players[0].money = 1000;
      state.properties[1].ownerId = 0; // Mediterranean only (no Baltic)

      const validation = validator.validateAndSanitizeAgentAction(state, 0, {
        type: "BUILD_HOUSE",
        payload: { propertyIndex: 1 },
      });

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain("Cannot build house");
      expect(validation.action).toEqual({ type: "END_TURN" });

      // Reducer safely executes fallback to advance turn
      const nextState = gameReducer(state, validation.action);
      expect(nextState.turnPhase).toBe("ROLL");
      expect(nextState.currentTurnPlayerId).toBe(1);
    });

    it("handles API failure/exception gracefully with error telemetry and safe fallback", async () => {
      const state = createInitialGameState();
      state.turnPhase = "ROLL";
      state.currentTurnPlayerId = 0;
      const dispatch = vi.fn();

      vi.spyOn(groqClient, "requestAgentDecision").mockRejectedValueOnce(
        new Error("Groq API 503 Service Unavailable"),
      );

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      await act(async () => {
        await result.current.executeStep();
      });

      expect(dispatch).toHaveBeenCalledWith({ type: "ROLL_DICE" });
      expect(result.current.telemetryLogs.length).toBe(1);

      const log = result.current.telemetryLogs[0];
      expect(log.isValid).toBe(false);
      expect(log.error).toContain("Groq API 503 Service Unavailable");
      expect(log.thought).toContain("Error requesting agent decision");
    });
  });

  // =========================================================================
  // TEST 5: Bankruptcy & GAME_OVER Termination
  // =========================================================================
  describe("5. Bankruptcy & GAME_OVER Termination", () => {
    it("handles bankruptcy asset transfer and transitions game to GAME_OVER when one survivor remains", () => {
      let state = createInitialGameState();
      // Setup a 2-player match scenario where Player 0 goes bankrupt to Player 1
      // Set 2 players for head-to-head match
      state.players = [state.players[0], state.players[1]];
      state.turnPhase = "DEBT_RESOLUTION";
      state.currentTurnPlayerId = 0;
      state.players[0].money = -500;
      state.players[0].position = 39;
      state.properties[1].ownerId = 0; // Property owned by Player 0
      state.properties[3].ownerId = 0;

      state.debtInfo = {
        debtorId: 0,
        creditorId: 1,
        amountOwed: 1500,
      };

      // Validate bankruptcy action
      const validation = validator.validateAndSanitizeAgentAction(state, 0, {
        type: "DECLARE_BANKRUPTCY",
        payload: { playerId: 0 },
      });

      expect(validation.isValid).toBe(true);
      expect(validation.action).toEqual({
        type: "DECLARE_BANKRUPTCY",
        payload: { playerId: 0 },
      });

      // Apply bankruptcy via gameReducer
      state = gameReducer(state, validation.action);

      // Verify Player 0 is bankrupt and assets transferred to Player 1
      expect(state.players[0].isBankrupt).toBe(true);
      expect(state.players[0].bankruptedBy).toBe(1);
      expect(state.properties[1].ownerId).toBe(1);
      expect(state.properties[3].ownerId).toBe(1);

      // Verify GAME_OVER state and winner declaration
      expect(state.turnPhase).toBe("GAME_OVER");
      expect(state.gameWinnerId).toBe(1);
      expect(state.gameLog.some((log) => log.type === "bankruptcy")).toBe(true);
    });

    it("verifies autonomous runner stops executing and halts timers when GAME_OVER is reached", async () => {
      const state = createInitialGameState();
      state.turnPhase = "GAME_OVER";
      state.gameWinnerId = 1;

      const dispatch = vi.fn();
      const mockRequest = vi.spyOn(groqClient, "requestAgentDecision");

      const { result } = renderHook(() =>
        useAutonomousRunner(state, dispatch, { initialRunning: true }),
      );

      // Timer should be set to 0
      expect(result.current.secondsUntilNextTurn).toBe(0);

      // Execute step should immediately return without any API calls or dispatches
      await act(async () => {
        await result.current.executeStep();
      });

      expect(mockRequest).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      expect(result.current.telemetryLogs.length).toBe(0);
    });

    it("simulates full autonomous resolution from debt to bankruptcy to GAME_OVER", async () => {
      let state = createInitialGameState();
      state.players = [state.players[0], state.players[1]];
      state.turnPhase = "DEBT_RESOLUTION";
      state.currentTurnPlayerId = 0;
      state.players[0].money = -800;
      state.debtInfo = {
        debtorId: 0,
        creditorId: 1,
        amountOwed: 1000,
      };

      const dispatch = (action: GameAction) => {
        state = gameReducer(state, action);
      };

      vi.spyOn(groqClient, "requestAgentDecision").mockResolvedValueOnce({
        thought: "Agent 1: Debt is insurmountable. Declaring bankruptcy.",
        action: { type: "DECLARE_BANKRUPTCY", payload: { playerId: 0 } },
      });

      const { result, rerender } = renderHook(
        ({ s }) => useAutonomousRunner(s, dispatch),
        { initialProps: { s: state } },
      );

      await act(async () => {
        await result.current.executeStep();
      });

      rerender({ s: state });

      expect(state.turnPhase).toBe("GAME_OVER");
      expect(state.gameWinnerId).toBe(1);
      expect(result.current.telemetryLogs.length).toBe(1);
      expect(result.current.telemetryLogs[0].thought).toContain(
        "Debt is insurmountable",
      );

      // Subsequent step should not do anything
      const mockRequest = vi.spyOn(groqClient, "requestAgentDecision");
      await act(async () => {
        await result.current.executeStep();
      });

      expect(mockRequest).not.toHaveBeenCalled();
    });
  });
});
