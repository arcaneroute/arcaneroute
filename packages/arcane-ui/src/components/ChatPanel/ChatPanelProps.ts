import type { ChatMessage } from '../../types';

export interface ChatPanelProps {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onCancelStreaming: () => void;
  commandHistory: string[];
  disabled?: boolean;
}
