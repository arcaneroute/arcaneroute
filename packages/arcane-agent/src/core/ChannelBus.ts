/**
 * ChannelBus - Channel-based event bus untuk inter-agent communication
 * Agents berkomunikasi via named channels/topics
 */

import type { AgentEvent, EventHandler } from '../types';

export class ChannelBus {
  private channels: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: Map<string, AgentEvent[]> = new Map();
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  subscribe(channel: string, handler: EventHandler): void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(handler);
  }

  unsubscribe(channel: string, handler: EventHandler): void {
    this.channels.get(channel)?.delete(handler);
    if (this.channels.get(channel)?.size === 0) {
      this.channels.delete(channel);
    }
  }

  publish(channel: string, event: AgentEvent): void {
    const handlers = this.channels.get(channel);
    if (handlers) {
      for (const handler of handlers) {
        const result = handler(event);
        if (result instanceof Promise) {
          result.catch((err) => {
            console.error(`Error in channel handler for '${channel}':`, err);
          });
        }
      }
    }

    this.addToHistory(channel, event);
  }

  createAsyncIterator(channel: string): AsyncGenerator<AgentEvent> {
    const queue: AgentEvent[] = [];
    let resolve: ((e: AgentEvent) => void) | null = null;
    let reject: ((e: Error) => void) | null = null;
    let closed = false;

    const unsubscribe = () => {
      this.unsubscribe(channel, handler);
    };

    const handler: EventHandler = (event) => {
      if (closed) return;
      if (resolve) {
        const r = resolve;
        resolve = null;
        r(event);
      } else {
        queue.push(event);
      }
    };

    this.subscribe(channel, handler);

    return {
      next(): Promise<IteratorResult<AgentEvent>> {
        if (closed) {
          return Promise.resolve({ value: undefined as any, done: true });
        }
        if (queue.length > 0) {
          return Promise.resolve({ value: queue.shift()!, done: false });
        }
        return new Promise<AgentEvent>((res, rej) => {
          resolve = res;
          reject = rej;
        }).then((event) => ({ value: event, done: false }));
      },
      return(): Promise<IteratorResult<AgentEvent>> {
        closed = true;
        unsubscribe();
        return Promise.resolve({ value: undefined as any, done: true });
      },
      throw(err: Error): Promise<IteratorResult<AgentEvent>> {
        closed = true;
        unsubscribe();
        return Promise.reject(err);
      },
      [Symbol.asyncIterator](): AsyncGenerator<AgentEvent> {
        return this;
      },
      [Symbol.asyncDispose](): Promise<void> {
        closed = true;
        unsubscribe();
        return Promise.resolve();
      },
    };
  }

  getChannelNames(): string[] {
    return Array.from(this.channels.keys());
  }

  getSubscriberCount(channel: string): number {
    return this.channels.get(channel)?.size ?? 0;
  }

  hasChannel(channel: string): boolean {
    return this.channels.has(channel);
  }

  clearChannel(channel: string): void {
    this.channels.delete(channel);
    this.eventHistory.delete(channel);
  }

  clearAll(): void {
    this.channels.clear();
    this.eventHistory.clear();
  }

  getHistory(channel: string, limit?: number): AgentEvent[] {
    const history = this.eventHistory.get(channel) ?? [];
    if (limit !== undefined) {
      return history.slice(-limit);
    }
    return [...history];
  }

  private addToHistory(channel: string, event: AgentEvent): void {
    if (!this.eventHistory.has(channel)) {
      this.eventHistory.set(channel, []);
    }
    const history = this.eventHistory.get(channel)!;
    history.push(event);
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }
}
