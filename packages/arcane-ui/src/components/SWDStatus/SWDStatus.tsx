import React from 'react';
import { Box, Text } from 'ink';
import type { SWDStatusProps } from './SWDStatusProps';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  idle: { color: 'white', label: 'Ready' },
  'pre-snapshot': { color: 'cyan', label: 'Capturing...' },
  verifying: { color: 'cyan', label: 'Verifying...' },
  verified: { color: 'green', label: 'Verified' },
  failed: { color: 'red', label: 'Failed' },
  unmatched: { color: 'yellow', label: 'Unmatched' },
};

export function SWDStatus({ swd }: SWDStatusProps) {
  const config = STATUS_CONFIG[swd.status] || STATUS_CONFIG.idle;
  const statusIcon = swd.status === 'verified' ? '✅' : swd.status === 'failed' ? '❌' : swd.status === 'unmatched' ? '⚠️' : '';

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold>SWD</Text>
      <Text>
        <Text dimColor>Status: </Text>
        <Text color={config.color}>
          {statusIcon} {config.label}
        </Text>
      </Text>
      {swd.fileCount !== undefined && (
        <Text dimColor>Files: {swd.fileCount}</Text>
      )}
      {swd.verifiedCount !== undefined && (
        <Text dimColor>
          Verified: {swd.verifiedCount} · Failed: {swd.failedCount}
        </Text>
      )}
    </Box>
  );
}
