import React from 'react';
import { Box } from 'ink';
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
    <Box flexDirection="column" width={30} marginLeft={1}>
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
