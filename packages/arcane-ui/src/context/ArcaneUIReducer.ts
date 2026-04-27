import type { ArcaneUIState, AppStatus, DreamProgressState } from './ArcaneUIContextValue';
import type { ChatMessage, BudgetSummary, MemoryStatus, SWDStatus, DriftReport } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type ArcaneUIAction =
  | { type: 'SET_MODE'; payload: ArcaneUIState['mode'] }
  | { type: 'SET_APP_STATUS'; payload: AppStatus }
  | { type: 'UPDATE_BUDGET'; payload: BudgetSummary }
  | { type: 'UPDATE_MEMORY'; payload: MemoryStatus }
  | { type: 'UPDATE_SWD'; payload: SWDStatus }
  | { type: 'ADD_USER_MESSAGE'; payload: string }
  | { type: 'ADD_AI_MESSAGE'; payload: { text: string; fileActions?: ChatMessage['fileActions'] } }
  | { type: 'APPEND_STREAM'; payload: string }
  | { type: 'END_STREAM' }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_DRIFT_REPORT'; payload: DriftReport | null }
  | { type: 'UPDATE_DREAM'; payload: DreamProgressState };

export function arcaneUIReducer(state: ArcaneUIState, action: ArcaneUIAction): ArcaneUIState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };

    case 'SET_APP_STATUS':
      return { ...state, appStatus: action.payload };

    case 'UPDATE_BUDGET':
      return { ...state, budget: action.payload };

    case 'UPDATE_MEMORY':
      return { ...state, memory: action.payload };

    case 'UPDATE_SWD':
      return { ...state, swd: action.payload };

    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            role: 'user' as const,
            text: action.payload,
            timestamp: Date.now(),
          },
        ],
      };

    case 'ADD_AI_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            role: 'ai' as const,
            text: action.payload.text,
            timestamp: Date.now(),
            fileActions: action.payload.fileActions,
          },
        ],
      };

    case 'APPEND_STREAM':
      return {
        ...state,
        isStreaming: true,
        streamingText: state.streamingText + action.payload,
      };

    case 'END_STREAM': {
      const lastMessage = state.messages[state.messages.length - 1];
      const updatedMessages =
        lastMessage?.role === 'ai'
          ? state.messages.map((msg, i) =>
              i === state.messages.length - 1
                ? { ...msg, text: msg.text + state.streamingText }
                : msg
            )
          : [
              ...state.messages,
              {
                id: generateId(),
                role: 'ai' as const,
                text: state.streamingText,
                timestamp: Date.now(),
              },
            ];
      return {
        ...state,
        isStreaming: false,
        streamingText: '',
        messages: updatedMessages,
      };
    }

    case 'CLEAR_CHAT':
      return { ...state, messages: [], streamingText: '', isStreaming: false };

    case 'SET_DRIFT_REPORT':
      return { ...state, driftReport: action.payload };

    case 'UPDATE_DREAM':
      return { ...state, dreamProgress: action.payload };

    default:
      return state;
  }
}
