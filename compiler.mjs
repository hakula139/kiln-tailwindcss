#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { delimiter, dirname } from 'node:path';

const modules = createRequire(import.meta.url).resolve.paths('@tailwindcss/node');
process.env.NODE_PATH = [process.env.NODE_PATH, ...modules].filter(Boolean).join(delimiter);

// Tailwind captures NODE_PATH when its resolver module loads.
const { compile } = await import('@tailwindcss/node');
const { Scanner } = await import('@tailwindcss/oxide');

const [input] = process.argv.slice(2);
const base = dirname(input);

const compiler = await compile(await readFile(input, 'utf8'), {
  base,
  from: input,
  onDependency() {},
  shouldRewriteUrls: true,
});

const sources = [...compiler.sources];
if (compiler.root !== 'none') {
  sources.push({
    ...(compiler.root ?? { base, pattern: '**/*' }),
    negated: false,
  });
}

const scanner = new Scanner({ sources });
process.stdout.write(compiler.build(scanner.scan()));
