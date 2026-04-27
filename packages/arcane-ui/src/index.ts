// Arcane-UI - TUI Components for Arcane Route (OpenTUI)

export { ArcaneApp } from "./components/ArcaneApp";
export { createArcaneRenderer } from "./renderer/createRenderer";
export { AppEventsProvider, useAppEvents } from "./events/useAppEvents";

export type { ArcaneRenderer } from "./renderer/createRenderer";
export type { AppState } from "./events/useAppEvents";
export type { AppEventsProviderProps } from "./events/useAppEvents";

export type {
  AppStatus,
  TUIMode,
  BudgetSummary,
  MemoryStatus,
  SWDStatus,
  ChatMessage,
  FileAction,
  DriftReport,
  DreamProgressState,
} from "./types";
