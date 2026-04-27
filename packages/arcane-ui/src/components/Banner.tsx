import React from 'react';
import { Box, Text } from 'ink';
import type { BannerProps } from './BannerProps';

export type AppStatus = 'idle' | 'running' | 'streaming' | 'verifying' | 'writing' | 'complete' | 'error';

const STATUS_CONFIG: Record<AppStatus, { color: string; label: string; icon: string }> = {
  idle: { color: 'gray', label: 'IDLE', icon: '○' },
  running: { color: 'yellow', label: 'RUNNING', icon: '◐' },
  streaming: { color: 'cyan', label: 'STREAMING', icon: '◔' },
  verifying: { color: 'yellow', label: 'VERIFYING', icon: '◑' },
  writing: { color: 'blue', label: 'WRITING', icon: '◕' },
  complete: { color: 'green', label: 'COMPLETE', icon: '●' },
  error: { color: 'red', label: 'ERROR', icon: '✖' },
};

interface BannerWithStatusProps extends BannerProps {
  status?: AppStatus;
}

export function Banner({ version, provider, model, effort, swdActive, status = 'idle' }: BannerWithStatusProps) {
  const effortColor = effort === 'high' ? 'cyan' : effort === 'medium' ? 'yellow' : 'white';
  const statusConfig = STATUS_CONFIG[status];

  return (
    <Box flexDirection="column" borderStyle="bold" padding={1} borderColor="magenta">
      {/* Top row - Title and Status */}
      <Box justifyContent="space-between" alignItems="center">
        <Box gap={2} alignItems="center">
          <Text bold color="magenta" inverse> 🔮 </Text>
          <Text bold color="magenta">ARCANE ROUTE</Text>
          <Text dimColor>v{version}</Text>
        </Box>

        {/* Status Indicator */}
        <Box gap={1} alignItems="center">
          <Box
            borderStyle="round"
            borderColor={statusConfig.color}
            paddingX={2}
            paddingY={0}
          >
            <Text color={statusConfig.color} bold>
              {statusConfig.icon} {statusConfig.label}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Middle row - Provider info */}
      <Box marginTop={1}>
        <Box flexDirection="column" gap={0}>
          <Text dimColor>
            <Text color="white">Provider:</Text>
            <Text color="cyan" bold> {provider.toUpperCase()}</Text>
            <Text dimColor> | </Text>
            <Text color="white">Model:</Text>
            <Text color="cyan"> {model}</Text>
          </Text>
          <Text dimColor>
            <Text color="white">Effort:</Text>
            <Text color={effortColor} bold> {effort.toUpperCase()}</Text>
            <Text dimColor> | </Text>
            <Text color="white">SWD:</Text>
            <Text color={swdActive ? 'green' : 'red'} bold> {swdActive ? 'ACTIVE' : 'INACTIVE'}</Text>
          </Text>
        </Box>
      </Box>

      {/* Status description bar */}
      <Box marginTop={1} paddingTop={1} borderStyle="single" borderTopColor="dimColor">
        <Text dimColor>
          {status === 'idle' && 'Ready to assist. Type your message below.'}
          {status === 'running' && 'Processing your request...'}
          {status === 'streaming' && 'Receiving response from AI...'}
          {status === 'verifying' && 'Verifying file operations via SWD...'}
          {status === 'writing' && 'Writing files to disk...'}
          {status === 'complete' && 'Operation completed successfully.'}
          {status === 'error' && 'An error occurred. Check the output below.'}
        </Text>
      </Box>
    </Box>
  );
}
