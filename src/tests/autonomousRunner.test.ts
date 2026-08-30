import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useAutonomousRunner,
  getActiveDecisionMakerId,
} from "../hooks/useAutonomousRunner";
import { createInitialGameState } from "../engine/gameEngine";
import * as groqClient from "../ai/groqClient";
import * as validator from "../ai/agentActionValidator";
import * as serializer from "../ai/agentStateSerializer";

describe("Autonomous Runner Hook & Decision Maker Resolution", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getActiveDecisionMakerId", () => {
    it("returns currentTurnPlayerId in normal turn phases (ROLL, LANDED_ACTION, END_TURN)", () => {
      const state = createInitialGameState();
      state.currentTurnPlayerId = 0;
      state.turnPhase = "ROLL";
      expect(getActiveDecisionMakerId(state)).toBe(0);

      state.currentTurnPlayerId = 1;
      state.turnPhase = "LANDED_ACTION";
      expect(getActiveDecisionMakerId(state)).toBe(1);

      state.turnPhase = "END_TURN";
      expect(getActiveDecisionMakerId(state)).toBe(1);
    });

    it("returns activeAuction.currentBidderId during AUCTION phase", () => {
      const state = createInitialGameState();
      state.currentTurnPlayerId = 0;
      state.turnPhase = "AUCTION";
      state.activeAuction = {
        propertyIndex: 3,
        highestBid: 60,
        highestBidderId: 0,
        currentBidderId: 1,
        activeParticipants: [0, 1],
        minIncrement: 10,
      };

      expect(getActiveDecisionMakerId(state)).toBe(1);
    });

    it("returns activeTrade.recipientId during TRADE phase", () => {
      const state = createInitialGameState();
      state.currentTurnPlayerId = 0;
      state.turnPhase = "TRADE";
      state.activeTrade = {
        id: "trade-1",
        initiatorId: 0,
        recipientId: 1,
        offeredMoney: 100,
        requestedMoney: 0,
        offeredProperties: [1],
        requestedProperties: [3],
        offeredJailCards: { chance: false, communityChest: false },
        requestedJailCards: { chance: false, communityChest: false },
      };

      expect(getActiveDecisionMakerId(state)).toBe(1);
    });

    it("returns debtInfo.debtorId during DEBT_RESOLUTION phase", () => {
      const state = createInitialGameState();
      state.currentTurnPlayerId = 0;
      state.turnPhase = "DEBT_RESOLUTION";
      state.debtInfo = {
        debtorId: 1,
        creditorId: 0,
        amountOwed: 200,
      };

      expect(getActiveDecisionMakerId(state)).toBe(1);
    });
  });

  describe("useAutonomousRunner hook controls and state", () => {
    it("initializes with default values", () => {
      const state = createInitialGameState();
      const dispatch = vi.fn();

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      expect(result.current.isAutonomousRunning).toBe(false);
      expect(result.current.secondsUntilNextTurn).toBe(5);
      expect(result.current.telemetryLogs).toEqual([]);
    });

    it("toggles autonomous running state and resets timer", () => {
      const state = createInitialGameState();
      const dispatch = vi.fn();

      const { result } = renderHook(() =>
        useAutonomousRunner(state, dispatch, { turnDurationSeconds: 5 }),
      );

      act(() => {
        result.current.toggleAutonomous();
      });
      expect(result.current.isAutonomousRunning).toBe(true);
      expect(result.current.secondsUntilNextTurn).toBe(5);

      act(() => {
        result.current.toggleAutonomous();
      });
      expect(result.current.isAutonomousRunning).toBe(false);
    });

    it("allows direct control via setIsAutonomousRunning", () => {
      const state = createInitialGameState();
      const dispatch = vi.fn();

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      act(() => {
        result.current.setIsAutonomousRunning(true);
      });
      expect(result.current.isAutonomousRunning).toBe(true);

      act(() => {
        result.current.setIsAutonomousRunning(false);
      });
      expect(result.current.isAutonomousRunning).toBe(false);
    });

    it("clears telemetry logs with clearTelemetry", async () => {
      const state = createInitialGameState();
      const dispatch = vi.fn();

      vi.spyOn(groqClient, "requestAgentDecision").mockResolvedValue({
        thought: "I will roll the dice.",
        action: { type: "ROLL_DICE" },
      });

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      await act(async () => {
        await result.current.executeStep();
      });

      expect(result.current.telemetryLogs.length).toBe(1);

      act(() => {
        result.current.clearTelemetry();
      });

      expect(result.current.telemetryLogs.length).toBe(0);
    });
  });

  describe("executeStep autonomous decision execution", () => {
    it("serializes state, requests decision, validates action, dispatches, and logs telemetry", async () => {
      const state = createInitialGameState();
      const dispatch = vi.fn();

      const mockSerializer = vi.spyOn(serializer, "serializeStateForAgent");
      const mockRequest = vi
        .spyOn(groqClient, "requestAgentDecision")
        .mockResolvedValue({
          thought: "Rolling dice to advance on board.",
          action: { type: "ROLL_DICE" },
          rawResponse:
            '{"thought": "Rolling dice", "action": {"type": "ROLL_DICE"}}',
        });

      const mockValidator = vi.spyOn(
        validator,
        "validateAndSanitizeAgentAction",
      );

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      await act(async () => {
        await result.current.executeStep();
      });

      expect(mockSerializer).toHaveBeenCalledWith(state, 0);
      expect(mockRequest).toHaveBeenCalledWith(
        0,
        expect.objectContaining({ activePlayerId: 0 }),
      );
      expect(mockValidator).toHaveBeenCalledWith(state, 0, {
        type: "ROLL_DICE",
      });
      expect(dispatch).toHaveBeenCalledWith({ type: "ROLL_DICE" });

      expect(result.current.telemetryLogs.length).toBe(1);
      const log = result.current.telemetryLogs[0];
      expect(log.agentId).toBe(0);
      expect(log.agentName).toBe(state.players[0].name);
      expect(log.thought).toBe("Rolling dice to advance on board.");
      expect(log.action).toEqual({ type: "ROLL_DICE" });
      expect(log.isValid).toBe(true);
      expect(log.turnNumber).toBe(1);
      expect(log.phase).toBe("ROLL");
      expect(log.stateSnapshot).toBeDefined();
    });

    it("handles API rejection gracefully by executing fallback and recording error in telemetry", async () => {
      const state = createInitialGameState();
      const dispatch = vi.fn();

      vi.spyOn(groqClient, "requestAgentDecision").mockRejectedValue(
        new Error("Groq API 429 Rate Limit Exceeded"),
      );

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      await act(async () => {
        await result.current.executeStep();
      });

      // Should dispatch safe fallback ROLL_DICE without crashing
      expect(dispatch).toHaveBeenCalledWith({ type: "ROLL_DICE" });
      expect(result.current.telemetryLogs.length).toBe(1);

      const log = result.current.telemetryLogs[0];
      expect(log.error).toContain("Groq API 429 Rate Limit Exceeded");
      expect(log.isValid).toBe(false);
      expect(log.thought).toContain("Error requesting agent decision");
    });

    it("does not execute when game is in GAME_OVER phase", async () => {
      const state = createInitialGameState();
      state.turnPhase = "GAME_OVER";
      state.gameWinnerId = 0;

      const dispatch = vi.fn();
      const mockRequest = vi.spyOn(groqClient, "requestAgentDecision");

      const { result } = renderHook(() => useAutonomousRunner(state, dispatch));

      await act(async () => {
        await result.current.executeStep();
      });

      expect(mockRequest).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      expect(result.current.telemetryLogs.length).toBe(0);
    });
  });

  describe("Timer countdown integration", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("decrements countdown timer every 1000ms when running and triggers turn at 0", async () => {
      const state = createInitialGameState();
      const dispatch = vi.fn();

      vi.spyOn(groqClient, "requestAgentDecision").mockResolvedValue({
        thought: "Auto roll",
        action: { type: "ROLL_DICE" },
      });

      const { result } = renderHook(() =>
        useAutonomousRunner(state, dispatch, {
          initialRunning: true,
          turnDurationSeconds: 3,
        }),
      );

      expect(result.current.secondsUntilNextTurn).toBe(3);

      // Tick 1s
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.secondsUntilNextTurn).toBe(2);

      // Tick 1s
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.secondsUntilNextTurn).toBe(1);

      // Tick 1s -> triggers executeStep
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(dispatch).toHaveBeenCalledWith({ type: "ROLL_DICE" });
      expect(result.current.secondsUntilNextTurn).toBe(3);
    });

    it("sets secondsUntilNextTurn to 0 when game enters GAME_OVER", () => {
      const state = createInitialGameState();
      state.turnPhase = "GAME_OVER";
      state.gameWinnerId = 1;
      const dispatch = vi.fn();

      const { result } = renderHook(() =>
        useAutonomousRunner(state, dispatch, { initialRunning: true }),
      );

      expect(result.current.secondsUntilNextTurn).toBe(0);
    });
  });
});
