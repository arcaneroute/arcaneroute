/**
 * ChatAgent - Domain agent untuk conversational interactions
 * Handle: Q&A, explanations, context-aware responses
 */

import type { AgentDefinition, AgentState, Message } from '../types';

export const ChatAgent: AgentDefinition = {
  name: 'ChatAgent',
  description: 'Handles conversational interactions, Q&A, and explanations',
  events: ['chat.started', 'chat.responded', 'chat.ended'],
  tools: [
    {
      name: 'search_context',
      description: 'Search for relevant context in codebase',
      execute: async (input: unknown) => {
        const { query } = input as { query: string };
        try {
          const { execSync } = await import('child_process');
          const result = execSync(`grep -r "${query}" . --include="*.ts" --include="*.md" | head -20`, {
            encoding: 'utf-8',
          });
          return {
            success: true,
            results: result.split('\n').filter(Boolean).slice(0, 10),
            query,
          };
        } catch {
          return { success: false, results: [], query };
        }
      },
    },
    {
      name: 'explain_code',
      description: 'Explain code or concept',
      execute: async (input: unknown) => {
        const { code, concept } = input as { code?: string; concept?: string };
        return {
          success: true,
          explanation: concept
            ? `Explanation of ${concept}: This is a placeholder explanation.`
            : `Code explanation: ${code?.slice(0, 100) || 'No code provided'}...`,
        };
      },
    },
  ],
  node: async (state: AgentState): Promise<AgentState> => {
    const task = state.task.toLowerCase();

    if (
      task.includes('what') ||
      task.includes('how') ||
      task.includes('why') ||
      task.includes('explain')
    ) {
      state.results['action'] = 'explain';
    } else if (task.includes('find') || task.includes('search') || task.includes('look for')) {
      state.results['action'] = 'search';
    } else if (task.includes('help') || task.includes('assist')) {
      state.results['action'] = 'assist';
    } else {
      state.results['action'] = 'respond';
    }

    state.currentAgent = 'ChatAgent';

    const responseMessage: Message = {
      role: 'assistant',
      content: `ChatAgent processed: "${state.task}"`,
    };
    state.messages.push(responseMessage);

    return state;
  },
};
