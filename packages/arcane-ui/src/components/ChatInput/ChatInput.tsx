import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';
import type { ChatInputProps } from './ChatInputProps';

export function ChatInput({ onSend, onCancel, commandHistory = [], disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useInput((char, key) => {
    if (disabled) return;

    if (key.return && !key.shift) {
      if (input.trim()) {
        onSend(input);
        setInput('');
        setHistoryIndex(-1);
      }
    } else if (key.return && key.shift) {
      setInput((prev) => prev + '\n');
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
    } else if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
    } else if (char && char.length === 1 && !key.ctrl && !key.meta) {
      setInput((prev) => prev + char);
    }
  });

  const borderColor = disabled ? 'gray' : 'cyan';
  const borderStyle = disabled ? 'round' : 'bold';

  return (
    <Box
      flexDirection="column"
      borderStyle={borderStyle}
      borderColor={borderColor}
      padding={1}
      marginTop={1}
    >
      {/* Focus indicator */}
      <Box alignItems="center" gap={1} marginBottom={1}>
        <Text dimColor>[</Text>
        <Text bold color={disabled ? 'gray' : 'cyan'}>CHAT INPUT</Text>
        <Text dimColor>|</Text>
        <Text color={disabled ? 'gray' : 'green'}>●</Text>
        <Text dimColor>]</Text>
      </Box>

      {/* Input line */}
      <Box alignItems="center" gap={1}>
        <Text bold color="cyan">{'>'}</Text>
        <Text color="white">{input}</Text>
        {cursorVisible && <Text color="cyan" bold>_</Text>}
        <Text dimColor>[Enter]</Text>
      </Box>

      {/* Status line */}
      {disabled ? (
        <Box marginTop={1} alignItems="center" gap={1}>
          <Text color="yellow" dimColor>●</Text>
          <Text dimColor italic>Processing...</Text>
        </Box>
      ) : (
        <Box marginTop={1} alignItems="center" gap={2}>
          <Text dimColor>↑↓ history</Text>
          <Text dimColor>|</Text>
          <Text dimColor>Shift+Enter newline</Text>
          <Text dimColor>|</Text>
          <Text dimColor>Ctrl+C cancel</Text>
        </Box>
      )}
    </Box>
  );
}
