import React from 'react';
import { Box, Text } from 'ink';
import type { FileActionBlockProps } from './FileActionBlockProps';

export function FileActionBlock({ action }: FileActionBlockProps) {
  const color =
    action.type === 'CREATE' ? 'green' : action.type === 'MODIFY' ? 'yellow' : 'red';

  return (
    <Box>
      <Text dimColor>[FILE_ACTION] </Text>
      <Text color={color}>{action.type.padEnd(6)}</Text>
      <Text> {action.path}</Text>
      <Text dimColor> [/FILE_ACTION]</Text>
    </Box>
  );
}
