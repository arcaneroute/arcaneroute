## PROJECT IDENTITY

**Project Name:** `arcane-route`
**CLI Command:** `arcane`
**Tagline:** Zero-drift AI coding. Every claim verified. Every file real.
**NPM Package:** `arcane-route`
**Language:** TypeScript (strict mode)
**Runtime:** Bun 1.1+
**Package Manager:** Bun

---

## MISSION STATEMENT

Build `arcane-route` — a production-grade CLI tool that wraps the Anthropic Claude API with a **Strict Write Discipline (SWD)** verification layer. Every file operation claimed by the AI is verified against the real filesystem using SHA-256 snapshots. If the AI hallucinates a write, it gets a Correction Turn. Fail twice — yield to human.

This is a **full rewrite** inspired by `mythos-router`, but redesigned from scratch using **Object-Oriented Programming (OOP)** principles. No procedural spaghetti. Every system is a class with a clear responsibility.

---

## ARCHITECTURE REQUIREMENTS

### Directory Structure

```
arcane-route/
├── src/
│   ├── core/
│   │   ├── ArcaneApp.ts          # Root application class (bootstrapper)
│   │   ├── ConfigManager.ts      # Config, env validation, constants
│   │   └── EventBus.ts           # Internal pub/sub for decoupled events
│   ├── ai/
│   │   ├── ClaudeClient.ts       # Anthropic SDK wrapper class
│   │   ├── ConversationManager.ts # Manages multi-turn message history
│   │   └── ThinkingAdapter.ts    # Adaptive thinking effort controller
│   ├── filesystem/
│   │   ├── FilesystemSnapshot.ts # Pre/post snapshot engine (SHA-256)
│   │   ├── SWDEngine.ts          # Strict Write Discipline verifier
│   │   ├── DriftDetector.ts      # Detects drift between memory & real files
│   │   └── IgnoreParser.ts       # .arcaneignore rule parser
│   ├── memory/
│   │   ├── MemoryManager.ts      # ARCANE_MEMORY.md read/write manager
│   │   ├── MemoryCompressor.ts   # Compresses old entries via Claude
│   │   └── MemoryEntry.ts        # Data model for memory entries
│   ├── budget/
│   │   ├── BudgetLimiter.ts      # Token & turn budget enforcer
│   │   └── CostTracker.ts        # Real-time cost calculation
│   ├── cli/
│   │   ├── CLIRouter.ts          # Commander.js setup & command routing
│   │   ├── Renderer.ts           # Terminal output formatter (colors, badges)
│   │   └── Spinner.ts            # Loading indicator class
│   ├── commands/
│   │   ├── BaseCommand.ts        # Abstract base class for all commands
│   │   ├── ChatCommand.ts        # Interactive REPL session
│   │   ├── VerifyCommand.ts      # Codebase ↔ Memory drift scanner
│   │   └── DreamCommand.ts       # Memory compression command
│   └── types/
│       ├── index.ts              # All shared TypeScript interfaces & types
│       └── errors.ts             # Custom error classes
├── test/
│   ├── unit/
│   │   ├── SWDEngine.test.ts
│   │   ├── MemoryManager.test.ts
│   │   └── BudgetLimiter.test.ts
│   └── integration/
│       └── chat.test.ts
├── .arcaneignore                 # SWD scan exclusion patterns
├── ARCANE_MEMORY.md              # Auto-generated agentic memory log
├── AGENTS.md                     # Project conventions for AI agents
├── package.json
├── tsconfig.json
└── README.md
```

---

## CLASS-BY-CLASS SPECIFICATIONS

### `src/core/ArcaneApp.ts`
```typescript
// Root bootstrapper. Initializes all services and wires dependencies.
class ArcaneApp {
  private config: ConfigManager
  private eventBus: EventBus
  private cli: CLIRouter

  constructor()
  async bootstrap(): Promise<void>  // Init all services, validate env, register commands
  async shutdown(): Promise<void>   // Graceful cleanup
}
```

