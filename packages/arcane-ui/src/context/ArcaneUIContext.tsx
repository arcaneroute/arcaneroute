import React, { createContext, useReducer, useContext } from 'react';
import { arcaneUIReducer } from './ArcaneUIReducer';
import type { ArcaneUIState, ArcaneUIActions, ArcaneUIContextValue } from './ArcaneUIContextValue';
import type { BudgetSummary, MemoryStatus, SWDStatus, ChatMessage, DriftReport } from '../types';

const initialState: ArcaneUIState = {
  mode: 'idle',
  budget: {
    totalTokens: 0,
    maxTokens: 100000,
    estimatedCostUSD: 0,
    turns: 0,
    maxTurns: 50,
  },
  memory: {
    entryCount: 0,
    sizeKb: 0,
    status: 'normal',
  },
  swd: {
    status: 'idle',
  },
  messages: [],
  streamingText: '',
  isStreaming: false,
  driftReport: null,
  dreamProgress: null,
};

const ArcaneUIContext = createContext<ArcaneUIContextValue | null>(null);

interface ArcaneUIProviderProps {
  children: React.ReactNode;
}

export function ArcaneUIProvider({ children }: ArcaneUIProviderProps) {
  const [state, dispatch] = useReducer(arcaneUIReducer, initialState);

  const actions: ArcaneUIActions = {
    setMode: (mode) => dispatch({ type: 'SET_MODE', payload: mode }),
    updateBudget: (budget) => dispatch({ type: 'UPDATE_BUDGET', payload: budget }),
    updateMemory: (memory) => dispatch({ type: 'UPDATE_MEMORY', payload: memory }),
    updateSWD: (swd) => dispatch({ type: 'UPDATE_SWD', payload: swd }),
    addUserMessage: (text) => dispatch({ type: 'ADD_USER_MESSAGE', payload: text }),
    addAIMessage: (text, fileActions) =>
      dispatch({ type: 'ADD_AI_MESSAGE', payload: { text, fileActions } }),
    appendStreamingText: (chunk) => dispatch({ type: 'APPEND_STREAM', payload: chunk }),
    endStreaming: () => dispatch({ type: 'END_STREAM' }),
    clearChat: () => dispatch({ type: 'CLEAR_CHAT' }),
    setDriftReport: (report) => dispatch({ type: 'SET_DRIFT_REPORT', payload: report }),
    updateDreamProgress: (progress) => dispatch({ type: 'UPDATE_DREAM', payload: progress }),
  };

  return <ArcaneUIContext.Provider value={{ ...state, ...actions }}>{children}</ArcaneUIContext.Provider>;
}

export function useArcanUIContext(): ArcaneUIContextValue {
  const context = useContext(ArcaneUIContext);
  if (!context) {
    throw new Error('useArcanUIContext must be used within ArcaneUIProvider');
  }
  return context;
}
