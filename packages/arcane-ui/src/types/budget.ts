export interface BudgetSummary {
  totalTokens: number;
  maxTokens: number;
  estimatedCostUSD: number;
  turns: number;
  maxTurns: number;
}

export type BudgetColor = 'green' | 'amber' | 'red';

export function getBudgetColor(percent: number): BudgetColor {
  if (percent >= 90) return 'red';
  if (percent >= 80) return 'amber';
  return 'green';
}
