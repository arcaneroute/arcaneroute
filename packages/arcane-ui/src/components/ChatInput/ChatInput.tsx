import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ChatInputProps } from './ChatInputProps';

export function ChatInput({ onSend, onCancel, commandHistory = [], disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);

  useInput((char, key) => {
    if (disabled) return;

    if (key.return && !key.shift) {
      if (input.trim()) {
        onSend(input);
        setInput('');
        setHistoryIndex(-1);
      }
    } else if (key.upArrow) {
      setHistoryIndex((prev) => {
        const newIndex = Math.min(prev + 1, commandHistory.length - 1);
        if (newIndex >= 0 && commandHistory[commandHistory.length - 1 - newIndex]) {
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        return newIndex;
      });
    } else if (key.downArrow) {
      setHistoryIndex((prev) => {
        const newIndex = prev - 1;
        if (newIndex < 0) {
          setInput('');
          return -1;
        }
        if (commandHistory[commandHistory.length - 1 - newIndex]) {
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
        return newIndex;
      });
    } else if (key.ctrl && char === 'c') {
      onCancel();
    } else if (key.escape) {
      setInput('');
      setHistoryIndex(-1);
    }
  });

  return (
    <Box borderStyle="round" padding={1} flexDirection="column">
      <Box>
        <Text bold color="cyan">
          {'> '}
        </Text>
        <Text>{input}</Text>
        <Text dimColor> [Enter to send, Shift+Enter for newline]</Text>
      </Box>
    </Box>
  );
}
