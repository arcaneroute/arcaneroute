# Arcane Route — Agent Conventions

## File Action Protocol
Always wrap file operations in FILE_ACTION blocks. No exceptions.

```
[FILE_ACTION]
type: CREATE | MODIFY | DELETE
path: relative/path/to/file
[/FILE_ACTION]
```

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

## Provider Rules
- Always check `LLM_PROVIDER` env before making API calls
- Use `LLMClientFactory.create()` — never instantiate providers directly
- Extended thinking is Anthropic-only; degrade gracefully for OpenAI
