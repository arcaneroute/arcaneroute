/*
 * arcane-route :: src/ai/providers/ArcaneAgentProvider.ts
 * ILLMClient adapter that wraps arcane-agent's AgentInstance
 */

import { createAgent, type AgentInstance } from 'arcane-agent';
import type { ConfigManager } from '../../core/ConfigManager.ts';
import type {
  ClaudeResponse,
  CorrectionParams,
  LLMProvider,
  SendMessageParams,
} from '../../types/index.ts';
import type { ILLMClient } from '../ILLMClient.ts';

export class ArcaneAgentProvider implements ILLMClient {
  private agent: AgentInstance;
  private underlyingProvider: LLMProvider;

  private constructor(agent: AgentInstance, underlyingProvider: LLMProvider) {
    this.agent = agent;
    this.underlyingProvider = underlyingProvider;
  }

  /**
   * Factory method to create ArcaneAgentProvider from ConfigManager.
   */
  public static create(config: ConfigManager): ArcaneAgentProvider {
    const underlyingProvider = config.getArcaneUnderlyingProvider();

    // Create agent config for arcane-agent
    const agentConfig = {
      type: 'chat' as const,
      name: 'ArcaneAI',
      llmProvider: underlyingProvider as 'anthropic' | 'openai',
      hitl: {
        enabled: true,
        autoApprove: false,
        timeout: 120_000,
      },
    };

    const agent = createAgent(agentConfig);
    return new ArcaneAgentProvider(agent, underlyingProvider);
  }

  /**
   * Send a streaming message through arcane-agent.
   * Note: arcane-agent's stream() runs to completion first, so callbacks fire at end.
   */
  async sendMessage(params: SendMessageParams): Promise<ClaudeResponse> {
    const input = this.buildInput(params);
    let text = '';
    let thinking = '';

    for await (const event of this.agent.stream(input)) {
      switch (event.type) {
        case 'thought':
          thinking += event.content;
          if (params.onThinkingDelta) {
            params.onThinkingDelta(event.content);
          }
          break;
        case 'tool_call':
          // Optionally handle tool calls
          break;
        case 'complete':
          text = String(event.result ?? '');
          break;
      }
    }

    return {
      thinking,
      text,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  /**
   * Send a correction turn after SWD verification failure.
   * Injects failure context into the agent's context.
   */
  async sendCorrectionTurn(params: CorrectionParams): Promise<ClaudeResponse> {
    const context = {
      correctionAttempt: true,
      failureSummary: params.failureSummary,
      attemptsRemaining: params.attemptsRemaining,
    };

    const input = this.buildCorrectionInput(params);

    const result = await this.agent.run(input, context);
    const output = String(result.output ?? '');

    return {
      thinking: '',
      text: output,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  /**
   * Send a low-effort message for memory compression (dream).
   */
  async sendLowEffortMessage(params: SendMessageParams): Promise<ClaudeResponse> {
    const input = this.buildInput(params);
    const result = await this.agent.run(input);

    return {
      thinking: '',
      text: String(result.output ?? ''),
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  getProviderName(): LLMProvider {
    return this.underlyingProvider;
  }

  supportsThinking(): boolean {
    return this.underlyingProvider === 'anthropic';
  }

  /**
   * Build input string from messages and system prompt.
   */
  private buildInput(params: SendMessageParams): string {
    const history = params.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const system = params.systemPrompt
      ? `System: ${params.systemPrompt}\n`
      : '';

    const lastMessage = params.messages.at(-1)?.content ?? '';

    return `${system}${history}\nuser: ${lastMessage}`;
  }

  /**
   * Build input for correction turns, including failure context.
   */
  private buildCorrectionInput(params: CorrectionParams): string {
    const history = params.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const lastMessage = params.messages.at(-1)?.content ?? '';

    return `${history}\n\nCRITIQUE:\n${params.failureSummary}\n\nAttempt ${params.attemptsRemaining} remaining.\nuser: ${lastMessage}`;
  }
}
