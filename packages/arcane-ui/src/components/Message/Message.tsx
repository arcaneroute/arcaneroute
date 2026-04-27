import React from 'react';
import { Box, Text } from 'ink';
import type { MessageProps } from './MessageProps';
import { FileActionBlock } from '../FileActionBlock/FileActionBlock';

export function Message({ message }: MessageProps) {
  const roleColor = message.role === 'user' ? 'green' : 'cyan';
  const roleLabel = message.role === 'user' ? 'USER' : 'AI';

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text bold color={roleColor}>
          [{roleLabel}]
        </Text>
        <Text dimColor> {new Date(message.timestamp).toLocaleTimeString()}</Text>
      </Box>
      <Text>{message.text}</Text>
      {message.fileActions && message.fileActions.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {message.fileActions.map((action, i) => (
            <FileActionBlock key={i} action={action} />
          ))}
        </Box>
      )}
    </Box>
  );
}
