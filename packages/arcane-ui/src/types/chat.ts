import type { FileAction } from './events';

export type MessageRole = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  fileActions?: FileAction[];
}

export interface StreamingState {
  active: boolean;
  text: string;
}

export interface CommandHistory {
  commands: string[];
  currentIndex: number;
}
