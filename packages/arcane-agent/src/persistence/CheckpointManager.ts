/**
 * CheckpointManager - Graph state checkpointing untuk resume capability
 */

import type { Checkpoint, AgentState } from '../types';
import { mkdir, readdir, readFile, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';

export interface CheckpointManagerConfig {
  storagePath: string;
  format?: 'json';
}

export class CheckpointManager {
  private storagePath: string;
  private format: 'json';

  constructor(config: CheckpointManagerConfig) {
    this.storagePath = config.storagePath;
    this.format = config.format || 'json';
  }

  async save(checkpoint: Checkpoint): Promise<string> {
    const dir = `${this.storagePath}/${checkpoint.agentId}/checkpoints`;
    await this.ensureDir(dir);

    const fileName = `${checkpoint.timestamp}.${this.format}`;
    const filePath = `${dir}/${fileName}`;

    const content = JSON.stringify(checkpoint, null, 2);
    await writeFile(filePath, content);

    return filePath;
  }

  async load(path: string): Promise<Checkpoint> {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  }

  async list(agentId: string): Promise<Checkpoint[]> {
    const dir = `${this.storagePath}/${agentId}/checkpoints`;

    try {
      if (!existsSync(dir)) {
        return [];
      }
      const files = await readdir(dir);
      const checkpoints: Checkpoint[] = [];

      for (const file of files) {
        if (String(file).endsWith(`.${this.format}`)) {
          try {
            const checkpoint = await this.load(`${dir}/${String(file)}`);
            checkpoints.push(checkpoint);
          } catch {
          }
        }
      }

      return checkpoints.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  async getLatest(agentId: string): Promise<Checkpoint | null> {
    const checkpoints = await this.list(agentId);
    return checkpoints[0] || null;
  }

  async createCheckpoint(
    agentId: string,
    state: AgentState,
    graphSnapshot?: unknown
  ): Promise<string> {
    const checkpoint: Checkpoint = {
      id: crypto.randomUUID(),
      agentId,
      timestamp: Date.now(),
      state,
      graphSnapshot,
    };

    return this.save(checkpoint);
  }

  async delete(path: string): Promise<void> {
    await rm(path, { force: true });
  }

  async deleteAll(agentId: string): Promise<void> {
    const dir = `${this.storagePath}/${agentId}/checkpoints`;
    try {
      await rm(dir, { force: true, recursive: true });
    } catch {
    }
  }

  private async ensureDir(path: string): Promise<void> {
    try {
      await mkdir(path, { recursive: true });
    } catch {
    }
  }
}
