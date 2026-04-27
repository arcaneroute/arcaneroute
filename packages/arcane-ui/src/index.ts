// Arcane-UI - TUI Components for Arcane Route
export { VERSION } from './version';

// Components
export { ArcaneApp } from './components/ArcaneApp';
export type { ArcaneAppProps, ArcaneAppMode } from './components/ArcaneAppProps';

export { Banner } from './components/Banner';
export type { BannerProps } from './components/BannerProps';

export { ProgressBar } from './components/ProgressBar/ProgressBar';
export type { ProgressBarProps } from './components/ProgressBar/ProgressBarProps';

export { BudgetPanel } from './components/BudgetPanel/BudgetPanel';
export type { BudgetPanelProps } from './components/BudgetPanel/BudgetPanelProps';

export { MemoryStatus } from './components/MemoryStatus/MemoryStatus';
export type { MemoryStatusProps } from './components/MemoryStatus/MemoryStatusProps';

export { SWDStatus } from './components/SWDStatus/SWDStatus';
export type { SWDStatusProps } from './components/SWDStatus/SWDStatusProps';

export { StatusBar } from './components/StatusBar/StatusBar';

export { Layout } from './components/Layout/Layout';

export { Sidebar } from './components/Sidebar/Sidebar';
export type { SidebarProps } from './components/Sidebar/Sidebar';

export { ChatPanel } from './components/ChatPanel/ChatPanel';
export type { ChatPanelProps } from './components/ChatPanel/ChatPanelProps';

export { ChatOutput } from './components/ChatOutput/ChatOutput';
export type { ChatOutputProps } from './components/ChatOutput/ChatOutputProps';

export { ChatInput } from './components/ChatInput/ChatInput';
export type { ChatInputProps } from './components/ChatInput/ChatInputProps';

export { Message } from './components/Message/Message';
export type { MessageProps } from './components/Message/MessageProps';

export { FileActionBlock } from './components/FileActionBlock/FileActionBlock';
export type { FileActionBlockProps } from './components/FileActionBlock/FileActionBlockProps';

export { StreamingIndicator } from './components/StreamingIndicator/StreamingIndicator';

export { DriftReport } from './components/DriftReport/DriftReport';
export type { DriftReportProps } from './components/DriftReport/DriftReportProps';

export { DreamProgress } from './components/DreamProgress/DreamProgress';
export type { DreamProgressProps, DreamProgressState } from './components/DreamProgress/DreamProgressProps';

// Context
export { ArcaneUIProvider, useArcanUIContext } from './context';
export type { ArcaneUIState, ArcaneUIActions, TUIMode } from './context';

// Types - explicit re-exports to avoid conflict with components
export type { BudgetSummary, BudgetColor, getBudgetColor } from './types/budget';
export type { ChatMessage, MessageRole, StreamingState, CommandHistory } from './types/chat';
export type { DriftReport as DriftReportType, DriftEntry, DriftEntryType } from './types/drift';
export type { MemoryStatus as MemoryStatusType } from './types/memory';
export type { SWDStatus as SWDStatusType } from './types/swd';
export type {
  ArcaneUIEvents,
  FileAction,
  BudgetUpdateEvent,
  MemoryUpdateEvent,
  SWDPreSnapshotEvent,
  SWDVerifyingEvent,
  SWDResultEvent,
  ChatUserMessageEvent,
  ChatAIMessageEvent,
  StreamStartEvent,
  StreamChunkEvent,
  StreamEndEvent,
  DriftReportEvent,
  DreamPhaseEvent,
} from './types/events';
