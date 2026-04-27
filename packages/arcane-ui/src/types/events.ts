// Event types emitted by arcane-route services

export interface BudgetUpdateEvent {
  totalTokens: number;
  maxTokens: number;
  estimatedCostUSD: number;
  turns: number;
  maxTurns: number;
}

export interface MemoryUpdateEvent {
  entryCount: number;
  sizeKb: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface SWDPreSnapshotEvent {
  fileCount: number;
}

export interface SWDVerifyingEvent {
  // No payload
}

export interface SWDResultEvent {
  verified: FileAction[];
  failed: FileAction[];
  unmatched: FileAction[];
}

export interface ChatUserMessageEvent {
  text: string;
  timestamp: number;
}

export interface ChatAIMessageEvent {
  text: string;
  timestamp: number;
}

export interface StreamStartEvent {
  // No payload
}

export interface StreamChunkEvent {
  text: string;
}

export interface StreamEndEvent {
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface DriftReportEvent {
  verified: string[];
  drifted: string[];
  missing: string[];
  untracked: string[];
}

export interface DreamPhaseEvent {
  phase: 'analyzing' | 'compressing' | 'writing' | 'complete';
  progress?: number;
  entryCountBefore?: number;
  entryCountAfter?: number;
  reductionPercent?: number;
}

export type FileAction = {
  type: 'CREATE' | 'MODIFY' | 'DELETE';
  path: string;
};

export type ArcaneUIEvents =
  | { type: 'budget:update'; payload: BudgetUpdateEvent }
  | { type: 'memory:update'; payload: MemoryUpdateEvent }
  | { type: 'swd:pre-snapshot'; payload: SWDPreSnapshotEvent }
  | { type: 'swd:verifying'; payload: null }
  | { type: 'swd:result'; payload: SWDResultEvent }
  | { type: 'chat:user-message'; payload: ChatUserMessageEvent }
  | { type: 'chat:ai-message'; payload: ChatAIMessageEvent }
  | { type: 'stream:start'; payload: null }
  | { type: 'stream:chunk'; payload: StreamChunkEvent }
  | { type: 'stream:end'; payload: StreamEndEvent }
  | { type: 'drift:report'; payload: DriftReportEvent }
  | { type: 'dream:phase'; payload: DreamPhaseEvent };
