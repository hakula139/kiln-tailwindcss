import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

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

  it('scans source roots while preserving explicitly declared sources', async () => {
    await withSite(async (root) => {
      await mkdir(join(root, 'pages'));
      await writeFile(join(root, 'pages/page.html'), '<div class="flex"></div>');
      await writeFile(join(root, 'unrelated.html'), '<div class="grid"></div>');
      await writeFile(join(root, 'declared.html'), '<span class="underline"></span>');

      for (const [source, expected] of [
        ['', [true, true]],
        ['source("./pages")', [true, false]],
        ['source(none)', [false, false]],
      ]) {
        await writeFile(
          join(root, 'input.css'),
          `@import "tailwindcss" ${source}; @source "./declared.html";`,
        );

        const css = await compile(root);

        assert.equal(/\.flex\s*\{\s*display: flex;/.test(css), expected[0], source);
        assert.equal(/\.grid\s*\{\s*display: grid;/.test(css), expected[1], source);
        assert.match(css, /\.underline\s*\{\s*text-decoration-line: underline;/);
      }
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

  it('rebases imported stylesheet URLs relative to the input stylesheet', async () => {
    await withSite(async (root) => {
      await mkdir(join(root, 'nested'));
      await writeFile(join(root, 'nested/icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
      await writeFile(
        join(root, 'nested/style.css'),
        '.badge { background-image: url("./icon.svg"); }',
      );
      await writeFile(join(root, 'input.css'), '@import "./nested/style.css";');

      const css = await compile(root);

      const image = css.match(/\.badge\s*\{\s*background-image: url\(["']?([^"'()]+)["']?\);/);
      assert.notEqual(image, null);
      assert.equal(
        await realpath(resolve(root, image[1])),
        await realpath(join(root, 'nested/icon.svg')),
      );
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

  it('resolves hoisted dependencies for a stylesheet outside the installation', async () => {
    await withSite(async (root) => {
      const modules = join(root, 'installation/node_modules');
      const executable = join(modules, '@kiln-ssg/tailwindcss/compiler.mjs');
      await mkdir(dirname(executable), { recursive: true });
      await copyFile(compiler, executable);
      for (const dependency of ['@tailwindcss', 'tailwindcss']) {
        await symlink(
          join(dirname(compiler), 'node_modules', dependency),
          join(modules, dependency),
        );
      }
      await writeFile(
        join(root, 'input.css'),
        '@import "tailwindcss" source(none); @plugin "@tailwindcss/typography"; @source inline("flex prose");',
      );

      const css = await compile(root, executable);

      assert.match(css, /\.flex\s*\{\s*display: flex;/);
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

async function compile(root, executable = compiler) {
  const { stdout, stderr } = await run(process.execPath, [executable, join(root, 'input.css')], {
    cwd: root,
    env: { ...process.env, NODE_PATH: '' },
    maxBuffer: 1024 * 1024,
  });

  assert.equal(stderr, '');
  return stdout;
}
