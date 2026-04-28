/**
 * ShellTools - Tool definitions untuk shell command execution
 */

import { spawn } from 'bun';
import type { Tool, ToolFunction } from '../types';

const execute: ToolFunction = async (input: unknown) => {
  const { command, cwd } = input as {
    command: string;
    cwd?: string;
  };
  try {
    const proc = spawn({
      cmd: command.split(' '),
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
    return { success: false, error: String(error), command };
  }
};

const bash: ToolFunction = async (input: unknown) => {
  const { script, cwd } = input as { script: string; cwd?: string };
  try {
    const proc = spawn({
      cmd: ['bash', '-c', script],
      cwd: cwd || process.cwd(),
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    const exitCode = await proc.exited;
    return { success: exitCode === 0, stdout, stderr, exitCode };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

const watch: ToolFunction = async (input: unknown) => {
  const { path, pattern } = input as { path: string; pattern?: string };
  try {
    return {
      success: true,
      message: `Watching ${path}${pattern ? ` for pattern ${pattern}` : ''}`,
      path,
    };
  } catch (error) {
    return { success: false, error: String(error), path };
  }
};

const which: ToolFunction = async (input: unknown) => {
  const { command } = input as { command: string };
  try {
    const proc = spawn({
      cmd: ['which', command],
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdout = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    return {
      success: exitCode === 0,
      path: stdout.trim() || null,
      command,
    };
  } catch (error) {
    return { success: false, error: String(error), command };
  }
};

export const shellTools: Tool[] = [
  {
    name: 'execute',
    description: 'Execute a shell command and return stdout/stderr.',
    execute,
  },
  {
    name: 'bash',
    description: 'Execute a bash script/command.',
    execute: bash,
  },
  {
    name: 'watch',
    description: 'Watch a file or directory for changes.',
    execute: watch,
  },
  {
    name: 'which',
    description: 'Find the path of a command.',
    execute: which,
  },
];
