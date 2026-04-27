import React from 'react';
import { Box, Text } from 'ink';
import type { ChatOutputProps } from './ChatOutputProps';
import { Message } from '../Message/Message';
import { StreamingIndicator } from '../StreamingIndicator/StreamingIndicator';

export function ChatOutput({ messages, streamingText, isStreaming }: ChatOutputProps) {
  return (
    <Box flexDirection="column" borderStyle="round" padding={1} flexGrow={1}>
      <Box flexDirection="column" overflow="hidden">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <Box flexDirection="column">
            <StreamingIndicator />
            <Text dimColor>{streamingText}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
