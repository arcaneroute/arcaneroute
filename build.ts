#!/usr/bin/env bun

import { createSolidTransformPlugin } from '@opentui/solid/bun-plugin';

const entrypoint = './src/cli/CLIRouter.ts';
const outdir = './dist';

console.log('Building with OpenTUI Solid plugin...');

const result = await Bun.build({
  entrypoints: [entrypoint],
  outdir,
  target: 'bun',
  minify: true,
  plugins: [createSolidTransformPlugin()],
});

if (result.logs.length > 0) {
  for (const log of result.logs) {
    if (log.level === 'error') {
      console.error('ERROR:', log.message);
    } else if (log.level === 'warning') {
      console.warn('WARNING:', log.message);
    }
  }
}

if (result.success) {
  console.log('Build successful!');
} else {
  console.error('Build failed!');
  process.exit(1);
}
