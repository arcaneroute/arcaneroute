import { ChatOutput } from "../ChatOutput/ChatOutput";
import { ChatInput } from "../ChatInput/ChatInput";

interface ChatPanelProps {
  onSend?: (text: string) => void;
  onCancel?: () => void;
  commandHistory?: string[];
}

export function ChatPanel({ onSend, onCancel, commandHistory = [] }: ChatPanelProps) {
  return (
    <box flexDirection="column" flexGrow={1}>
      <ChatOutput />
      <ChatInput commandHistory={commandHistory} />
    </box>
  );
}