### `src/core/ConfigManager.ts`
```typescript
// Singleton. Reads env vars, sets defaults, validates on startup.
class ConfigManager {
  static getInstance(): ConfigManager
  get(key: string): string
  getApiKey(): string                    // Throws if ANTHROPIC_API_KEY missing
  getModel(): string                     // Default: 'claude-opus-4-6'
  getMaxTokens(): number
  getSystemPrompt(): string              // The SWD system prompt
  getIgnorePatterns(): string[]
}
```

### `src/core/EventBus.ts`
```typescript
// Internal event system for decoupled communication between services.
class EventBus extends EventEmitter {
  emit(event: ArcaneEvent, payload?: unknown): boolean
  on(event: ArcaneEvent, listener: Function): this
}

type ArcaneEvent = 
  | 'swd:verified'
  | 'swd:mismatch' 
  | 'swd:correction_needed'
  | 'swd:yield_to_human'
  | 'memory:entry_added'
  | 'memory:compressed'
  | 'budget:warning'
  | 'budget:exceeded'
  | 'chat:turn_complete'
```

### `src/ai/ClaudeClient.ts`
```typescript
// Wraps Anthropic SDK. Handles all API calls with retry logic.
class ClaudeClient {
  constructor(config: ConfigManager)
  
  async sendMessage(params: SendMessageParams): Promise<ClaudeResponse>
  async sendCorrectionTurn(params: CorrectionParams): Promise<ClaudeResponse>
  async sendLowEffortMessage(params: SendMessageParams): Promise<ClaudeResponse>
  
  private buildHeaders(): Record<string, string>
  private handleRateLimit(error: Error): Promise<void>
  private extractUsage(response: RawResponse): TokenUsage
}
```

### `src/ai/ConversationManager.ts`
```typescript
// Manages the full conversation history for multi-turn sessions.
class ConversationManager {
  private messages: Message[]
  
  addUserMessage(content: string): void
  addAssistantMessage(content: string): void
  addCorrectionTurn(context: string): void
  getHistory(): Message[]
  clear(): void                    // Clears messages but preserves memory
  getTokenEstimate(): number
  serialize(): string              // For MEMORY.md logging
}
```

### `src/ai/ThinkingAdapter.ts`
```typescript
// Controls Claude's extended thinking based on effort level.
class ThinkingAdapter {
  constructor(effort: EffortLevel)
  
  getThinkingConfig(): ThinkingConfig
  getBudgetTokens(): number
  
  static fromString(effort: string): ThinkingAdapter
}

type EffortLevel = 'high' | 'medium' | 'low'
```

### `src/filesystem/FilesystemSnapshot.ts`
```typescript
// Captures filesystem state as a SHA-256 hash map.
class FilesystemSnapshot {
  private hashes: Map<string, string>   // path → sha256
  private capturedAt: Date
  
  static capture(rootDir: string, ignorePatterns: string[]): Promise<FilesystemSnapshot>
  
  diff(other: FilesystemSnapshot): SnapshotDiff
  hasFile(path: string): boolean
  getHash(path: string): string | undefined
  toJSON(): Record<string, string>
}

interface SnapshotDiff {
  added: string[]
  modified: string[]
  deleted: string[]
  unchanged: string[]
}
```

### `src/filesystem/SWDEngine.ts`
```typescript
// The core of Arcane Route. Verifies AI claims against real filesystem state.
class SWDEngine {
  constructor(
    private snapshot: FilesystemSnapshot,
    private eventBus: EventBus
  )
  
  async preCapture(): Promise<void>
  async postCapture(): Promise<void>
  
  parseClaimedActions(modelResponse: string): FileAction[]
  verify(claimedActions: FileAction[]): VerificationResult
  
  private matchClaimToDiff(claim: FileAction, diff: SnapshotDiff): boolean
}

interface FileAction {
  type: 'CREATE' | 'MODIFY' | 'DELETE' | 'READ'
  path: string
  rawBlock: string
}

interface VerificationResult {
  allVerified: boolean
  verified: FileAction[]
  failed: FileAction[]
  unmatched: FileAction[]
}
```

