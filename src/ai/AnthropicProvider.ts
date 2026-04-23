/*
 * arcane-route :: src/ai/AnthropicProvider.ts
 * ILLMClient implementation using @anthropic-ai/sdk
 * Supports extended thinking, streaming, and retry logic
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ConfigManager } from '../core/ConfigManager.ts';
import { ArcaneError } from '../types/errors.ts';
import type {
  ClaudeResponse,
  CorrectionParams,
  LLMProvider,
  SendMessageParams,
} from '../types/index.ts';
import type { ILLMClient } from './ILLMClient.ts';
import { ThinkingAdapter } from './ThinkingAdapter.ts';

// Internal stream delta types
interface ThinkingDelta {
  type: 'thinking_delta';
  thinking: string;
}
interface TextDelta {
  type: 'text_delta';
  text: string;
}
type ContentDelta = ThinkingDelta | TextDelta;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

/**
 * Anthropic provider — ILLMClient implementation using @anthropic-ai/sdk.
 * Supports extended thinking (adaptive mode), streaming, and exponential
 * retry on rate-limit (429 / 529 / "overloaded") responses.
 */
export class AnthropicProvider implements ILLMClient {
  private readonly client: Anthropic;
  private readonly config: ConfigManager;

  /**
   * Build the Anthropic SDK client from ConfigManager.
   * Optionally overrides base URL for custom proxy endpoints.
   */
  constructor(config: ConfigManager) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.getAnthropicApiKey(),
      ...(config.getAnthropicBaseUrl() ? { baseURL: config.getAnthropicBaseUrl() } : {}),
    });
  }

  /** @inheritdoc Always returns `'anthropic'`. */
  public getProviderName(): LLMProvider {
    return 'anthropic';
  }

  /** @inheritdoc Always returns `true` — Anthropic is the only provider with extended thinking. */
  public supportsThinking(): boolean {
    return true;
  }

  /**
   * Send a streaming message with thinking support.
   * Calls onThinkingDelta during thinking phase, onTextDelta during text phase.
   */
  public async sendMessage(params: SendMessageParams): Promise<ClaudeResponse> {
    const { messages, effort, systemPrompt, onThinkingDelta, onTextDelta } = params;
    const adapter = ThinkingAdapter.create(effort);
    const model = this.config.getAnthropicModel();
    const systemMsg = systemPrompt ?? this.config.getSystemPrompt();

    let thinking = '';
    let text = '';

    // MessageStream is not a Promise — build params with loose typing for SDK compat
    const streamParams: Record<string, unknown> = {
      model,
      max_tokens: 16_384,
      thinking: { type: 'adaptive' },
      output_config: { effort: adapter.getEffort() },
      system: systemMsg,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    };

    let stream: ReturnType<typeof this.client.messages.stream>;
    try {
      stream = this.client.messages.stream(
        streamParams as unknown as Parameters<typeof this.client.messages.stream>[0],
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ArcaneError(`Anthropic stream error: ${msg}`, 'CLAUDE_API_ERROR');
    }

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta as ContentDelta;
        if (delta.type === 'thinking_delta') {
          thinking += delta.thinking;
          onThinkingDelta?.(delta.thinking);
        } else if (delta.type === 'text_delta') {
          text += delta.text;
          onTextDelta?.(delta.text);
        }
      }
    }

    const final = await stream.finalMessage();
    return {
      thinking,
      text,
      usage: {
        inputTokens: final.usage?.input_tokens ?? 0,
        outputTokens: final.usage?.output_tokens ?? 0,
      },
    };
  }

  /**
   * Non-streaming correction turn — injects failure details and sends.
   */
  public async sendCorrectionTurn(params: CorrectionParams): Promise<ClaudeResponse> {
    const { messages, effort, failureSummary, attemptsRemaining } = params;
    const correctionPrompt =
      `[SWD CORRECTION TURN]\n` +
      `File actions failed verification:\n${failureSummary}\n\n` +
      `Please correct your response. Attempts remaining: ${attemptsRemaining}`;

    return this.sendMessage({
      ...params,
      messages: [...messages, { role: 'user', content: correctionPrompt }],
      effort,
    });
  }

  /**
   * Low-effort non-streaming call — used for dream compression.
   * Uses a cheaper/faster model (claude-haiku).
   */
  public async sendLowEffortMessage(params: SendMessageParams): Promise<ClaudeResponse> {
    const { messages, systemPrompt } = params;
    const model = this.config.getAnthropicLowEffortModel();

    const response = await this.withRetry(() =>
      this.client.messages.create({
        model,
        max_tokens: 8_192,
        system: systemPrompt ?? this.config.getSystemPrompt(),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    );

    let text = '';
    for (const block of response.content) {
      if (block.type === 'text') text += block.text;
    }

    return {
      thinking: '',
      text,
      usage: {
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
      },
    };
  }

  // Retry Logic

  /**
   * Retry wrapper with exponential back-off for rate-limited Anthropic calls.
   * Retries up to MAX_RETRIES times on rate_limit / 529 / overloaded errors.
   * Re-throws as ArcaneError(CLAUDE_API_ERROR) after exhausting attempts.
   */
  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const isRateLimit =
          lastError.message.includes('rate_limit') ||
          lastError.message.includes('529') ||
          lastError.message.includes('overloaded');

        if (isRateLimit && attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        break;
      }
    }

    throw new ArcaneError(
      `Anthropic API error: ${lastError?.message ?? 'Unknown error'}`,
      'CLAUDE_API_ERROR',
    );
  }

  /** Promise-based delay helper used between retry attempts. */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
