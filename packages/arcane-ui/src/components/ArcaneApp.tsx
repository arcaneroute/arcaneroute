import React, { useEffect } from 'react';
import { Box } from 'ink';
import { ArcaneUIProvider, useArcanUIContext } from '../context';
import { Banner } from './Banner';
import { Layout } from './Layout';
import { StatusBar } from './StatusBar';
import type { ArcaneAppProps } from './ArcaneAppProps';

function ArcaneAppInner({ config }: { config: ArcaneAppProps['config'] }) {
  const { mode } = useArcanUIContext();

  // Get config values
  const provider = config.getProvider();
  const model = provider === 'anthropic' ? config.getAnthropicModel() : config.getOpenAIModel();
  const effort = (config.get('DEFAULT_EFFORT', 'high') || 'high') as 'high' | 'medium' | 'low';

  useEffect(() => {
    // Future: setup EventBus subscriptions here
  }, []);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Banner
        version="0.1.0"
        provider={provider}
        model={model}
        effort={effort}
        swdActive={true}
      />
      <Box flexGrow={1} flexDirection="column">
        <Layout />
      </Box>
      <StatusBar />
    </Box>
  );
}

export function ArcaneApp(props: ArcaneAppProps) {
  return (
    <ArcaneUIProvider>
      <ArcaneAppInner config={props.config} />
    </ArcaneUIProvider>
  );
}
