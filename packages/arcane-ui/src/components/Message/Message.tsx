import React from 'react';
import { Box, Text } from 'ink';
import type { MessageProps } from './MessageProps';
import { FileActionBlock } from '../FileActionBlock/FileActionBlock';

export function Message({ message }: MessageProps) {
  const roleColor = message.role === 'user' ? 'green' : 'cyan';
  const roleLabel = message.role === 'user' ? 'USER' : 'AI';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Box flexDirection="column" marginY={1} paddingLeft={2}>
      <Box gap={2} alignItems="center">
        <Text bold color={roleColor}>{roleLabel}</Text>
        <Text dimColor>{time}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="white">{message.text}</Text>
      </Box>
      {message.fileActions && message.fileActions.length > 0 && (
        <Box flexDirection="column" marginTop={1} padding={1} borderStyle="round" borderColor="dimColor">
          <Text dimColor bold>File Actions:</Text>
          {message.fileActions.map((action, i) => (
            <FileActionBlock key={i} action={action} />
          ))}
        </Box>
      )}
    </Box>
  );
}
