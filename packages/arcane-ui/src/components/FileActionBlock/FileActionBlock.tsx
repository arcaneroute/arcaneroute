import React from 'react';
import { Box, Text } from 'ink';
import type { FileActionBlockProps } from './FileActionBlockProps';

export function FileActionBlock({ action }: FileActionBlockProps) {
  const typeConfig = {
    CREATE: { color: 'green', icon: '+', label: 'CREATE' },
    MODIFY: { color: 'yellow', icon: '~', label: 'MODIFY' },
    DELETE: { color: 'red', icon: '-', label: 'DELETE' },
  }[action.type];

  return (
    <Box alignItems="center" gap={1}>
      <Text color={typeConfig.color} bold>{typeConfig.icon}</Text>
      <Text color={typeConfig.color} bold>{typeConfig.label}</Text>
      <Text dimColor>|</Text>
      <Text color="white">{action.path}</Text>
    </Box>
  );
}
