import React from 'react';
import { Box } from 'ink';
import { ChatPanel } from '../ChatPanel/ChatPanel';
import { Sidebar } from '../Sidebar/Sidebar';
import { useArcanUIContext } from '../../context';

export function Layout() {
  const { messages, streamingText, isStreaming, budget, memory, swd } = useArcanUIContext();

  return (
    <Box flexGrow={1} paddingTop={1}>
      {/* Main chat area - takes remaining space */}
      <Box flexDirection="column" flexGrow={1} marginRight={1}>
        <ChatPanel
          messages={messages}
          streamingText={streamingText}
          isStreaming={isStreaming}
          onSendMessage={() => {}}
          onCancelStreaming={() => {}}
          commandHistory={[]}
        />
      </Box>
      {/* Sidebar - fixed width */}
      <Sidebar budget={budget} memory={memory} swd={swd} />
    </Box>
  );
}
