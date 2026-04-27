import React from 'react';
import { Box, Text } from 'ink';
import type { BudgetPanelProps } from './BudgetPanelProps';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { getBudgetColor } from '../../types/budget';

export function BudgetPanel({ budget }: BudgetPanelProps) {
  const percentUsed = (budget.totalTokens / budget.maxTokens) * 100;
  const turnsRemaining = budget.maxTurns - budget.turns;
  const color = getBudgetColor(percentUsed);

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Text bold>Budget</Text>
      <Text>
        Tokens: {budget.totalTokens.toLocaleString()} / {budget.maxTokens.toLocaleString()}
      </Text>
      <Text>Cost: ${budget.estimatedCostUSD.toFixed(4)}</Text>
      <Text>Turns: {budget.turns} / {budget.maxTurns}</Text>
      <ProgressBar value={percentUsed} color={color} />
      <Text dimColor>{turnsRemaining} turns remaining</Text>
    </Box>
  );
}
