/**
 * SessionStore - Session history persistence
 */

import type { Session, Message, AgentState } from '../types';
import { mkdir, readdir, readFile, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';

export interface SessionStoreConfig {
  storagePath: string;
}

export class SessionStore {
  private storagePath: string;

  constructor(config: SessionStoreConfig) {
    this.storagePath = config.storagePath;
  }

  async save(session: Session): Promise<void> {
    const dir = `${this.storagePath}/sessions`;
    await this.ensureDir(dir);

    const filePath = `${dir}/${session.id}.json`;
    const content = JSON.stringify(session, null, 2);
    await writeFile(filePath, content);
  }

  async load(id: string): Promise<Session | null> {
    const filePath = `${this.storagePath}/sessions/${id}.json`;

    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async list(agentId: string): Promise<Session[]> {
    const dir = `${this.storagePath}/sessions`;

    try {
      if (!existsSync(dir)) {
        return [];
      }
      const files = await readdir(dir);
      const sessions: Session[] = [];

      for (const file of files) {
        if (String(file).endsWith('.json')) {
          try {
            const session = await this.load(String(file).replace('.json', '').split('/').pop()!);
            if (session && session.agentId === agentId) {
              sessions.push(session);
            }
          } catch {
          }
        }
      }

      return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const filePath = `${this.storagePath}/sessions/${id}.json`;
    try {
      await rm(filePath, { force: true });
    } catch {
    }
  }

  async createSession(
    agentId: string,
    initialMessages: Message[] = []
  ): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      agentId,
      messages: initialMessages,
      state: {
        task: '',
        context: {},
        messages: initialMessages,
        currentAgent: '',
        channels: {},
        results: {},
        errors: [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.save(session);
    return session;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
    const session = await this.load(id);
    if (!session) return null;

    const updated: Session = {
      ...session,
      ...updates,
      id: session.id,
      updatedAt: Date.now(),
    };

    await this.save(updated);
    return updated;
  }

  private async ensureDir(path: string): Promise<void> {
    try {
      await mkdir(path, { recursive: true });
    } catch {
    }
  }
}
