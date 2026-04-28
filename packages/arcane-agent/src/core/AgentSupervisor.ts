/**
 * AgentSupervisor - Main supervisor agent dengan LLM-based routing
 * Central brain yang orchestrate semua sub-agents
 */

import type {
  AgentDefinition,
  AgentState,
  AgentResult,
  Tool,
  HITLConfig,
  StreamEvent,
} from '../types';
import { ChannelBus } from './ChannelBus';
import { AgentRegistry } from './AgentRegistry';
import { HumanInteractionManager } from './HumanInteractionManager';
import { PromptManager } from './PromptManager';

export interface SupervisorConfig {
  registry: AgentRegistry;
  channels: ChannelBus;
  hitl?: HITLConfig;
  promptsDir?: string;
}

export class AgentSupervisor {
  private registry: AgentRegistry;
  private channels: ChannelBus;
  private hitlManager: HumanInteractionManager;
  private prompts: PromptManager;

  constructor(config: SupervisorConfig) {
    this.registry = config.registry;
    this.channels = config.channels;
    this.hitlManager = new HumanInteractionManager(config.hitl ?? { enabled: false });
    this.prompts = new PromptManager({
      promptsDir: config.promptsDir || './src/prompts',
      cachePrompts: true,
    });
  }

  async route(task: string): Promise<string[]> {
    const agentsList = this.registry.getAvailableAgents().join('\n');

    const prompt = await this.prompts.render('router', {
      task,
      agents_list: agentsList,
    });

    const response = await this.completeWithLLM(prompt);

    const agentNames = response
      .split(',')
      .map((s) => s.trim())
      .filter((s) => this.registry.has(s));

    return agentNames.length > 0 ? agentNames : ['ChatAgent'];
  }

  async orchestrate(task: string): Promise<AgentResult> {
    const agentNames = await this.route(task);
    const primaryAgentName = agentNames[0];
    const agent = this.registry.get(primaryAgentName);

    if (!agent) {
      return {
        success: false,
        output: { error: `Agent not found: ${primaryAgentName}` },
        state: this.createInitialState(task),
        checkpoints: [],
      };
    }

    const state = this.createInitialState(task);
    state.currentAgent = primaryAgentName;

    if (this.hitlManager.isEnabled()) {
      return await this.executeWithHITL(agent, state, agentNames);
    }

    return await this.executeWithFallback(agent, state);
  }

  private async executeWithHITL(
    agent: AgentDefinition,
    state: AgentState,
    allAgents: string[]
  ): Promise<AgentResult> {
    const actionDescription = this.buildActionDescription(agent, state, allAgents);
    const response = await this.hitlManager.requestApproval(
      agent.name,
      'execute',
      actionDescription,
      { task: state.task, agents: allAgents }
    );

    if (response.decision === 'reject') {
      return {
        success: false,
        output: { reason: 'Rejected by user' },
        state,
        checkpoints: [],
      };
    }

    if (response.decision === 'modify' && response.modifiedParams) {
      Object.assign(state.context, response.modifiedParams);
    }

    return await this.executeWithFallback(agent, state);
  }

  private async executeWithFallback(
    agent: AgentDefinition,
    state: AgentState
  ): Promise<AgentResult> {
    try {
      const resultState = await agent.node(state);

      return {
        success: true,
        output: resultState.results,
        state: resultState,
        checkpoints: [],
      };
    } catch (error) {
      console.warn(`Agent ${agent.name} failed:`, error);

      state.errors.push({
        node: agent.name,
        error: String(error),
        timestamp: Date.now(),
      });

      return {
        success: false,
        output: state.results,
        state,
        checkpoints: [],
      };
    }
  }

  private buildActionDescription(
    agent: AgentDefinition,
    state: AgentState,
    allAgents: string[]
  ): string {
    return `Executing ${agent.name} for task: "${state.task}"
Agents: ${allAgents.join(', ')}
Tools available: ${agent.tools.map((t) => t.name).join(', ')}`;
  }

  private createInitialState(task: string): AgentState {
    return {
      task,
      context: {},
      messages: [],
      currentAgent: '',
      channels: {},
      results: {},
      errors: [],
    };
  }

  private async completeWithLLM(prompt: string): Promise<string> {
    return `ChatAgent`;
  }

  setStreamEmitter(emitter: (event: StreamEvent) => void): void {
    this.hitlManager.setStreamEmitter(emitter);
  }

  getHitlManager(): HumanInteractionManager {
    return this.hitlManager;
  }

  getRegistry(): AgentRegistry {
    return this.registry;
  }

  getChannels(): ChannelBus {
    return this.channels;
  }

  async updatePrompt(promptName: string): Promise<void> {
    await this.prompts.reload(promptName);
  }
}
