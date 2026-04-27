import React from 'react';
import { Box, Text } from 'ink';
import type { ChatOutputProps } from './ChatOutputProps';
import { Message } from '../Message/Message';
import { StreamingIndicator } from '../StreamingIndicator/StreamingIndicator';

export function ChatOutput({ messages, streamingText, isStreaming }: ChatOutputProps) {
  const hasMessages = messages.length > 0;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="dimColor"
      padding={1}
      flexGrow={1}
      overflow="hidden"
    >
      {/* Output indicator */}
      <Box alignItems="center" gap={1} marginBottom={1}>
        <Text dimColor>[</Text>
        <Text bold color="white">CHAT OUTPUT</Text>
        <Text dimColor>|</Text>
        <Text dimColor>●</Text>
        <Text dimColor>]</Text>
      </Box>

      {!hasMessages && !isStreaming && (
        <Box flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1}>
          <Text bold color="magenta">✦</Text>
          <Text bold color="cyan">Welcome to Arcane Route</Text>
          <Text dimColor>Type your message below to start</Text>
          <Text dimColor>Use /help for available commands</Text>
        </Box>
      )}

      {hasMessages && (
        <Box flexDirection="column" overflow="hidden">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
        </Box>
      )}

      {isStreaming && (
        <Box flexDirection="column">
          <StreamingIndicator />
          <Text color="white">{streamingText}</Text>
        </Box>
      )}
    </Box>
  );
}
