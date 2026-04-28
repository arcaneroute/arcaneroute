/*
 * @arcane-route/plugin-sdk
 * Helper utilities for plugin developers
 */

import type { ArcanePlugin, PluginContext } from './types.js';

/**
 * Type-safe wrapper for defining an ArcanePlugin.
 * Ensures the plugin object conforms to the ArcanePlugin interface.
 *
 * @example
 * ```typescript
 * import { definePlugin } from '@arcane-route/plugin-sdk';
 *
 * export default definePlugin({
 *   async onLoad(ctx) {
 *     ctx.logger.info('Plugin loaded!');
 *   },
 *   async onUnload(ctx) {
 *     ctx.logger.info('Plugin unloaded.');
 *   }
 * });
 * ```
 */
export function definePlugin(plugin: ArcanePlugin): ArcanePlugin {
  return plugin;
}

/**
 * Creates a logger with a custom prefix.
 * Useful for plugins that want to use multiple named loggers.
 *
 * @param prefix - The prefix to use for all log messages
 * @param logger - The underlying logger (defaults to console-style)
 *
 * @example
 * ```typescript
 * const logger = createLogger('my-feature');
 * logger.info('Starting operation'); // [my-feature] Starting operation
 * ```
 */
export function createLogger(
  prefix: string,
  logger?: Pick<PluginContext['logger'], 'info' | 'warn' | 'error' | 'debug'>,
): PluginContext['logger'] {
  const impl = logger ?? {
    info: (msg: string) => console.log(`[${prefix}] ${msg}`),
    warn: (msg: string) => console.warn(`[${prefix}] ${msg}`),
    error: (msg: string, err?: Error) => {
      console.error(`[${prefix}] ${msg}`);
      if (err?.stack) console.error(err.stack);
    },
    debug: (msg: string) => {
      if (process.env.DEBUG === 'true') console.log(`[${prefix}] ${msg}`);
    },
  };

  return {
    info: (msg: string) => impl.info(`[${prefix}] ${msg}`),
    warn: (msg: string) => impl.warn(`[${prefix}] ${msg}`),
    error: (msg: string, err?: Error) => impl.error(`[${prefix}] ${msg}`, err),
    debug: (msg: string) => impl.debug(`[${prefix}] ${msg}`),
  };
}

/**
 * Permission constants for use in plugin.manifest.json
 */
export const PERMISSIONS = {
  FS_READ: 'fs:read',
  FS_WRITE: 'fs:write',
  SHELL_EXEC: 'shell:exec',
  NETWORK_OUTBOUND: 'network:outbound',
  MEMORY_READ: 'memory:read',
  MEMORY_WRITE: 'memory:write',
  LLM_INVOKE: 'llm:invoke',
} as const;

/**
 * Common hooks that plugins can subscribe to
 */
export const HOOKS = {
  SWD_VERIFIED: 'swd:verified',
  SWD_MISMATCH: 'swd:mismatch',
  SWD_CORRECTION_NEEDED: 'swd:correction_needed',
  SWD_YIELD_TO_HUMAN: 'swd:yield_to_human',
  MEMORY_ENTRY_ADDED: 'memory:entry_added',
  MEMORY_COMPRESSED: 'memory:compressed',
  BUDGET_WARNING: 'budget:warning',
  BUDGET_EXCEEDED: 'budget:exceeded',
  CHAT_TURN_COMPLETE: 'chat:turn_complete',
} as const;

/**
 * Default config schema builder helper
 *
 * @example
 * ```typescript
 * const configSchema = defineConfig({
 *   format: { type: 'string', enum: ['conventional', 'simple'], default: 'conventional' },
 *   verbose: { type: 'boolean', default: false }
 * });
 * ```
 */
export function defineConfig(
  properties: Record<string, { type: string; enum?: string[]; default?: unknown; description?: string }>,
): { schema: { type: 'object'; properties: typeof properties } } {
  return {
    schema: {
      type: 'object',
      properties,
    },
  };
}