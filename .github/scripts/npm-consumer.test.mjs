import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { it } from 'node:test';
import { promisify } from 'node:util';

const run = promisify(execFile);

it('compiles external utilities and typography after a frozen packed installation', async () => {
  const packages = await readdir(process.env.NPM_PACKAGE_DIRECTORY);
  const archive = packages.find((name) => name.endsWith('.tgz'));
  assert.notEqual(archive, undefined);

  const root = await mkdtemp(join(tmpdir(), 'kiln-tailwindcss-consumer-'));
  try {
    const consumer = join(root, 'consumer');
    const site = join(root, 'site');
    await mkdir(consumer);
    await mkdir(site);
    await run(
      'npm',
      ['install', '--no-audit', '--no-fund', join(process.env.NPM_PACKAGE_DIRECTORY, archive)],
      {
        cwd: consumer,
      },
    );
    await run('npm', ['ci', '--omit=dev', '--no-audit', '--no-fund'], { cwd: consumer });
    await writeFile(
      join(site, 'input.css'),
      '@import "tailwindcss" source(none); @plugin "@tailwindcss/typography"; @source inline("flex prose");',
    );

    const { stdout, stderr } = await run(
      process.execPath,
      [join(consumer, 'node_modules/.bin/kiln-tailwindcss'), join(site, 'input.css')],
      { cwd: site, env: { ...process.env, NODE_PATH: '' }, maxBuffer: 1024 * 1024 },
    );

    assert.equal(stderr, '');
    assert.match(stdout, /\.flex\s*\{\s*display: flex;/);
    assert.match(stdout, /\.prose\s*\{/);
    assert.match(stdout, /max-width: 65ch/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
