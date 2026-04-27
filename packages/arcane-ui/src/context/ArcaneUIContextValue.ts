import type {
  BudgetSummary,
  MemoryStatus,
  SWDStatus,
  ChatMessage,
  DriftReport,
} from '../types';

export type TUIMode = 'chat' | 'verify' | 'dream' | 'idle';

export interface DreamProgressState {
  phase: 'analyzing' | 'compressing' | 'writing' | 'complete';
  progress?: number;
  entryCountBefore?: number;
  entryCountAfter?: number;
  reductionPercent?: number;
}

export interface ArcaneUIState {
  mode: TUIMode;
  budget: BudgetSummary;
  memory: MemoryStatus;
  swd: SWDStatus;
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
  driftReport: DriftReport | null;
  dreamProgress: DreamProgressState | null;
}

export interface ArcaneUIActions {
  setMode: (mode: TUIMode) => void;
  updateBudget: (budget: BudgetSummary) => void;
  updateMemory: (memory: MemoryStatus) => void;
  updateSWD: (swd: SWDStatus) => void;
  addUserMessage: (text: string) => void;
  addAIMessage: (text: string, fileActions?: ChatMessage['fileActions']) => void;
  appendStreamingText: (chunk: string) => void;
  endStreaming: () => void;
  clearChat: () => void;
  setDriftReport: (report: DriftReport | null) => void;
  updateDreamProgress: (progress: DreamProgressState) => void;
}

export type ArcaneUIContextValue = ArcaneUIState & ArcaneUIActions;
