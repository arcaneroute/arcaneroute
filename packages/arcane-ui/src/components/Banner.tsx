import React from 'react';
import { Box, Text } from 'ink';
import type { BannerProps } from './BannerProps';

export function Banner({ version, provider, model, effort, swdActive }: BannerProps) {
  const effortColor = effort === 'high' ? 'cyan' : effort === 'medium' ? 'yellow' : 'white';

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Box>
        <Text bold color="magenta">
          🔮 ARCANE ROUTE
        </Text>
        <Text dimColor> v{version}</Text>
      </Box>
      <Text dimColor>
        Provider: <Text color="cyan">{provider.toUpperCase()}</Text> · Model:{' '}
        <Text color="cyan">{model}</Text>
      </Text>
      <Text dimColor>
        Effort: <Text color={effortColor}>{effort.toUpperCase()}</Text> · SWD:{' '}
        <Text color={swdActive ? 'green' : 'red'}>{swdActive ? 'ACTIVE' : 'INACTIVE'}</Text>
      </Text>
    </Box>
  );
}
