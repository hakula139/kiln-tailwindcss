import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, it } from 'node:test';

const run = promisify(execFile);
const compiler = join(dirname(fileURLToPath(import.meta.url)), '../compiler.mjs');

describe('kiln-tailwindcss', () => {
  it('compiles declared sources and detects changed candidates on the next invocation', async () => {
    await withSite(async (root) => {
      await writeFile(
        join(root, 'input.css'),
        '@import "tailwindcss" source(none); @source "./page.html"; ',
      );
      await writeFile(join(root, 'page.html'), '<div class="flex"></div>');
      const first = await compile(root);
      assert.match(first, /\.flex\s*\{\s*display: flex;/);
      assert.doesNotMatch(first, /\.gap-4\s*\{/);
      await writeFile(join(root, 'page.html'), '<div class="flex gap-4"></div>');
      const second = await compile(root);
      assert.match(second, /\.gap-4\s*\{\s*gap: calc\(var\(--spacing\) \* 4\);/);
    });
  });

  it('resolves shared theme references and imports from a page stylesheet', async () => {
    await withSite(async (root) => {
      await mkdir(join(root, 'shared'));
      await writeFile(
        join(root, 'shared/theme.css'),
        '@import "tailwindcss" source(none); @theme { --color-brand: #123456; } ',
      );
      await writeFile(
        join(root, 'input.css'),
        '@reference "./shared/theme.css"; .panel { @apply flex bg-brand; } ',
      );
      const css = await compile(root);
      assert.match(css, /\.panel\s*\{[^}]*display: flex;/);
      assert.match(css, /background-color: var\(--color-brand, #123456\)/);
      assert.doesNotMatch(css, /@reference|@apply/);
    });
  });

  it('loads the bundled typography plugin', async () => {
    await withSite(async (root) => {
      await writeFile(
        join(root, 'input.css'),
        '@import "tailwindcss" source(none); @plugin "@tailwindcss/typography"; @source "./page.html"; ',
      );
      await writeFile(join(root, 'page.html'), '<article class="prose"></article>');
      const css = await compile(root);
      assert.match(css, /\.prose\s*\{/);
      assert.match(css, /max-width: 65ch/);
    });
  });

  it('reports an invalid utility as a compilation failure', async () => {
    await withSite(async (root) => {
      await writeFile(
        join(root, 'input.css'),
        '@import "tailwindcss"; .panel { @apply nonexistent-example-utility; } ',
      );
      await assert.rejects(compile(root), (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /nonexistent-example-utility/);
        return true;
      });
    });
  });

  it('reports a missing input file', async () => {
    await withSite(async (root) => {
      await assert.rejects(compile(root), (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /ENOENT/);
        return true;
      });
    });
  });
});

async function withSite(callback) {
  const root = await mkdtemp(join(tmpdir(), 'kiln-tailwindcss-test-'));
  try {
    await callback(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function compile(root) {
  const { stdout, stderr } = await run(process.execPath, [compiler, join(root, 'input.css')], {
    cwd: root,
    maxBuffer: 1024 * 1024,
  });
  assert.equal(stderr, '');
  return stdout;
}