### `src/filesystem/DriftDetector.ts`
```typescript
// Compares current filesystem state against ARCANE_MEMORY.md entries.
class DriftDetector {
  constructor(
    private memoryManager: MemoryManager,
    private ignoreParser: IgnoreParser
  )
  
  async scan(rootDir: string): Promise<DriftReport>
  
  private compareWithMemory(files: Map<string, string>): DriftReport
}

interface DriftReport {
  verified: string[]    // Files that match memory
  drifted: string[]     // Files changed since memory entry
  missing: string[]     // Files in memory but not on disk
  untracked: string[]   // Files on disk not in memory
}
```

### `src/memory/MemoryManager.ts`
```typescript
// ARCANE_MEMORY.md is the source of truth. This class owns it entirely.
class MemoryManager {
  constructor(private filePath: string)
  
  async load(): Promise<void>
  async addEntry(entry: MemoryEntry): Promise<void>
  async getEntries(): Promise<MemoryEntry[]>
  async getRecentEntries(count: number): Promise<MemoryEntry[]>
  async countEntries(): Promise<number>
  async replaceOldEntries(summary: string, keepRecent: number): Promise<void>
  async getStatus(): Promise<MemoryStatus>
  
  private serialize(entries: MemoryEntry[]): string
  private parse(content: string): MemoryEntry[]
}
```

### `src/budget/BudgetLimiter.ts`
```typescript
// Hard limits on token spend and turn count per session.
class BudgetLimiter {
  constructor(config: BudgetConfig)
  
  recordTurn(usage: TokenUsage): void
  checkBudget(): BudgetStatus
  isExceeded(): boolean
  getRemainingTokens(): number
  getRemainingTurns(): number
  getSummary(): BudgetSummary
  
  static fromOptions(options: Partial<BudgetConfig>): BudgetLimiter
}

interface BudgetConfig {
  maxTokens: number         // Default: 100_000
  maxTurns: number          // Default: 50
  warnAtPercent: number     // Default: 80
}
```

### `src/commands/BaseCommand.ts`
```typescript
// All commands extend this abstract class.
abstract class BaseCommand {
  constructor(
    protected config: ConfigManager,
    protected renderer: Renderer,
    protected eventBus: EventBus
  )
  
  abstract execute(options: Record<string, unknown>): Promise<void>
  
  protected handleError(error: Error): void
  protected confirm(message: string): Promise<boolean>
}
```

### `src/commands/ChatCommand.ts`
```typescript
// Interactive REPL. The main user-facing command.
class ChatCommand extends BaseCommand {
  constructor(
    config: ConfigManager,
    renderer: Renderer,
    eventBus: EventBus,
    private client: ClaudeClient,
    private swdEngine: SWDEngine,
    private memoryManager: MemoryManager,
    private budgetLimiter: BudgetLimiter,
    private conversationManager: ConversationManager
  )
  
  async execute(options: ChatOptions): Promise<void>
  
  private async runTurn(userInput: string): Promise<void>
  private async handleSWDVerification(response: ClaudeResponse): Promise<void>
  private async attemptCorrection(failed: FileAction[]): Promise<boolean>
  private handleSlashCommand(input: string): boolean
  private async promptUser(): Promise<string>
}

interface ChatOptions {
  effort: EffortLevel
  dryRun: boolean
  verbose: boolean
  maxTokens?: number
  maxTurns?: number
}
```

---

## SYSTEM PROMPT (SWD Protocol)

The system prompt injected into every Claude session must follow this exact format:

```
You are Arcane, a precise and disciplined AI coding assistant operating under the Strict Write Discipline (SWD) protocol.

CORE RULE: Every file operation you perform MUST be wrapped in a FILE_ACTION block.

FORMAT:
[FILE_ACTION]
type: CREATE | MODIFY | DELETE
path: relative/path/to/file
[/FILE_ACTION]

RULES:
1. Never claim to have written a file without a FILE_ACTION block.
2. Never hallucinate filesystem state. Only report what you actually did.
3. If you cannot complete a file operation, say so explicitly.
4. All paths must be relative to the working directory.
5. One FILE_ACTION block per file operation.

DISCIPLINE: Your claims will be verified against the real filesystem using SHA-256 hashes. Discrepancies will trigger a Correction Turn. You have 2 correction attempts before yielding to the human.
```

