/**
 * PromptManager - Centralized prompt loading dan rendering
 * Prompts disimpan sebagai .md files untuk easy editing
 */

export interface PromptConfig {
  promptsDir: string;
  defaultLocale?: string;
  cachePrompts?: boolean;
}

export class PromptManager {
  private prompts: Map<string, string> = new Map();
  private config: Required<PromptConfig>;

  constructor(config: PromptConfig) {
    this.config = {
      cachePrompts: true,
      defaultLocale: 'en',
      ...config,
    };
  }

  async load(promptName: string): Promise<string> {
    if (this.config.cachePrompts && this.prompts.has(promptName)) {
      return this.prompts.get(promptName)!;
    }

    const filePath = this.resolvePath(promptName);
    let content: string;

    try {
      content = await Bun.file(filePath).text();
    } catch {
      throw new Error(`Prompt file not found: ${filePath}`);
    }

    if (this.config.cachePrompts) {
      this.prompts.set(promptName, content);
    }

    return content;
  }

  async render(
    promptName: string,
    variables: Record<string, string> = {}
  ): Promise<string> {
    let content = await this.load(promptName);

    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return content;
  }

  private resolvePath(promptName: string): string {
    const fileName = `${promptName}.md`;
    return `${this.config.promptsDir}/${fileName}`;
  }

  async reload(promptName: string): Promise<void> {
    this.prompts.delete(promptName);
    await this.load(promptName);
  }

  async reloadAll(): Promise<void> {
    this.prompts.clear();
  }

  getCacheSize(): number {
    return this.prompts.size;
  }

  clearCache(): void {
    this.prompts.clear();
  }
}
