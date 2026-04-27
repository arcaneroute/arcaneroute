import React from 'react';
import { Box } from 'ink';
import { ChatPanel } from '../ChatPanel/ChatPanel';
import { Sidebar } from '../Sidebar/Sidebar';
import { useArcanUIContext } from '../../context';

export function Layout() {
  const { messages, streamingText, isStreaming, budget, memory, swd } = useArcanUIContext();

  return (
    <Box flexDirection="row" flexGrow={1}>
      <ChatPanel
        messages={messages}
        streamingText={streamingText}
        isStreaming={isStreaming}
        onSendMessage={() => {}}
        onCancelStreaming={() => {}}
        commandHistory={[]}
      />
      <Sidebar budget={budget} memory={memory} swd={swd} />
    </Box>
  );
}
