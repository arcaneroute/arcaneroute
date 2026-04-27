export interface BannerProps {
  version: string;
  provider: 'anthropic' | 'openai';
  model: string;
  effort: 'high' | 'medium' | 'low';
  swdActive: boolean;
}
