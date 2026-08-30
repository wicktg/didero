import { useState, useEffect, useRef, useCallback } from "react";
import { GameState, AgentTelemetryEntry } from "../types/game";
import { GameAction } from "../engine/gameReducer";
import { serializeStateForAgent } from "../ai/agentStateSerializer";
import { requestAgentDecision, AgentDecisionResponse } from "../ai/groqClient";
import { validateAndSanitizeAgentAction } from "../ai/agentActionValidator";

export interface AutonomousRunnerOptions {
  turnDurationSeconds?: number;
  initialRunning?: boolean;
}

export interface UseAutonomousRunnerReturn {
  isAutonomousRunning: boolean;
  setIsAutonomousRunning: (running: boolean) => void;
  toggleAutonomous: () => void;
  secondsUntilNextTurn: number;
  telemetryLogs: AgentTelemetryEntry[];
  clearTelemetry: () => void;
  executeStep: () => Promise<void>;
}

/**
 * Determines the active decision-maker's player ID based on current turn phase and state.
 */
export function getActiveDecisionMakerId(state: GameState): number {
  if (state.turnPhase === "AUCTION" && state.activeAuction) {
    return state.activeAuction.currentBidderId;
  }
  if (state.turnPhase === "TRADE" && state.activeTrade) {
    return state.activeTrade.recipientId;
  }
  if (state.turnPhase === "DEBT_RESOLUTION" && state.debtInfo) {
    return state.debtInfo.debtorId;
  }
  return state.currentTurnPlayerId;
}

export function useAutonomousRunner(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
  options?: AutonomousRunnerOptions,
): UseAutonomousRunnerReturn {
  const turnDuration = options?.turnDurationSeconds ?? 5;
  const [isAutonomousRunning, setIsAutonomousRunning] = useState<boolean>(
    options?.initialRunning ?? false,
  );
  const [secondsUntilNextTurn, setSecondsUntilNextTurn] =
    useState<number>(turnDuration);
  const [telemetryLogs, setTelemetryLogs] = useState<AgentTelemetryEntry[]>([]);

  const isExecutingRef = useRef<boolean>(false);
  const stateRef = useRef<GameState>(state);
  const dispatchRef = useRef<React.Dispatch<GameAction>>(dispatch);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const toggleAutonomous = useCallback(() => {
    setIsAutonomousRunning((prev) => {
      const next = !prev;
      if (next) {
        setSecondsUntilNextTurn(turnDuration);
      }
      return next;
    });
  }, [turnDuration]);

  const clearTelemetry = useCallback(() => {
    setTelemetryLogs([]);
  }, []);

  const executeStep = useCallback(async () => {
    if (isExecutingRef.current) return;
    const currentState = stateRef.current;
    if (
      currentState.turnPhase === "GAME_OVER" ||
      currentState.gameWinnerId !== null
    ) {
      return;
    }

    isExecutingRef.current = true;

    const activePlayerId = getActiveDecisionMakerId(currentState);
    const activePlayer = currentState.players[activePlayerId];
    const agentName = activePlayer
      ? activePlayer.name
      : `Agent ${activePlayerId + 1}`;

    const stateContext = serializeStateForAgent(currentState, activePlayerId);

    let decisionResponse: AgentDecisionResponse;
    try {
      decisionResponse = await requestAgentDecision(
        activePlayerId,
        stateContext,
      );
    } catch (err: any) {
      decisionResponse = {
        thought: `Error requesting agent decision: ${err?.message || String(err)}`,
        action: { type: "FALLBACK" },
        error: err?.message || String(err),
      };
    }

    const validation = validateAndSanitizeAgentAction(
      currentState,
      activePlayerId,
      decisionResponse.action,
    );

    const telemetryEntry: AgentTelemetryEntry = {
      id: `telem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      agentId: activePlayerId,
      agentName,
      turnNumber: currentState.turnNumber,
      phase: currentState.turnPhase,
      thought:
        decisionResponse.thought ||
        (decisionResponse.error
          ? `Decision error: ${decisionResponse.error}`
          : "Executing tactical action"),
      action: validation.action,
      isValid: validation.isValid,
      validationReason: validation.reason,
      stateSnapshot: stateContext,
      rawResponse: decisionResponse.rawResponse,
      error: decisionResponse.error,
    };

    setTelemetryLogs((prev) => [telemetryEntry, ...prev]);

    dispatchRef.current(validation.action);

    setSecondsUntilNextTurn(turnDuration);
    isExecutingRef.current = false;
  }, [turnDuration]);

  // Main 1-second countdown interval
  useEffect(() => {
    if (!isAutonomousRunning) {
      return;
    }

    if (state.turnPhase === "GAME_OVER" || state.gameWinnerId !== null) {
      setSecondsUntilNextTurn(0);
      return;
    }

    const interval = setInterval(() => {
      if (isExecutingRef.current) {
        return;
      }

      setSecondsUntilNextTurn((prev) => {
        if (prev <= 1) {
          executeStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutonomousRunning, state.turnPhase, state.gameWinnerId, executeStep]);

  return {
    isAutonomousRunning,
    setIsAutonomousRunning,
    toggleAutonomous,
    secondsUntilNextTurn,
    telemetryLogs,
    clearTelemetry,
    executeStep,
  };
}
