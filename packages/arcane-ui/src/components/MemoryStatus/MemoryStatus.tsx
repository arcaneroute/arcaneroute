import React from 'react';
import { Box, Text } from 'ink';
import type { MemoryStatusProps } from './MemoryStatusProps';

export function MemoryStatus({ memory }: MemoryStatusProps) {
  const statusColor = memory.status === 'normal' ? 'green' : memory.status === 'warning' ? 'yellow' : 'red';

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold>Memory</Text>
      <Text>Entries: {memory.entryCount}</Text>
      <Text>Size: {memory.sizeKb.toFixed(1)} KB</Text>
      <Text>
        Status: <Text color={statusColor}>{memory.status.toUpperCase()}</Text>
      </Text>
    </Box>
  );
}
