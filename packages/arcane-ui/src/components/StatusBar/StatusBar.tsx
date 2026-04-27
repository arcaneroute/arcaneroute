import React from 'react';
import { Box, Text } from 'ink';

export function StatusBar() {
  return (
    <Box borderStyle="single" paddingX={1}>
      <Text dimColor>
        <Text>↑↓ Navigate</Text>
        <Text dimColor> | </Text>
        <Text>Enter Send</Text>
        <Text dimColor> | </Text>
        <Text>Shift+Enter Newline</Text>
        <Text dimColor> | </Text>
        <Text>Ctrl+C Cancel</Text>
      </Text>
    </Box>
  );
}
