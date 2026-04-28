/**
 * FileTools - Tool definitions untuk filesystem operations
 */

import { Glob } from 'bun';
import type { Tool, ToolFunction } from '../types';

const readFile: ToolFunction = async (input: unknown) => {
  const { path, start, end } = input as { path: string; start?: number; end?: number };
  try {
    const content = await Bun.file(path).text();
    if (start !== undefined && end !== undefined) {
      const lines = content.split('\n');
      return { success: true, content: lines.slice(start, end).join('\n'), path };
    }
    return { success: true, content, path };
  } catch (error) {
    return { success: false, error: String(error), path };
  }
};

const writeFile: ToolFunction = async (input: unknown) => {
  const { path, content } = input as { path: string; content: string };
  try {
    await Bun.write(path, content);
    return { success: true, path };
  } catch (error) {
    return { success: false, error: String(error), path };
  }
};

const editFile: ToolFunction = async (input: unknown) => {
  const { path, oldString, newString } = input as {
    path: string;
    oldString: string;
    newString: string;
  };
  try {
    const content = await Bun.file(path).text();
    if (!content.includes(oldString)) {
      return { success: false, error: 'Old string not found', path };
    }
    const newContent = content.replace(oldString, newString);
    await Bun.write(path, newContent);
    return { success: true, path };
  } catch (error) {
    return { success: false, error: String(error), path };
  }
};

const globFiles: ToolFunction = async (input: unknown) => {
  const { pattern, cwd } = input as { pattern: string; cwd?: string };
  try {
    const glob = new Glob(pattern);
    const files: string[] = [];
    for await (const file of glob.scan({ cwd: cwd || process.cwd() })) {
      files.push(file);
    }
    return { success: true, files };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

const listDir: ToolFunction = async (input: unknown) => {
  const { path } = input as { path: string };
  try {
    const entries = await new Promise<string[]>((resolve, reject) => {
      import('fs').then(({ readdir }) => {
        readdir(path, (err, files) => {
          if (err) reject(err);
          else resolve(files.map(f => String(f)));
        });
      });
    });
    return { success: true, entries, path };
  } catch (error) {
    return { success: false, error: String(error), path };
  }
};

const makeDir: ToolFunction = async (input: unknown) => {
  const { path, recursive } = input as { path: string; recursive?: boolean };
  try {
    await new Promise<void>((resolve, reject) => {
      import('fs').then(({ mkdir }) => {
        mkdir(path, { recursive: recursive ?? false }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    return { success: true, path };
  } catch (error) {
    return { success: false, error: String(error), path };
  }
};

const removeFile: ToolFunction = async (input: unknown) => {
  const { path } = input as { path: string };
  try {
    await new Promise<void>((resolve, reject) => {
      import('fs').then(({ rm }) => {
        rm(path, { force: true }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    return { success: true, path };
  } catch (error) {
    return { success: false, error: String(error), path };
  }
};

const fileExists: ToolFunction = async (input: unknown) => {
  const { path } = input as { path: string };
  const file = Bun.file(path);
  return { success: true, exists: await file.exists(), path };
};

export const fileTools: Tool[] = [
  {
    name: 'read_file',
    description: 'Read contents of a file. Supports partial reading with start/end line numbers.',
    execute: readFile,
  },
  {
    name: 'write_file',
    description: 'Write content to a file. Creates new file or overwrites existing.',
    execute: writeFile,
  },
  {
    name: 'edit_file',
    description: 'Edit a file by replacing oldString with newString.',
    execute: editFile,
  },
  {
    name: 'glob',
    description: 'Find files matching a glob pattern.',
    execute: globFiles,
  },
  {
    name: 'ls',
    description: 'List directory contents.',
    execute: listDir,
  },
  {
    name: 'mkdir',
    description: 'Create a directory.',
    execute: makeDir,
  },
  {
    name: 'rm',
    description: 'Remove a file or directory.',
    execute: removeFile,
  },
  {
    name: 'file_exists',
    description: 'Check if a file exists.',
    execute: fileExists,
  },
];
