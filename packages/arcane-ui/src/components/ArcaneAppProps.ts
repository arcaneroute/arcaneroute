export type ArcaneAppMode = 'chat' | 'verify' | 'dream';

export interface ArcaneAppProps {
  mode: ArcaneAppMode;
  config: {
    get: (key: string, defaultValue?: string) => string;
    getProvider: () => 'anthropic' | 'openai';
    getAnthropicModel: () => string;
    getOpenAIModel: () => string;
  };
}
