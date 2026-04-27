import React from 'react';
import { Box } from 'ink';
import type { ChatPanelProps } from './ChatPanelProps';
import { ChatOutput } from '../ChatOutput/ChatOutput';
import { ChatInput } from '../ChatInput/ChatInput';

export function ChatPanel({
  messages,
  streamingText,
  isStreaming,
  onSendMessage,
  onCancelStreaming,
  commandHistory,
  disabled = false,
}: ChatPanelProps) {
  return (
    <Box flexDirection="column" flexGrow={1}>
      <ChatOutput messages={messages} streamingText={streamingText} isStreaming={isStreaming} />
      <ChatInput
        onSend={onSendMessage}
        onCancel={onCancelStreaming}
        commandHistory={commandHistory}
        disabled={disabled || isStreaming}
      />
    </Box>
  );
}