---

## CLI COMMANDS

### `arcane chat`
```
arcane chat                    # Default (high effort)
arcane chat --effort low       # Budget mode
arcane chat --effort medium    # Balanced
arcane chat --dry-run          # Preview mode, no actual writes
arcane chat --verbose          # Show thinking tokens, hashes, raw diffs
arcane chat --max-tokens 50000 # Override budget
arcane chat --max-turns 20     # Override turn limit
```

In-session slash commands:
- `/exit` — End session cleanly
- `/memory` — Show ARCANE_MEMORY.md status (entry count, size)
- `/clear` — Clear conversation history (memory persists)
- `/budget` — Show remaining token & turn budget
- `/verify` — Run inline drift detection during session
- `/help` — Show available slash commands

### `arcane verify`
```
arcane verify                  # Scan all files vs ARCANE_MEMORY.md
arcane verify --fix            # Attempt auto-reconciliation
arcane verify --json           # Machine-readable output
```

Output statuses:
- ✅ `VERIFIED` — File matches memory
- ⚠️ `DRIFTED` — File changed since last memory entry
- ❌ `MISSING` — Memory references non-existent file
- ➕ `UNTRACKED` — File exists but not in memory

### `arcane dream`
```
arcane dream                   # Auto-compress if >100 entries
arcane dream --force           # Force compression regardless of count
arcane dream --dry-run         # Preview what would be compressed
```

---

## OOP DESIGN PATTERNS TO ENFORCE

1. **Singleton** — `ConfigManager` (one config, one source of truth)
2. **Observer** — `EventBus` (decoupled event-driven communication)
3. **Strategy** — `ThinkingAdapter` (effort levels as interchangeable strategies)
4. **Template Method** — `BaseCommand` → `ChatCommand`, `VerifyCommand`, `DreamCommand`
5. **Factory** — `BudgetLimiter.fromOptions()`, `ThinkingAdapter.fromString()`
6. **Value Object** — `MemoryEntry`, `FileAction`, `SnapshotDiff` (immutable data models)
7. **Repository** — `MemoryManager` (abstracts ARCANE_MEMORY.md I/O)

---

