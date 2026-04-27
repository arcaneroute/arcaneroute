import { transformAsync } from '@babel/core';
import solidPreset from 'babel-preset-solid';
import tsPreset from '@babel/preset-typescript';
import { mkdir, readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';

const srcDir = './src';
const outDir = './dist';

async function getFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getFiles(fullPath));
    } else if (extname(entry.name) === '.ts' || extname(entry.name) === '.tsx') {
      files.push(fullPath);
    }
  }
  return files;
}

async function buildFile(file: string) {
  const relPath = relative(srcDir, file);
  const outPath = join(outDir, relPath.replace(/\.tsx?$/, '.js'));
  const dir = join(outDir, relative(srcDir, file).split('/').slice(0, -1).join('/'));

  await mkdir(dir, { recursive: true });

  const code = await readFile(file, 'utf-8');

  const result = await transformAsync(code, {
    presets: [
      [solidPreset, { generate: 'dom', typescript: true }],
      tsPreset,
    ],
    filename: file,
    sourceType: 'module',
    configFile: false,
    babelrc: false,
  });

  if (result?.code) {
    await writeFile(outPath, result.code);
    console.log(`Built: ${relPath} -> ${relative(outDir, outPath)}`);
  }
}

async function build() {
  console.log('Building arcane-ui with Babel...');
  await mkdir(outDir, { recursive: true });

  const files = await getFiles(srcDir);
  for (const file of files) {
    await buildFile(file);
  }

  console.log('Build complete!');
}

build().catch(console.error);
