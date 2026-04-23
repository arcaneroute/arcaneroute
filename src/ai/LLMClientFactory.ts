/*
 * arcane-route :: src/ai/LLMClientFactory.ts
 * Factory function: reads LLM_PROVIDER and returns the correct ILLMClient
 */

import type { ConfigManager } from '../core/ConfigManager.ts';
import { UnknownProviderError } from '../types/errors.ts';
import { AnthropicProvider } from './AnthropicProvider.ts';
import type { ILLMClient } from './ILLMClient.ts';
import { OpenAIProvider } from './OpenAIProvider.ts';

/**
 * Factory for constructing the active ILLMClient.
 * Always use this class — never instantiate providers directly.
 */
// biome-ignore lint/complexity/noStaticOnlyClass: kept for API ergonomics / named import compatibility
export class LLMClientFactory {
  /**
   * Create and return the active LLM client based on LLM_PROVIDER env var.
   * Returns `AnthropicProvider` or `OpenAIProvider`.
   *
   * @throws {UnknownProviderError} if LLM_PROVIDER is not `'anthropic'` or `'openai'`.
   *
   * @example
   *   const client = LLMClientFactory.create(config);
   */
  public static create(config: ConfigManager): ILLMClient {
    const provider = config.getProvider();

    switch (provider) {
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = provider;
        throw new UnknownProviderError(_exhaustive as string);
      }
    }
  }
}
