// ─────────────────────────────────────────────────────────────
//  arcane-route :: test/integration/chat.test.ts
//  Integration test: ChatCommand dry-run flow
// ─────────────────────────────────────────────────────────────

import { describe, expect, it } from 'bun:test';
import { LLMClientFactory } from '../../src/ai/LLMClientFactory.ts';
import { ThinkingAdapter } from '../../src/ai/ThinkingAdapter.ts';
import { ConfigManager } from '../../src/core/ConfigManager.ts';
import { ApiKeyMissingError, UnknownProviderError } from '../../src/types/errors.ts';

describe('LLMClientFactory', () => {
  it('creates AnthropicProvider for LLM_PROVIDER=anthropic', () => {
    ConfigManager._reset();
    process.env.LLM_PROVIDER = 'anthropic';
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key';

    const config = ConfigManager.getInstance();
    const client = LLMClientFactory.create(config);

    expect(client.getProviderName()).toBe('anthropic');
    expect(client.supportsThinking()).toBe(true);
    ConfigManager._reset();
  });

  it('creates OpenAIProvider for LLM_PROVIDER=openai', () => {
    ConfigManager._reset();
    process.env.LLM_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'sk-test-key';

    const config = ConfigManager.getInstance();
    const client = LLMClientFactory.create(config);

    expect(client.getProviderName()).toBe('openai');
    expect(client.supportsThinking()).toBe(false);
    ConfigManager._reset();
  });

  it('throws UnknownProviderError for invalid provider', () => {
    ConfigManager._reset();
    process.env.LLM_PROVIDER = 'invalid-provider';
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';

    const config = ConfigManager.getInstance();
    expect(() => LLMClientFactory.create(config)).toThrow(UnknownProviderError);
    ConfigManager._reset();
  });
});

describe('ThinkingAdapter', () => {
  it('parses high effort', () => {
    const adapter = ThinkingAdapter.fromString('high');
    expect(adapter.getEffort()).toBe('high');
    expect(adapter.getBudgetTokens()).toBe(10_000);
    expect(adapter.getTemperature()).toBe(0.2);
  });

  it('parses medium effort aliases', () => {
    const adapter = ThinkingAdapter.fromString('med');
    expect(adapter.getEffort()).toBe('medium');
    expect(adapter.getTemperature()).toBe(0.5);
  });

  it('parses low effort alias l', () => {
    const adapter = ThinkingAdapter.fromString('l');
    expect(adapter.getEffort()).toBe('low');
    expect(adapter.getTemperature()).toBe(0.7);
  });

  it('throws ConfigInvalidError for unknown effort', () => {
    expect(() => ThinkingAdapter.fromString('ultra')).toThrow();
  });
});

describe('ConfigManager provider detection', () => {
  it('defaults to anthropic when LLM_PROVIDER not set', () => {
    ConfigManager._reset();
    delete process.env.LLM_PROVIDER;
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test';

    const config = ConfigManager.getInstance();
    expect(config.getProvider()).toBe('anthropic');
    ConfigManager._reset();
  });

  it('throws ApiKeyMissingError when anthropic key missing', () => {
    ConfigManager._reset();
    process.env.LLM_PROVIDER = 'anthropic';
    delete process.env.ANTHROPIC_API_KEY;

    const config = ConfigManager.getInstance();
    expect(() => config.getAnthropicApiKey()).toThrow(ApiKeyMissingError);
    ConfigManager._reset();
  });

  it('throws ApiKeyMissingError when openai key missing', () => {
    ConfigManager._reset();
    process.env.LLM_PROVIDER = 'openai';
    delete process.env.OPENAI_API_KEY;

    const config = ConfigManager.getInstance();
    expect(() => config.getOpenAIApiKey()).toThrow(ApiKeyMissingError);
    ConfigManager._reset();
  });
});
