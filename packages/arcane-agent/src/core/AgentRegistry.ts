/**
 * AgentRegistry - Global registry untuk tracking semua agents
 * Mendukung core agents dan plugin agents
 */

import type {
  AgentDefinition,
  AgentRegistry as AgentRegistryInterface,
  Tool,
} from '../types';

export class AgentRegistry implements AgentRegistryInterface {
  private agents: Map<string, AgentDefinition> = new Map();

  register(agent: AgentDefinition): void {
    if (this.agents.has(agent.name)) {
      console.warn(`Agent '${agent.name}' is already registered. Overwriting.`);
    }
    this.agents.set(agent.name, agent);
  }

  unregister(name: string): void {
    if (!this.agents.has(name)) {
      console.warn(`Agent '${name}' is not registered.`);
      return;
    }
    this.agents.delete(name);
  }

  get(name: string): AgentDefinition | undefined {
    return this.agents.get(name);
  }

  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  getAgentTools(): Tool[] {
    const tools: Tool[] = [];
    for (const agent of this.agents.values()) {
      tools.push(...agent.tools);
    }
    return tools;
  }

  has(name: string): boolean {
    return this.agents.has(name);
  }

  getAll(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  getByEvent(eventType: string): AgentDefinition[] {
    const result: AgentDefinition[] = [];
    for (const agent of this.agents.values()) {
      if (agent.events?.includes(eventType)) {
        result.push(agent);
      }
    }
    return result;
  }

  clear(): void {
    this.agents.clear();
  }

  size(): number {
    return this.agents.size;
  }
}
