/*
 * arcane-route :: src/ai/providers/ArcaneAgentProvider.ts
 * ILLMClient adapter that wraps arcane-agent's AgentInstance
 */

import { createAgent, type AgentInstance } from 'arcane-agent';
import { resolve } from 'node:path';
import type { ConfigManager } from '../../core/ConfigManager.ts';
import type {
  ClaudeResponse,
  CorrectionParams,
  LLMProvider,
  Message,
  SendMessageParams,
} from '../../types/index.ts';
import type { ILLMClient } from '../ILLMClient.ts';

// Resolve path to arcane-agent's prompts directory (relative to project root)
const AGENT_PROMPTS_DIR = resolve(process.cwd(), 'packages/arcane-agent/src/prompts');

/**
 * LLM Client interface for arcane-agent
 */
interface AgentLLMClient {
  complete(messages: Message[]): Promise<string>;
}

/**
 * OpenAI LLM Client
 */
class OpenAIClient implements AgentLLMClient {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(apiKey: string, baseURL: string, model: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = model;
  }

  async complete(messages: Message[]): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? '';
  }
}

/**
 * Anthropic LLM Client
 */
class AnthropicClient implements AgentLLMClient {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(apiKey: string, baseURL: string, model: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = model;
  }

  async complete(messages: Message[]): Promise<string> {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

    const data = (await response.json()) as { content: Array<{ text: string }> };
    return data.content[0]?.text ?? '';
  }
}

export class ArcaneAgentProvider implements ILLMClient {
  private agent: AgentInstance;
  private underlyingProvider: LLMProvider;
  private llmClient: AgentLLMClient;

  private constructor(
    agent: AgentInstance,
    underlyingProvider: LLMProvider,
    llmClient: AgentLLMClient,
  ) {
    this.agent = agent;
    this.underlyingProvider = underlyingProvider;
    this.llmClient = llmClient;
  }

  /**
   * Factory method to create ArcaneAgentProvider from ConfigManager.
   */
  public static async create(config: ConfigManager): Promise<ArcaneAgentProvider> {
    const underlyingProvider = config.getArcaneUnderlyingProvider();

    // Create LLM client based on underlying provider
    let llmClient: AgentLLMClient;
    if (underlyingProvider === 'openai') {
      llmClient = new OpenAIClient(
        config.getOpenAIApiKey(),
        config.getOpenAIBaseUrl(),
        config.getOpenAIModel(),
      );
    } else {
      llmClient = new AnthropicClient(
        config.getAnthropicApiKey(),
        config.getAnthropicBaseUrl() ?? 'https://api.anthropic.com',
        config.getAnthropicModel(),
      );
    }

    // Create agent config for arcane-agent
    const agentConfig = {
      type: 'chat' as const,
      name: 'ArcaneAI',
      llmProvider: underlyingProvider as 'anthropic' | 'openai',
      hitl: {
        enabled: false,
        autoApprove: true,
        timeout: 120_000,
      },
      promptsDir: AGENT_PROMPTS_DIR,
    };

    const agent = createAgent(agentConfig);

    // Set the LLM client on the agent
    agent.setLLMClient(llmClient);

    return new ArcaneAgentProvider(agent, underlyingProvider, llmClient);
  }

  /**
   * Send a message through arcane-agent.
   */
  async sendMessage(params: SendMessageParams): Promise<ClaudeResponse> {
    const input = this.buildInput(params);

    const result = await this.agent.run(input);

    // Extract text from the agent's state messages (get the LAST assistant message)
    let text = '';
    const messages = result.state?.messages ?? [];
    for (const msg of messages) {
      if (msg.role === 'assistant' && typeof msg.content === 'string') {
        text = msg.content;
      }
    }

    // Fallback if no assistant message found
    if (!text) {
      if (typeof result.output === 'string') {
        text = result.output;
      } else if (result.output && typeof result.output === 'object') {
        const output = result.output as Record<string, unknown>;
        if (output.text && typeof output.text === 'string') {
          text = output.text;
        } else if (output.content && typeof output.content === 'string') {
          text = output.content;
        } else if (output.message && typeof output.message === 'string') {
          text = output.message;
        } else if (output.response && typeof output.response === 'string') {
          text = output.response;
        } else {
          text = JSON.stringify(result.output, null, 2);
        }
      }
    }

    // For now, no real streaming - text arrives all at once
    // TODO: implement real streaming in arcane-agent
    if (params.onTextDelta) {
      params.onTextDelta(text);
    }

    return {
      thinking: '',
      text,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  /**
   * Send a correction turn after SWD verification failure.
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
    const history = params.messages.map((m) => `${m.role}: ${m.content}`).join('\n');

    const system = params.systemPrompt ? `System: ${params.systemPrompt}\n` : '';

    const lastMessage = params.messages.at(-1)?.content ?? '';

    return `${system}${history}\nuser: ${lastMessage}`;
  }

  /**
   * Build input for correction turns, including failure context.
   */
  private buildCorrectionInput(params: CorrectionParams): string {
    const history = params.messages.map((m) => `${m.role}: ${m.content}`).join('\n');

    const lastMessage = params.messages.at(-1)?.content ?? '';

    return `${history}\n\nCRITIQUE:\n${params.failureSummary}\n\nAttempt ${params.attemptsRemaining} remaining.\nuser: ${lastMessage}`;
  }
}
