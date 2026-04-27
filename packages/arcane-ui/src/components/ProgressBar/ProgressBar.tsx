import React from 'react';
import { Text } from 'ink';
import type { ProgressBarProps } from './ProgressBarProps';

const COLOR_MAP: Record<string, string> = {
  green: '\x1b[32m',
  amber: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

export function ProgressBar({
  value,
  width = 20,
  showLabel = false,
  color = 'green',
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const filled = Math.round((clampedValue / 100) * width);
  const empty = width - filled;
  const colorCode = COLOR_MAP[color] || COLOR_MAP.green;

  const bar = `${colorCode}${'█'.repeat(filled)}${'░'.repeat(empty)}\x1b[0m`;
  const label = showLabel ? ` ${Math.round(clampedValue)}%` : '';

  return <Text>{bar}{label}</Text>;
}
