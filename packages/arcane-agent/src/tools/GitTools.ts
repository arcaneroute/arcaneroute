/**
 * GitTools - Tool definitions untuk Git operations
 */

import { spawn } from 'bun';
import type { Tool, ToolFunction } from '../types';

const runGit = async (
  args: string[],
  cwd?: string
): Promise<{ success: boolean; stdout: string; stderr: string; exitCode: number }> => {
  try {
    const proc = spawn({
      cmd: ['git', ...args],
      cwd: cwd || process.cwd(),
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    const exitCode = await proc.exited;
    return {
      success: exitCode === 0,
      stdout,
      stderr,
      exitCode,
    };
  } catch (error) {
    return {
      success: false,
      stdout: '',
      stderr: String(error),
      exitCode: 1,
    };
  }
};

const gitStatus: ToolFunction = async (input?: unknown) => {
  const cwd = (input as { cwd?: string })?.cwd;
  return runGit(['status', '--porcelain'], cwd);
};

const gitDiff: ToolFunction = async (input?: unknown) => {
  const { cwd, file } = (input as { cwd?: string; file?: string }) || {};
  const args = file ? ['diff', file] : ['diff', '--stat'];
  return runGit(args, cwd);
};

const gitLog: ToolFunction = async (input?: unknown) => {
  const { cwd, count = 10, format } = (input as { cwd?: string; count?: number; format?: string }) || {};
  const args = format
    ? ['log', `-${count}`, `--format=${format}`]
    : ['log', `-${count}`, '--oneline'];
  return runGit(args, cwd);
};

const gitAdd: ToolFunction = async (input: unknown) => {
  const { path = '.', cwd } = input as { path?: string; cwd?: string };
  return runGit(['add', path], cwd);
};

const gitCommit: ToolFunction = async (input: unknown) => {
  const { message, cwd } = input as { message: string; cwd?: string };
  return runGit(['commit', '-m', message], cwd);
};

const gitPush: ToolFunction = async (input?: unknown) => {
  const { cwd, remote, branch } = (input as { cwd?: string; remote?: string; branch?: string }) || {};
  const args = ['push'];
  if (remote) args.push(remote);
  if (branch) args.push(branch);
  return runGit(args, cwd);
};

const gitPull: ToolFunction = async (input?: unknown) => {
  const { cwd, remote, branch } = (input as { cwd?: string; remote?: string; branch?: string }) || {};
  const args = ['pull'];
  if (remote) args.push(remote);
  if (branch) args.push(branch);
  return runGit(args, cwd);
};

const gitBranch: ToolFunction = async (input?: unknown) => {
  const { cwd, list, create, shouldDelete, name } = (input as {
    cwd?: string;
    list?: boolean;
    create?: boolean;
    shouldDelete?: boolean;
    name?: string;
  }) || {};

  if (list) return runGit(['branch', '-a'], cwd);
  if (create && name) return runGit(['checkout', '-b', name], cwd);
  if (shouldDelete && name) return runGit(['branch', '-d', name], cwd);
  return runGit(['branch'], cwd);
};

const gitCheckout: ToolFunction = async (input: unknown) => {
  const { path, cwd, createBranch } = input as {
    path: string;
    cwd?: string;
    createBranch?: boolean;
  };
  const args = createBranch ? ['checkout', '-b', path] : ['checkout', path];
  return runGit(args, cwd);
};

export const gitTools: Tool[] = [
  {
    name: 'git_status',
    description: 'Get git repository status.',
    execute: gitStatus,
  },
  {
    name: 'git_diff',
    description: 'Get git diff output.',
    execute: gitDiff,
  },
  {
    name: 'git_log',
    description: 'Get recent git commits.',
    execute: gitLog,
  },
  {
    name: 'git_add',
    description: 'Stage files for commit.',
    execute: gitAdd,
  },
  {
    name: 'git_commit',
    description: 'Commit staged changes.',
    execute: gitCommit,
  },
  {
    name: 'git_push',
    description: 'Push commits to remote.',
    execute: gitPush,
  },
  {
    name: 'git_pull',
    description: 'Pull commits from remote.',
    execute: gitPull,
  },
  {
    name: 'git_branch',
    description: 'List, create, or delete branches.',
    execute: gitBranch,
  },
  {
    name: 'git_checkout',
    description: 'Switch branches or restore files.',
    execute: gitCheckout,
  },
];
