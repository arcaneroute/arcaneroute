#!/usr/bin/env bun
/*
 * arcane-route :: src/cli/CLIRouter.ts
 * CLI entry point — Commander.js command registration
 */

import { Command } from 'commander';
import { ArcaneApp } from '../core/ArcaneApp.ts';

const DEFAULT_MAX_TOKENS = '100000';
const DEFAULT_MAX_TURNS = '50';

const program = new Command();

program
  .name('arcane')
  .description(
    'Zero-drift AI coding. Every claim verified. Every file real.\n' +
      'Provider: set LLM_PROVIDER=anthropic|openai in .env',
  )
  .version('1.0.0');

// arcane chat
program
  .command('chat')
  .description('Start an interactive coding session with SWD verification')
  .option('-e, --effort <level>', 'Thinking effort: high (default), medium, low', 'high')
  .option(
    '--max-tokens <n>',
    `Max tokens per session (default: ${parseInt(DEFAULT_MAX_TOKENS, 10).toLocaleString()})`,
    DEFAULT_MAX_TOKENS,
  )
  .option(
    '--max-turns <n>',
    `Max turns per session (default: ${DEFAULT_MAX_TURNS})`,
    DEFAULT_MAX_TURNS,
  )
  .option('--dry-run', 'Preview all file operations without executing them')
  .option('--verbose', 'Show detailed SWD traces and hashes')
  .action(
    async (options: {
      effort?: string;
      maxTokens?: string;
      maxTurns?: string;
      dryRun?: boolean;
      verbose?: boolean;
    }) => {
      const app = new ArcaneApp();
      try {
        await app.runChat(options);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`\x1b[91m✖ ${msg}\x1b[0m`);
        process.exit(1);
      } finally {
        await app.shutdown();
      }
    },
  );

// arcane verify
program
  .command('verify')
  .description('Scan codebase vs ARCANE_MEMORY.md for drift detection')
  .option('--fix', 'Attempt auto-reconciliation of drifted files')
  .option('--json', 'Output results as machine-readable JSON')
  .option('--dry-run', 'Preview without writing to memory')
  .action(async (options: { fix?: boolean; json?: boolean; dryRun?: boolean }) => {
    const app = new ArcaneApp();
    try {
      await app.runVerify(options);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\x1b[91m✖ ${msg}\x1b[0m`);
      process.exit(1);
    } finally {
      await app.shutdown();
    }
  });

// arcane dream
program
  .command('dream')
  .description('Compress ARCANE_MEMORY.md using AI summarization')
  .option('-f, --force', 'Force compression even with few entries', false)
  .option('--dry-run', 'Preview compression without writing')
  .action(async (options: { force?: boolean; dryRun?: boolean }) => {
    const app = new ArcaneApp();
    try {
      await app.runDream(options);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\x1b[91m✖ ${msg}\x1b[0m`);
      process.exit(1);
    } finally {
      await app.shutdown();
    }
  });

// Default: show help
if (process.argv.length <= 2) {
  printBannerAndHelp();
} else {
  program.parse(process.argv);
}

function printBannerAndHelp(): void {
  console.log('');
  console.log('\x1b[35m\x1b[1m┌─────────────────────────────────────────────────────┐\x1b[0m');
  console.log(
    '\x1b[35m\x1b[1m│  🔮 ARCANE ROUTE  \x1b[0m\x1b[90mv1.0.0\x1b[35m\x1b[1m                            │\x1b[0m',
  );
  console.log(
    '\x1b[35m│  \x1b[0mZero-drift AI coding. Every claim verified.         \x1b[35m│\x1b[0m',
  );
  console.log(
    '\x1b[35m│  \x1b[0mSet \x1b[96mLLM_PROVIDER\x1b[0m=anthropic|openai in .env           \x1b[35m│\x1b[0m',
  );
  console.log('\x1b[35m\x1b[1m└─────────────────────────────────────────────────────┘\x1b[0m');
  console.log('');
  program.help();
}
