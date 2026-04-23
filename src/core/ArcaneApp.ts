/*
 * arcane-route :: src/core/ArcaneApp.ts
 * Root bootstrapper — wires all services and registers commands
 */

import { ConversationManager } from '../ai/ConversationManager.ts';
import { LLMClientFactory } from '../ai/LLMClientFactory.ts';
import { ThinkingAdapter } from '../ai/ThinkingAdapter.ts';
import { BudgetLimiter } from '../budget/BudgetLimiter.ts';
import { Renderer } from '../cli/Renderer.ts';
import { ChatCommand } from '../commands/ChatCommand.ts';
import { DreamCommand } from '../commands/DreamCommand.ts';
import { VerifyCommand } from '../commands/VerifyCommand.ts';
import { DriftDetector } from '../filesystem/DriftDetector.ts';
import { IgnoreParser } from '../filesystem/IgnoreParser.ts';
import { SWDEngine } from '../filesystem/SWDEngine.ts';
import { MemoryCompressor } from '../memory/MemoryCompressor.ts';
import { MemoryManager } from '../memory/MemoryManager.ts';
import type { ChatOptions, DreamOptions, VerifyOptions } from '../types/index.ts';
import { ConfigManager } from './ConfigManager.ts';
import { EventBus } from './EventBus.ts';

/**
 * Root application bootstrapper.
 * Instantiates ConfigManager and EventBus, then wires all service dependencies
 * before delegating to the appropriate command (chat / verify / dream).
 * Called exclusively by CLIRouter.
 */
export class ArcaneApp {
  private readonly config: ConfigManager;
  private readonly eventBus: EventBus;
  private readonly renderer: Renderer;

  constructor() {
    this.config = ConfigManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.renderer = new Renderer();
  }

  /**
   * Parse raw CLI options, build all chat dependencies, and run `ChatCommand`.
   * Validates provider API key before any I/O occurs.
   */
  public async runChat(rawOptions: {
    effort?: string;
    dryRun?: boolean;
    verbose?: boolean;
    maxTokens?: string;
    maxTurns?: string;
  }): Promise<void> {
    // Validate provider API key
    this.config.validate();

    const adapter = ThinkingAdapter.fromString(rawOptions.effort ?? 'high');
    const parsedMaxTokens = rawOptions.maxTokens ? parseInt(rawOptions.maxTokens, 10) : undefined;
    const parsedMaxTurns = rawOptions.maxTurns ? parseInt(rawOptions.maxTurns, 10) : undefined;

    const options: ChatOptions = {
      effort: adapter.getEffort(),
      dryRun: rawOptions.dryRun ?? false,
      verbose: rawOptions.verbose ?? false,
      ...(parsedMaxTokens !== undefined ? { maxTokens: parsedMaxTokens } : {}),
      ...(parsedMaxTurns !== undefined ? { maxTurns: parsedMaxTurns } : {}),
    };

    const { client, swdEngine, memoryManager, budgetLimiter, conversationManager } =
      this.buildChatDeps(options);

    const command = new ChatCommand(
      this.config,
      this.renderer,
      this.eventBus,
      client,
      swdEngine,
      memoryManager,
      budgetLimiter,
      conversationManager,
    );

    await command.execute(options as unknown as Record<string, unknown>);
  }

  /**
   * Build all verify dependencies and run `VerifyCommand`.
   * Does NOT require an API key — the drift scan is purely local.
   */
  public async runVerify(rawOptions: {
    fix?: boolean;
    json?: boolean;
    dryRun?: boolean;
  }): Promise<void> {
    const options: VerifyOptions = {
      fix: rawOptions.fix ?? false,
      json: rawOptions.json ?? false,
      dryRun: rawOptions.dryRun ?? false,
    };

    const rootDir = process.cwd();
    const ignoreParser = new IgnoreParser(this.config);
    ignoreParser.load(rootDir);

    const memoryManager = new MemoryManager(this.config);
    await memoryManager.load();

    const driftDetector = new DriftDetector(memoryManager, ignoreParser, rootDir);

    const command = new VerifyCommand(this.config, this.renderer, this.eventBus, driftDetector);

    await command.execute(options as unknown as Record<string, unknown>);
  }

  /**
   * Validate provider key, then run `DreamCommand` to compress memory via LLM.
   */
  public async runDream(rawOptions: { force?: boolean; dryRun?: boolean }): Promise<void> {
    const options: DreamOptions = {
      force: rawOptions.force ?? false,
      dryRun: rawOptions.dryRun ?? false,
    };

    this.config.validate();

    const llmClient = LLMClientFactory.create(this.config);
    const memoryManager = new MemoryManager(this.config);
    await memoryManager.load();

    const compressor = new MemoryCompressor(llmClient, memoryManager);

    const command = new DreamCommand(
      this.config,
      this.renderer,
      this.eventBus,
      memoryManager,
      compressor,
    );

    await command.execute(options as unknown as Record<string, unknown>);
  }

  /**
   * Graceful shutdown — removes all EventBus listeners.
   * Always call this in the CLI action's `finally` block.
   */
  public async shutdown(): Promise<void> {
    this.eventBus.removeAllArcaneListeners();
  }

  // Dependency Wiring

  /**
   * Instantiate and wire all services required by ChatCommand.
   * Kept separate from runChat() to keep the public API clean and testable.
   */
  private buildChatDeps(options: ChatOptions) {
    const rootDir = process.cwd();

    const client = LLMClientFactory.create(this.config);
    const conversationManager = new ConversationManager();

    const ignoreParser = new IgnoreParser(this.config);
    ignoreParser.load(rootDir);

    const swdEngine = new SWDEngine(rootDir, ignoreParser, this.eventBus);

    const memoryManager = new MemoryManager(this.config);

    const budgetLimiter = BudgetLimiter.fromOptions(this.config, this.eventBus, {
      ...(options.maxTokens !== undefined ? { maxTokens: options.maxTokens } : {}),
      ...(options.maxTurns !== undefined ? { maxTurns: options.maxTurns } : {}),
    });

    return { client, conversationManager, swdEngine, memoryManager, budgetLimiter };
  }
}
