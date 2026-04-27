import React from 'react';
import { Box, Text } from 'ink';
import { BudgetPanel } from '../BudgetPanel/BudgetPanel';
import { MemoryStatus } from '../MemoryStatus/MemoryStatus';
import { SWDStatus } from '../SWDStatus/SWDStatus';
import type { BudgetSummary, MemoryStatus as MemoryStatusType, SWDStatus as SWDStatusType } from '../../types';

export interface SidebarProps {
  budget: BudgetSummary;
  memory: MemoryStatusType;
  swd: SWDStatusType;
}

export function Sidebar({ budget, memory, swd }: SidebarProps) {
  return (
    <Box flexDirection="column" width={35}>
      {/* Sidebar header */}
      <Box
        borderStyle="bold"
        borderColor="magenta"
        padding={1}
        marginBottom={1}
        justifyContent="center"
        alignItems="center"
      >
        <Text bold color="magenta">STATUS</Text>
        <Text dimColor> | </Text>
        <Text dimColor>●</Text>
      </Box>

      <BudgetPanel budget={budget} />
      <Box marginTop={1}>
        <MemoryStatus memory={memory} />
      </Box>
      <Box marginTop={1}>
        <SWDStatus swd={swd} />
      </Box>
    </Box>
  );
}
