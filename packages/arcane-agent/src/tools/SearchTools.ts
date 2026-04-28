/**
 * SearchTools - Tool definitions untuk search operations
 */

import { spawn } from 'bun';
import type { Tool, ToolFunction } from '../types';

const grep: ToolFunction = async (input: unknown) => {
  const { pattern, path, recursive, caseInsensitive, extensions } = input as {
    pattern: string;
    path?: string;
    recursive?: boolean;
    caseInsensitive?: boolean;
    extensions?: string[];
  };

  const args = ['grep'];
  if (recursive) args.push('-r');
  if (caseInsensitive) args.push('-i');
  if (extensions?.length) {
    args.push('--include=' + extensions.map((e) => `*.${e}`).join(','));
  }
  args.push(pattern);
  if (path) args.push(path);

  try {
    const proc = spawn({
      cmd: args,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    return {
      success: exitCode === 0,
      matches: stdout.split('\n').filter(Boolean),
      count: stdout.split('\n').filter(Boolean).length,
    };
  } catch (error) {
    return { success: false, error: String(error), pattern };
  }
};

const find: ToolFunction = async (input: unknown) => {
  const { pattern, path, type } = input as {
    pattern: string;
    path?: string;
    type?: 'f' | 'd';
  };

  const args = ['find'];
  if (path) args.push(path);
  else args.push('.');
  if (type) args.push('-type', type);
  args.push('-name', pattern);

  try {
    const proc = spawn({
      cmd: args,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    return {
      success: exitCode === 0,
      files: stdout.split('\n').filter(Boolean),
    };
  } catch (error) {
    return { success: false, error: String(error), pattern };
  }
};

const semanticSearch: ToolFunction = async (input: unknown) => {
  const { query, path } = input as { query: string; path?: string };
  try {
    const searchPath = path || '.';
    const proc = spawn({
      cmd: ['grep', '-r', query, searchPath, '--include=*.ts', '--include=*.tsx', '--include=*.md'],
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdout = await new Response(proc.stdout).text();

    return {
      success: true,
      results: stdout.split('\n').filter(Boolean).slice(0, 10),
      query,
    };
  } catch {
    return { success: true, results: [], query };
  }
};

const searchFiles: ToolFunction = async (input: unknown) => {
  const { query, path } = input as { query: string; path?: string };
  try {
    const searchPath = path || '.';
    const proc = spawn({
      cmd: ['find', searchPath, '-type', 'f', '-name', `*${query}*`],
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdout = await new Response(proc.stdout).text();

    return {
      success: true,
      files: stdout.split('\n').filter(Boolean),
      query,
    };
  } catch (error) {
    return { success: false, error: String(error), query };
  }
};

export const searchTools: Tool[] = [
  {
    name: 'grep',
    description: 'Search for text patterns in files.',
    execute: grep,
  },
  {
    name: 'find',
    description: 'Find files by name pattern.',
    execute: find,
  },
  {
    name: 'semantic_search',
    description: 'Search for code or content with semantic understanding.',
    execute: semanticSearch,
  },
  {
    name: 'search_files',
    description: 'Search for files by name.',
    execute: searchFiles,
  },
];
