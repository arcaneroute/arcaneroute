import React from 'react';
import { Box, Text } from 'ink';
import type { DriftReportProps } from './DriftReportProps';

const ENTRY_ICONS = {
  verified: '✅',
  drifted: '⚠️',
  missing: '❌',
  untracked: '➕',
} as const;

export function DriftReport({ report }: DriftReportProps) {
  const total =
    report.verified.length +
    report.drifted.length +
    report.missing.length +
    report.untracked.length;

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold>Drift Report — {total} files</Text>
      <Box flexDirection="column" marginTop={1}>
        {report.verified.map((path) => (
          <Box key={`v-${path}`}>
            <Text color="green">{ENTRY_ICONS.verified} VERIFIED   </Text>
            <Text dimColor>{path}</Text>
          </Box>
        ))}
        {report.drifted.map((path) => (
          <Box key={`d-${path}`}>
            <Text color="yellow">{ENTRY_ICONS.drifted} DRIFTED   </Text>
            <Text dimColor>{path}</Text>
          </Box>
        ))}
        {report.missing.map((path) => (
          <Box key={`m-${path}`}>
            <Text color="red">{ENTRY_ICONS.missing} MISSING    </Text>
            <Text dimColor>{path}</Text>
          </Box>
        ))}
        {report.untracked.map((path) => (
          <Box key={`u-${path}`}>
            <Text color="cyan">{ENTRY_ICONS.untracked} UNTRACKED  </Text>
            <Text dimColor>{path}</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Summary: </Text>
        <Text color="green">{report.verified.length} verified</Text>
        <Text color="yellow"> · {report.drifted.length} drifted</Text>
        <Text color="red"> · {report.missing.length} missing</Text>
        <Text color="cyan"> · {report.untracked.length} untracked</Text>
      </Box>
    </Box>
  );
}
