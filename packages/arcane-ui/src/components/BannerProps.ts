export interface BannerProps {
  version: string;
  provider: 'anthropic' | 'openai';
  model: string;
  effort: 'high' | 'medium' | 'low';
  swdActive: boolean;
  status?: AppStatus;
}

export type AppStatus = 'idle' | 'running' | 'streaming' | 'verifying' | 'writing' | 'complete' | 'error';
