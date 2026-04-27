import React from 'react';
import { Box, Text } from 'ink';
import type { DreamProgressProps } from './DreamProgressProps';
import { ProgressBar } from '../ProgressBar/ProgressBar';

export function DreamProgress({ progress }: DreamProgressProps) {
  const phaseLabel = {
    analyzing: 'Analyzing entries...',
    compressing: 'Compressing...',
    writing: 'Writing compressed memory...',
    complete: 'Compression complete!',
  }[progress.phase];

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold>Dream Compression</Text>
      <Box marginTop={1}>
        <Text>{phaseLabel}</Text>
      </Box>
      {progress.progress !== undefined && (
        <Box marginTop={1}>
          <ProgressBar value={progress.progress} showLabel color="cyan" />
        </Box>
      )}
      {progress.phase === 'complete' && progress.entryCountBefore !== undefined && (
        <Box marginTop={1} flexDirection="column">
          <Text>
            {progress.entryCountBefore} entries → {progress.entryCountAfter} entries
          </Text>
          <Text color="green">{progress.reductionPercent}% reduction</Text>
        </Box>
      )}
    </Box>
  );
}
