/**
 * EventStream - Structured JSON event streaming
 */

import type { StreamEvent, StreamEventType } from '../types';

export type EventListener = (event: StreamEvent) => void | Promise<void>;

export class EventStream {
  private listeners: Map<StreamEventType | '*', Set<EventListener>> = new Map();
  private eventHistory: StreamEvent[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  on(eventType: StreamEventType | '*', listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  off(eventType: StreamEventType | '*', listener: EventListener): void {
    this.listeners.get(eventType)?.delete(listener);
  }

  emit(event: StreamEvent): void {
    this.addToHistory(event);

    const listeners = this.listeners.get('*');
    if (listeners) {
      for (const listener of listeners) {
        try {
          const result = listener(event);
          if (result instanceof Promise) {
            result.catch((err) =>
              console.error('Event listener error:', err)
            );
          }
        } catch (err) {
          console.error('Event listener error:', err);
        }
      }
    }

    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        try {
          const result = listener(event);
          if (result instanceof Promise) {
            result.catch((err) =>
              console.error('Event listener error:', err)
            );
          }
        } catch (err) {
          console.error('Event listener error:', err);
        }
      }
    }
  }

  async *stream(): AsyncGenerator<StreamEvent> {
    const queue: StreamEvent[] = [];
    let resolve: ((e: StreamEvent) => void) | null = null;

    const listener = (event: StreamEvent) => {
      if (resolve) {
        const r = resolve;
        resolve = null;
        r(event);
      } else {
        queue.push(event);
      }
    };

    const off = this.on('*', listener);

    try {
      while (true) {
        if (queue.length > 0) {
          yield queue.shift()!;
        } else {
          yield await new Promise<StreamEvent>((res) => {
            resolve = res;
          });
        }
      }
    } finally {
      off();
    }
  }

  getHistory(): StreamEvent[] {
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  private addToHistory(event: StreamEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

export const createEventStream = (): EventStream => {
  return new EventStream();
};
