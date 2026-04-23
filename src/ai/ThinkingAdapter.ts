// ─────────────────────────────────────────────────────────────
//  arcane-route :: src/ai/ThinkingAdapter.ts
//  Strategy: maps effort levels to Anthropic thinking configs
// ─────────────────────────────────────────────────────────────

import type { EffortLevel, ThinkingConfig } from '../types/index.ts';
import { ConfigInvalidError } from '../types/errors.ts';

// ── Budget token map per effort level ────────────────────────
const BUDGET_TOKENS: Record<EffortLevel, number> = {
  high: 10_000,
  medium: 5_000,
  low: 1_000,
};

// ── Temperature map per effort level (for OpenAI) ────────────
export const TEMPERATURE_MAP: Record<EffortLevel, number> = {
  high: 0.2,
  medium: 0.5,
  low: 0.7,
};

/**
 * Strategy class that encapsulates effort level semantics.
 * For Anthropic: controls thinking budget tokens.
 * For OpenAI: provides temperature recommendations.
 */
export class ThinkingAdapter {
  private constructor(private readonly effort: EffortLevel) {}

  /** Create a ThinkingAdapter from a validated EffortLevel. */
  public static create(effort: EffortLevel): ThinkingAdapter {
    return new ThinkingAdapter(effort);
  }

  /** Parse and validate an effort string, returning a ThinkingAdapter. */
  public static fromString(raw: string): ThinkingAdapter {
    const normalized = raw.toLowerCase().trim();

    const aliases: Record<string, EffortLevel> = {
      h: 'high',
      high: 'high',
      m: 'medium',
      med: 'medium',
      medium: 'medium',
      l: 'low',
      low: 'low',
    };

    const effort = aliases[normalized];
    if (!effort) {
      throw new ConfigInvalidError(
        `Invalid effort level "${raw}". Valid: high, medium, low (or h, m, l).`,
      );
    }

    return new ThinkingAdapter(effort);
  }

  /** Returns the effort level. */
  public getEffort(): EffortLevel {
    return this.effort;
  }

  /** Returns the Anthropic adaptive thinking configuration. */
  public getThinkingConfig(): ThinkingConfig {
    return {
      type: 'adaptive',
      effort: this.effort,
      budgetTokens: BUDGET_TOKENS[this.effort],
    };
  }

  /** Returns the thinking budget token count for this effort level. */
  public getBudgetTokens(): number {
    return BUDGET_TOKENS[this.effort];
  }

  /** Returns the recommended temperature for OpenAI-compatible providers. */
  public getTemperature(): number {
    return TEMPERATURE_MAP[this.effort];
  }
}
