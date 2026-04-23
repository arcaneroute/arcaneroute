/*
 * arcane-route :: src/ai/OpenAIProvider.ts
 * ILLMClient implementation using the openai SDK
 * Compatible with: OpenAI, Groq, Together, Ollama, any OpenAI-compatible API
 */

import OpenAI from 'openai';
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

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

/**
 * OpenAI-compatible provider — ILLMClient implementation using the openai SDK.
 * Supports any OpenAI-compatible endpoint (OpenAI, Groq, Together, Ollama, etc.)
 * via configurable OPENAI_BASE_URL. Does NOT support extended thinking tokens.
 */
export class OpenAIProvider implements ILLMClient {
  private readonly client: OpenAI;
  private readonly config: ConfigManager;

  /**
   * Build the OpenAI SDK client from ConfigManager.
   * Uses OPENAI_BASE_URL to support custom/self-hosted endpoints.
   */
  constructor(config: ConfigManager) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.getOpenAIApiKey(),
      baseURL: config.getOpenAIBaseUrl(),
    });
  }

  /** @inheritdoc Always returns `'openai'`. */
  public getProviderName(): LLMProvider {
    return 'openai';
  }

  /** @inheritdoc Always returns `false` — OpenAI does not support extended thinking. */
  public supportsThinking(): boolean {
    return false;
  }

  /**
   * Send a streaming message.
   * Effort level maps to temperature (high=0.2, medium=0.5, low=0.7).
   * Thinking tokens are not supported — onThinkingDelta is never called.
   */
  public async sendMessage(params: SendMessageParams): Promise<ClaudeResponse> {
    const { messages, effort, systemPrompt, onTextDelta } = params;
    const adapter = ThinkingAdapter.create(effort);
    const model = this.config.getOpenAIModel();
    const system = systemPrompt ?? this.config.getSystemPrompt();

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    let text = '';
    let inputTokens = 0;
    let outputTokens = 0;

    const stream = await this.withRetry(() =>
      this.client.chat.completions.create({
        model,
        messages: openaiMessages,
        temperature: adapter.getTemperature(),
        stream: true,
        stream_options: { include_usage: true },
      }),
    );

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        text += delta;
        onTextDelta?.(delta);
      }
      // Capture usage from the final chunk
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens;
        outputTokens = chunk.usage.completion_tokens;
      }
    }

    return {
      thinking: '', // OpenAI does not support thinking tokens
      text,
      usage: { inputTokens, outputTokens },
    };
  }

  /**
   * Non-streaming correction turn — injects SWD failure context and retries.
   * Builds a [SWD CORRECTION TURN] user message and delegates to sendMessage.
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
   * Low-effort non-streaming call — uses lower temperature for dream compression.
   * Falls back to same model since OpenAI doesn't have a free "haiku" equivalent
   * that's universally available across all compatible endpoints.
   */
  public async sendLowEffortMessage(params: SendMessageParams): Promise<ClaudeResponse> {
    const { messages, systemPrompt } = params;
    const model = this.config.getOpenAIModel();
    const system = systemPrompt ?? this.config.getSystemPrompt();

    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const response = await this.withRetry(() =>
      this.client.chat.completions.create({
        model,
        messages: openaiMessages,
        temperature: 0.3, // Low creativity for summarization tasks
        stream: false,
      }),
    );

    const text = response.choices[0]?.message?.content ?? '';

    return {
      thinking: '',
      text,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }

  // Retry Logic

  /**
   * Retry wrapper with exponential back-off for rate-limited OpenAI calls.
   * Retries up to MAX_RETRIES times on rate_limit / 429 / 503 errors.
   * Re-throws as ArcaneError(OPENAI_API_ERROR) after exhausting attempts.
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
          lastError.message.includes('429') ||
          lastError.message.includes('503');

        if (isRateLimit && attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        break;
      }
    }

    throw new ArcaneError(
      `OpenAI API error: ${lastError?.message ?? 'Unknown error'}`,
      'OPENAI_API_ERROR',
    );
  }

  /** Promise-based delay helper used between retry attempts. */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
