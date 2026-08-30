import React, { createContext, useContext, useReducer, useState, ReactNode } from 'react';
import { GameState } from '../types/game';
import { createInitialGameState } from '../engine/gameEngine';
import { gameReducer, GameAction } from '../engine/gameReducer';
import { useBotRunner } from '../hooks/useBotRunner';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  inspectedPropertyIndex: number | null;
  setInspectedPropertyIndex: (index: number | null) => void;
  isTradeModalOpen: boolean;
  setIsTradeModalOpen: (open: boolean) => void;
  tradeRecipientId: number | null;
  setTradeRecipientId: (id: number | null) => void;
  selectedTab: 'leaderboard' | 'log' | 'properties';
  setSelectedTab: (tab: 'leaderboard' | 'log' | 'properties') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const [inspectedPropertyIndex, setInspectedPropertyIndex] = useState<number | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [tradeRecipientId, setTradeRecipientId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'log' | 'properties'>('leaderboard');

  // Automated bot runner hook
  useBotRunner(state, dispatch);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        inspectedPropertyIndex,
        setInspectedPropertyIndex,
        isTradeModalOpen,
        setIsTradeModalOpen,
        tradeRecipientId,
        setTradeRecipientId,
        selectedTab,
        setSelectedTab,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
