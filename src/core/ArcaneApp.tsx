/*
 * arcane-route :: src/core/ArcaneApp.ts
 * Root bootstrapper — wires all services and registers commands
 */

import { ConversationManager } from '../ai/ConversationManager.ts';
import { ArcaneAgentProvider } from '../ai/providers/ArcaneAgentProvider.ts';
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
import { PluginLoader } from '../plugins/PluginLoader.ts';
import { PluginRegistry } from '../plugins/PluginRegistry.ts';
import type { ChatOptions, DreamOptions, VerifyOptions } from '../types/index.ts';
import { ConfigManager } from './ConfigManager.ts';
import { EventBus } from './EventBus.ts';
import { EventEmitter } from 'node:events';
import * as readline from 'node:readline';

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
  private readonly pluginLoader: PluginLoader;

  constructor() {
    this.config = ConfigManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.renderer = new Renderer();
    const registry = PluginRegistry.getInstance();
    this.pluginLoader = new PluginLoader(registry, this.eventBus);
  }

  /**
   * Check if TUI mode is enabled via environment variable.
   */
  private isTUIMode(): boolean {
    return process.env.TUI_ENABLED === 'true';
  }

  /**
   * Prompt user for TUI confirmation since it's experimental.
   * Returns true if user wants to try TUI, false to fallback to CLI.
   */
  private async confirmTUI(): Promise<boolean> {
    return new Promise((resolve) => {
      let answered = false;

      console.log('\n\x1b[33m⚠️  OpenTUI is experimental and may have bugs.\x1b[0m\n');
      console.log('Do you want to try OpenTUI? (y/N): ');

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.on('line', (answer: string) => {
        if (answered) return;
        answered = true;
        rl.close();
        const response = answer.trim().toLowerCase();
        resolve(response === 'y' || response === 'yes');
      });

      rl.on('close', () => {
        if (answered) return;
        answered = true;
        resolve(false);
      });
    });
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

    // Check TUI mode
    if (this.isTUIMode()) {
      await this.runChatTUI(rawOptions);
    } else {
      await this.runChatANSI(rawOptions);
    }
  }

  /**
   * Run chat in TUI mode using arcane-ui (OpenTUI).
   */
  private async runChatTUI(rawOptions: {
    effort?: string;
    dryRun?: boolean;
    verbose?: boolean;
    maxTokens?: string;
    maxTurns?: string;
  }): Promise<void> {
    if (!process.stdin.isTTY) {
      console.warn("TUI requires a TTY environment. Falling back to ANSI mode.");
      return this.runChatANSI(rawOptions);
    }

    // Ask for confirmation since TUI is experimental
    const confirmed = await this.confirmTUI();
    if (!confirmed) {
      console.log("Falling back to ANSI mode.\n");
      return this.runChatANSI(rawOptions);
    }

    const effort = (rawOptions.effort ?? 'high') as 'high' | 'medium' | 'low';
    const parsedMaxTokens = rawOptions.maxTokens ? parseInt(rawOptions.maxTokens, 10) : undefined;
    const parsedMaxTurns = rawOptions.maxTurns ? parseInt(rawOptions.maxTurns, 10) : undefined;

    const options: ChatOptions = {
      effort,
      dryRun: rawOptions.dryRun ?? false,
      verbose: rawOptions.verbose ?? false,
      ...(parsedMaxTokens !== undefined ? { maxTokens: parsedMaxTokens } : {}),
      ...(parsedMaxTurns !== undefined ? { maxTurns: parsedMaxTurns } : {}),
    };

    // Build deps but don't run ChatCommand yet - TUI takes over
    const { client, swdEngine, memoryManager, budgetLimiter, conversationManager } =
      await this.buildChatDeps(options);

    // Wire up plugin dependencies before loading plugins
    this.pluginLoader.setBudgetLimiter({
      recordUsage: (tokens) => budgetLimiter.recordTurn(tokens),
    });
    this.pluginLoader.setLLMClient({
      send: (prompt, system) =>
        client
          .sendMessage({
            messages: [{ role: 'user' as const, content: prompt }],
            effort: 'medium',
            ...(system ? { systemPrompt: system } : {}),
          })
          .then((res) => ({ text: res.text, tokens: res.usage })),
    });

    // Load all enabled plugins
    await this.pluginLoader.loadAll();

    // Import OpenTUI-based arcane-ui
    const { createArcaneRenderer, ArcaneApp, AppEventsProvider } = await import('arcane-ui');
    const { render } = await import('@opentui/solid');

    const { renderer, events } = await createArcaneRenderer({
      screenMode: "main-screen",
      consoleMode: "disabled",
    });

    // Wire app state to UI events
    // Use underlying EventEmitter to bypass strict ArcaneEvent typing for UI-specific events
    const bus = this.eventBus as EventEmitter;
    bus.on('app:status', ({ status }: { status: string }) => {
      events.emit('app:status', { status });
    });

    bus.on('app:budget', ({ budget }: { budget: any }) => {
      events.emit('app:budget', { budget });
    });

    bus.on('app:memory', ({ memory }: { memory: any }) => {
      events.emit('app:memory', { memory });
    });

    bus.on('app:swd', ({ swd }: { swd: any }) => {
      events.emit('app:swd', { swd });
    });

    bus.on('app:message', ({ message }: { message: any }) => {
      events.emit('app:message', { message });
    });

    bus.on('app:stream', ({ chunk }: { chunk: string }) => {
      events.emit('app:stream', { chunk });
    });

    bus.on('app:stream-end', () => {
      events.emit('app:stream-end', undefined);
    });

    // Handle user input from TUI
    events.on('user:send', ({ text }: { text: string }) => {
      bus.emit('user:message', { text });
    });

    events.on('user:cancel', () => {
      bus.emit('user:cancel', undefined);
    });

    // Process user messages in TUI mode
    bus.on('user:message', async ({ text }: { text: string }) => {
      const input = text.trim();
      if (!input) return;

      // Emit status to UI
      bus.emit('app:status', { status: 'running' });

      try {
        // Add user message to history
        conversationManager.addUserMessage(input);

        // Emit message to UI
        bus.emit('app:message', {
          message: { role: 'user', text: input, timestamp: new Date() },
        });

        // Check budget
        if (budgetLimiter.isExceeded()) {
          bus.emit('app:status', { status: 'error' });
          return;
        }

        // Call LLM with streaming
        bus.emit('app:status', { status: 'streaming' });

        let fullResponse = '';
        const response = await client.sendMessage({
          messages: [...conversationManager.getHistory()],
          effort: options.effort,
          systemPrompt: this.config.getSystemPrompt(),
          onThinkingDelta: () => {},
          onTextDelta: (delta) => {
            fullResponse += delta;
            bus.emit('app:stream', { chunk: delta });
          },
        });

        bus.emit('app:stream-end', undefined);

        // Add assistant response to history
        conversationManager.addAssistantMessage(response.text);
        budgetLimiter.recordTurn(response.usage);

        // Emit message to UI
        bus.emit('app:message', {
          message: { role: 'assistant', text: response.text, timestamp: new Date() },
        });

        // Emit budget status
        bus.emit('app:budget', { budget: budgetLimiter.getSummary() });

        bus.emit('app:status', { status: 'complete' });
      } catch (err) {
        console.error('[TUI] LLM error:', err);
        bus.emit('app:status', { status: 'error' });
      }
    });

    try {
      // Render the TUI app using Solid render
      await render(
        () => (
          <AppEventsProvider events={events}>
            <ArcaneApp
              onSend={(text: string) => bus.emit('user:message', { text })}
              onCancel={() => bus.emit('user:cancel', undefined)}
              commandHistory={[]}
            />
          </AppEventsProvider>
        ),
        renderer
      );
    } catch (error) {
      console.error('TUI Error:', error);
      if (error instanceof Error) {
        console.error('Stack trace:');
        console.error(error.stack);
      }
      renderer.destroy();
      return this.runChatANSI(rawOptions);
    }
  }

  /**
   * Run chat in ANSI mode (existing implementation).
   */
  private async runChatANSI(rawOptions: {
    effort?: string;
    dryRun?: boolean;
    verbose?: boolean;
    maxTokens?: string;
    maxTurns?: string;
  }): Promise<void> {
    const effort = (rawOptions.effort ?? 'high') as 'high' | 'medium' | 'low';
    const parsedMaxTokens = rawOptions.maxTokens ? parseInt(rawOptions.maxTokens, 10) : undefined;
    const parsedMaxTurns = rawOptions.maxTurns ? parseInt(rawOptions.maxTurns, 10) : undefined;

    const options: ChatOptions = {
      effort,
      dryRun: rawOptions.dryRun ?? false,
      verbose: rawOptions.verbose ?? false,
      ...(parsedMaxTokens !== undefined ? { maxTokens: parsedMaxTokens } : {}),
      ...(parsedMaxTurns !== undefined ? { maxTurns: parsedMaxTurns } : {}),
    };

    const { client, swdEngine, memoryManager, budgetLimiter, conversationManager } =
      await this.buildChatDeps(options);

    // Wire up plugin dependencies before loading plugins
    this.pluginLoader.setBudgetLimiter({
      recordUsage: (tokens) => budgetLimiter.recordTurn(tokens),
    });
    this.pluginLoader.setLLMClient({
      send: (prompt, system) =>
        client
          .sendMessage({
            messages: [{ role: 'user' as const, content: prompt }],
            effort: 'medium',
            ...(system ? { systemPrompt: system } : {}),
          })
          .then((res) => ({ text: res.text, tokens: res.usage })),
    });

    // Load all enabled plugins
    await this.pluginLoader.loadAll();

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

    const llmClient = await ArcaneAgentProvider.create(this.config);
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
   * Graceful shutdown — removes all EventBus listeners and unloads plugins.
   * Always call this in the CLI action's `finally` block.
   */
  public async shutdown(): Promise<void> {
    await this.pluginLoader.unloadAll();
    this.eventBus.removeAllArcaneListeners();
  }

  // Dependency Wiring

  /**
   * Instantiate and wire all services required by ChatCommand.
   * Kept separate from runChat() to keep the public API clean and testable.
   */
  private async buildChatDeps(options: ChatOptions) {
    const rootDir = process.cwd();

    const client = await ArcaneAgentProvider.create(this.config);
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
