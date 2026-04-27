import type { ChatMessage } from '../../types';

export interface ChatOutputProps {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
}
