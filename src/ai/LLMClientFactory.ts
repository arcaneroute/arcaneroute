// ─────────────────────────────────────────────────────────────
//  arcane-route :: src/ai/LLMClientFactory.ts
//  Factory: reads LLM_PROVIDER and returns the correct ILLMClient
// ─────────────────────────────────────────────────────────────

import type { ILLMClient } from './ILLMClient.ts';
import type { ConfigManager } from '../core/ConfigManager.ts';
import { AnthropicProvider } from './AnthropicProvider.ts';
import { OpenAIProvider } from './OpenAIProvider.ts';
import { UnknownProviderError } from '../types/errors.ts';

/**
 * Factory class for creating LLM client instances.
 * Reads LLM_PROVIDER from ConfigManager and returns the appropriate provider.
 *
 * Usage:
 *   const client = LLMClientFactory.create(config);
 *   // Returns AnthropicProvider or OpenAIProvider based on env
 */
export class LLMClientFactory {
  /**
   * Create and return the active LLM client.
   * Throws UnknownProviderError if LLM_PROVIDER is not 'anthropic' or 'openai'.
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
