/**
 * Factory - Main factory function untuk create agents
 */

import type {
  AgentConfig,
  AgentInstance,
  AgentResult,
  StreamEvent,
  AgentState,
  ApprovalRequest,
  ApprovalResponse,
  ApprovalHandler,
  EventHandler,
} from '../types';
import { AgentRegistry } from '../core/AgentRegistry';
import { ChannelBus } from '../core/ChannelBus';
import { AgentSupervisor } from '../core/AgentSupervisor';
import { EventStream } from '../streaming/EventStream';
import { FileAgent } from '../agents/FileAgent';
import { CodeAgent } from '../agents/CodeAgent';
import { ReviewAgent } from '../agents/ReviewAgent';
import { ChatAgent } from '../agents/ChatAgent';

export function createAgent(config: AgentConfig): AgentInstance {
  const registry = new AgentRegistry();
  const channels = new ChannelBus();
  const eventStream = new EventStream();

  registry.register(FileAgent);
  registry.register(CodeAgent);
  registry.register(ReviewAgent);
  registry.register(ChatAgent);

  const supervisor = new AgentSupervisor({
    registry,
    channels,
    hitl: config.hitl,
    promptsDir: config.promptsDir ?? './src/prompts',
  });

  let currentState: AgentState | null = null;

  supervisor.setStreamEmitter((event: StreamEvent) => {
    eventStream.emit(event);
  });

  const agent: AgentInstance = {
    async run(input: string): Promise<AgentResult> {
      eventStream.emit({
        type: 'start',
        agent: config.name || 'Agent',
        task: input,
      } as StreamEvent);

      const result = await supervisor.orchestrate(input);

      if (result.success) {
        eventStream.emit({
          type: 'complete',
          agent: config.name || 'Agent',
          result: result.output,
        } as StreamEvent);
      }

      currentState = result.state;
      return result;
    },

    async *stream(input: string): AsyncGenerator<StreamEvent> {
      eventStream.emit({
        type: 'start',
        agent: config.name || 'Agent',
        task: input,
      } as StreamEvent);

      const result = await supervisor.orchestrate(input);

      yield {
        type: 'complete',
        agent: config.name || 'Agent',
        result: result.output,
      } as StreamEvent;
    },

    getState(): AgentState {
      return currentState!;
    },

    async checkpoint(): Promise<string> {
      return '';
    },

    async restore(_path: string): Promise<void> {
    },

    subscribe(channel: string, handler: EventHandler): void {
      channels.subscribe(channel, handler);
    },

    unsubscribe(channel: string, handler: EventHandler): void {
      channels.unsubscribe(channel, handler);
    },

    async requestApproval(request: ApprovalRequest): Promise<ApprovalResponse> {
      const hitl = supervisor.getHitlManager();
      return hitl.requestApproval(
        request.agent,
        request.action,
        request.description,
        request.context
      );
    },

    getPendingApprovals(): ApprovalRequest[] {
      return supervisor.getHitlManager().getPendingApprovals();
    },

    setApprovalHandler(handler: ApprovalHandler): void {
      supervisor.getHitlManager().setApprovalHandler(handler);
    },

    setLLMClient(client: unknown): void {
      supervisor.setLLMClient(client as any);
    },
  };

  return agent;
}
