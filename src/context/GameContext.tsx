import React, {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { GameState, AgentTelemetryEntry } from "../types/game";
import { createInitialGameState } from "../engine/gameEngine";
import { gameReducer, GameAction } from "../engine/gameReducer";
import { useBotRunner } from "../hooks/useBotRunner";
import { useAutonomousRunner } from "../hooks/useAutonomousRunner";

export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  inspectedPropertyIndex: number | null;
  setInspectedPropertyIndex: (index: number | null) => void;
  isTradeModalOpen: boolean;
  setIsTradeModalOpen: (open: boolean) => void;
  tradeRecipientId: number | null;
  setTradeRecipientId: (id: number | null) => void;
  selectedTab: "leaderboard" | "log" | "properties";
  setSelectedTab: (tab: "leaderboard" | "log" | "properties") => void;
  activeView: "landing" | "board" | "stats" | "settings";
  setActiveView: (view: "landing" | "board" | "stats" | "settings") => void;
  isDiceRolling: boolean;
  moneyDeltas: Record<number, number>;
  // Autonomous Agent Telemetry & Controls
  isAutonomousRunning: boolean;
  setIsAutonomousRunning: (running: boolean) => void;
  toggleAutonomous: () => void;
  secondsUntilNextTurn: number;
  telemetryLogs: AgentTelemetryEntry[];
  clearTelemetry: () => void;
  executeStep?: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialGameState,
  );
  const [inspectedPropertyIndex, setInspectedPropertyIndex] = useState<
    number | null
  >(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [tradeRecipientId, setTradeRecipientId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<
    "leaderboard" | "log" | "properties"
  >("leaderboard");
  const [activeView, setActiveView] = useState<
    "landing" | "board" | "stats" | "settings"
  >("landing");
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [moneyDeltas, setMoneyDeltas] = useState<Record<number, number>>({});

  // Track previous money values for delta calculation
  const prevMoneyRef = useRef<number[]>(state.players.map((p) => p.money));

  // Dice rolling animation trigger
  const wrappedDispatch: React.Dispatch<GameAction> = (action) => {
    if (typeof action === "object" && action.type === "ROLL_DICE") {
      setIsDiceRolling(true);
      setTimeout(() => setIsDiceRolling(false), 440);
    }
    dispatch(action);
  };

  // Detect money changes and set deltas
  useEffect(() => {
    const deltas: Record<number, number> = {};
    let hasChange = false;
    state.players.forEach((p, i) => {
      const prev = prevMoneyRef.current[i] ?? p.money;
      const diff = p.money - prev;
      if (diff !== 0) {
        deltas[p.id] = diff;
        hasChange = true;
      }
    });
    prevMoneyRef.current = state.players.map((p) => p.money);

    if (hasChange) {
      setMoneyDeltas(deltas);
      const timer = setTimeout(() => setMoneyDeltas({}), 800);
      return () => clearTimeout(timer);
    }
  }, [state.players]);

  // Autonomous Agent Runner Hook
  const {
    isAutonomousRunning,
    setIsAutonomousRunning,
    toggleAutonomous,
    secondsUntilNextTurn,
    telemetryLogs,
    clearTelemetry,
    executeStep,
  } = useAutonomousRunner(state, wrappedDispatch);

  // Automated bot runner hook for classic single-player mode (disabled when autonomous mode is running)
  useBotRunner(state, wrappedDispatch, { disabled: isAutonomousRunning });

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch: wrappedDispatch,
        inspectedPropertyIndex,
        setInspectedPropertyIndex,
        isTradeModalOpen,
        setIsTradeModalOpen,
        tradeRecipientId,
        setTradeRecipientId,
        selectedTab,
        setSelectedTab,
        activeView,
        setActiveView,
        isDiceRolling,
        moneyDeltas,
        isAutonomousRunning,
        setIsAutonomousRunning,
        toggleAutonomous,
        secondsUntilNextTurn,
        telemetryLogs,
        clearTelemetry,
        executeStep,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
