import type { AppStatus, TUIMode, BudgetSummary, MemoryStatus, SWDStatus, ChatMessage, DriftReport } from "../types";

export interface AppEventMap {
  // User actions
  "user:send": { text: string };
  "user:cancel": void;
  "user:clear": void;
  "user:history-up": void;
  "user:history-down": void;

  // App state changes (from core to UI)
  "app:status": { status: AppStatus };
  "app:mode": { mode: TUIMode };
  "app:budget": { budget: BudgetSummary };
  "app:memory": { memory: MemoryStatus };
  "app:swd": { swd: SWDStatus };
  "app:message": { message: ChatMessage };
  "app:stream": { chunk: string };
  "app:stream-end": void;
  "app:drift": { report: DriftReport };
  "app:dream": { progress: DreamProgressState };

  // Keyboard events (forwarded from renderer)
  keypress: { name: string; sequence: string; ctrl: boolean; shift: boolean; meta: boolean };
}

export interface DreamProgressState {
  phase: "analyzing" | "compressing" | "writing" | "complete";
  progress?: number;
  entryCountBefore?: number;
  entryCountAfter?: number;
  reductionPercent?: number;
}