## TYPESCRIPT REQUIREMENTS

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "types": ["bun-types"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

- **No `any` types** — use `unknown` and narrow with type guards
- **All classes must have explicit return types** on public methods
- **All async functions must handle errors** — no unhandled rejections
- **Interfaces over type aliases** for object shapes
- **Readonly** properties on value objects

---

## PACKAGE.JSON SPEC

```json
{
  "name": "arcane-route",
  "version": "1.0.0",
  "description": "Zero-drift AI coding. Every claim verified. Every file real.",
  "bin": {
    "arcane": "src/cli/CLIRouter.ts"
  },
  "scripts": {
    "dev": "bun run --watch src/cli/CLIRouter.ts",
    "start": "bun run src/cli/CLIRouter.ts",
    "build": "bun build src/cli/CLIRouter.ts --outdir dist --target bun --minify",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",
    "commander": "^12.0.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "bun-types": "latest"
  },
  "engines": {
    "bun": ">=1.1.0"
  }
}
```

---

## ERROR HANDLING

Define custom error classes in `src/types/errors.ts`:

```typescript
class ArcaneError extends Error {
  constructor(message: string, public readonly code: ArcaneErrorCode) {
    super(message)
    this.name = 'ArcaneError'
  }
}

class ApiKeyMissingError extends ArcaneError {}
class SWDVerificationError extends ArcaneError {}
class BudgetExceededError extends ArcaneError {}
class MemoryCorruptedError extends ArcaneError {}
class FilesystemPermissionError extends ArcaneError {}

type ArcaneErrorCode = 
  | 'API_KEY_MISSING'
  | 'SWD_VERIFICATION_FAILED'
  | 'BUDGET_EXCEEDED'
  | 'MEMORY_CORRUPTED'
  | 'FILESYSTEM_PERMISSION'
  | 'CLAUDE_API_ERROR'
  | 'INVALID_EFFORT_LEVEL'
```

---

## TERMINAL RENDERER SPEC

`src/cli/Renderer.ts` must produce rich terminal output:

```
┌─────────────────────────────────────────┐
│  🔮 ARCANE ROUTE  v1.0.0                │
│  Model: claude-opus-4-6 · Effort: HIGH  │
└─────────────────────────────────────────┘

[SWD] Pre-snapshot captured (47 files)
[SWD] Post-snapshot captured (48 files)

  ✅ CREATE  src/utils/helper.ts     verified
  ✅ MODIFY  src/index.ts            verified
  ⚠️  MODIFY  src/config.ts          MISMATCH → Correction Turn 1/2

[BUDGET] 2,847 tokens used · $0.043 · 3 turns remaining (47/50)
[MEMORY] 23 entries · 4.2kb
```

Color scheme:
- `#7C3AED` (violet) — brand color, headers
- `#10B981` (emerald) — verified / success
- `#F59E0B` (amber) — warnings / corrections
- `#EF4444` (red) — errors / failures
- `#6B7280` (gray) — metadata / secondary info

---

## ARCANE_MEMORY.md FORMAT

```markdown
# ARCANE MEMORY
> Auto-generated by arcane-route. Source of truth for all AI file operations.
> Do NOT edit manually.

---

## Session: 2026-04-23T10:30:00Z
**Effort:** high | **Turns:** 3 | **Tokens:** 2,847

### Actions
- [CREATE] `src/utils/helper.ts` · sha256: `a3f9...`
- [MODIFY] `src/index.ts` · sha256: `b7c2...`

### Summary
Implemented helper utilities and updated main entry point.

---

<!-- COMPRESSED BLOCK: entries 1-47 compressed on 2026-04-23 -->
> Prior sessions archived. 47 actions. Run `arcane verify` to check drift.
<!-- END COMPRESSED BLOCK -->
```

---

## .arcaneignore FORMAT

```
# Arcane Route ignore patterns (same syntax as .gitignore)
node_modules/
dist/
.git/
*.log
bun.lockb
ARCANE_MEMORY.md
coverage/
.env
.env.*
```

---

## AGENTS.md CONTENT

```markdown
# Arcane Route — Agent Conventions

## File Action Protocol
Always wrap file operations in FILE_ACTION blocks. No exceptions.

## Naming Conventions
- Classes: PascalCase
- Methods: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Files: PascalCase for classes, camelCase for utilities

## Architecture Rules
- One class per file
- No circular dependencies
- Services communicate via EventBus, not direct coupling
- All I/O is async

## Memory Protocol
- Log every file action to ARCANE_MEMORY.md
- Never delete memory entries manually
- Run `arcane dream` when entries exceed 100
```

---

## PRODUCTION CHECKLIST

Build the following before considering the project complete:

- [ ] All 7 core classes fully implemented with JSDoc
- [ ] SHA-256 snapshot engine working with `.arcaneignore` support — use `Bun.file()` and `Bun.CryptoHasher` for native SHA-256
- [ ] SWD verification catching hallucinated writes
- [ ] Correction turn loop (max 2 retries → yield)
- [ ] ARCANE_MEMORY.md auto-write on every verified turn — use `Bun.write()` for fast I/O
- [ ] `arcane dream` compresses memory via low-effort Claude
- [ ] `arcane verify` drift detection with 4 status types
- [ ] Budget limiter with warnings at 80% and hard stop at 100%
- [ ] Dry-run mode for all commands
- [ ] Unit tests using `bun test` (Bun's built-in test runner, no Jest needed)
- [ ] Full TypeScript strict mode, zero `any`
- [ ] README.md with installation, usage, architecture diagram
- [ ] `bunx arcane-route chat` works out of the box

---

## WHAT NOT TO BUILD

- ❌ No crypto/token features
- ❌ No web UI or dashboard
- ❌ No external database (ARCANE_MEMORY.md is the only persistence)
- ❌ No Docker or containerization (CLI tool only)
- ❌ No multi-agent orchestration (single AI session)
- ❌ No plugin system (keep it focused)

---

*Build it clean. Build it verifiable. Build it arcane.*