import React, { useEffect, useState } from 'react';
import { Text } from 'ink';

export function StreamingIndicator() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return <Text dimColor>AI is typing{dots}</Text>;
}
