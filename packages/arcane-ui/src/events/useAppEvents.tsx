import { createSignal, createContext, useContext, onCleanup, type Accessor, type JSX } from "solid-js";
import { EventEmitter } from "events";
import type { AppStatus, TUIMode, BudgetSummary, MemoryStatus, SWDStatus, ChatMessage, DriftReport } from "../types";

export interface AppState {
  appStatus: AppStatus;
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

export interface DreamProgressState {
  phase: "analyzing" | "compressing" | "writing" | "complete";
  progress?: number;
  entryCountBefore?: number;
  entryCountAfter?: number;
  reductionPercent?: number;
}

interface AppEventsContextValue {
  state: Accessor<AppState>;
  emit: (event: string, payload?: any) => void;
  on: (event: string, handler: (payload: any) => void) => () => void;
}

const AppEventsContext = createContext<AppEventsContextValue | null>(null);

export interface AppEventsProviderProps {
  events: EventEmitter;
  children: JSX.Element;
}

export function AppEventsProvider(props: AppEventsProviderProps) {
  const [state, setState] = createSignal<AppState>({
    appStatus: "idle",
    mode: "chat",
    budget: { totalTokens: 0, maxTokens: 100000, estimatedCostUSD: 0, turns: 0, maxTurns: 50 },
    memory: { entryCount: 0, sizeKb: 0, status: "normal" },
    swd: { status: "idle" },
    messages: [],
    streamingText: "",
    isStreaming: false,
    driftReport: null,
    dreamProgress: null,
  });

  const emit = (event: string, payload?: any) => {
    props.events.emit(event, payload);
  };

  const on = (event: string, handler: (payload: any) => void) => {
    const wrappedHandler = (payload: any) => handler(payload);
    props.events.on(event, wrappedHandler);
    return () => props.events.off(event, wrappedHandler);
  };

  onCleanup(() => {
    const unsubStatus = on("app:status", ({ status }: { status: AppStatus }) => setState(s => ({ ...s, appStatus: status })));
    const unsubMode = on("app:mode", ({ mode }: { mode: TUIMode }) => setState(s => ({ ...s, mode })));
    const unsubBudget = on("app:budget", ({ budget }: { budget: BudgetSummary }) => setState(s => ({ ...s, budget })));
    const unsubMemory = on("app:memory", ({ memory }: { memory: MemoryStatus }) => setState(s => ({ ...s, memory })));
    const unsubSWD = on("app:swd", ({ swd }: { swd: SWDStatus }) => setState(s => ({ ...s, swd })));
    const unsubMessage = on("app:message", ({ message }: { message: ChatMessage }) => setState(s => ({
      ...s,
      messages: [...s.messages, message],
      isStreaming: false,
      streamingText: ""
    })));
    const unsubStream = on("app:stream", ({ chunk }: { chunk: string }) => setState(s => ({
      ...s,
      isStreaming: true,
      streamingText: s.streamingText + chunk
    })));
    const unsubStreamEnd = on("app:stream-end", () => setState(s => ({ ...s, isStreaming: false, streamingText: "" })));
    const unsubDrift = on("app:drift", ({ report }: { report: DriftReport }) => setState(s => ({ ...s, driftReport: report })));
    const unsubDream = on("app:dream", ({ progress }: { progress: DreamProgressState }) => setState(s => ({ ...s, dreamProgress: progress })));

    unsubStatus();
    unsubMode();
    unsubBudget();
    unsubMemory();
    unsubSWD();
    unsubMessage();
    unsubStream();
    unsubStreamEnd();
    unsubDrift();
    unsubDream();
  });

  return (
    <AppEventsContext.Provider value={{ state, emit, on }}>
      {props.children}
    </AppEventsContext.Provider>
  );
}

export function useAppEvents(): AppEventsContextValue {
  const context = useContext(AppEventsContext);
  if (!context) {
    throw new Error("useAppEvents must be used within AppEventsProvider");
  }
  return context;
}