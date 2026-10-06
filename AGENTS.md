# AGENTS.md: kiln-tailwindcss

This repository owns the `@kiln-ssg/tailwindcss` npm package and the `kiln-tailwindcss` command consumed by [kiln](https://github.com/hakula139/kiln).

## Compiler contract

The command accepts one UTF-8 stylesheet and emits compiled CSS on stdout. Keep diagnostics on stderr and compilation failures nonzero so kiln can capture the output and propagate failures. Imports and plugins must resolve from both the input stylesheet's directory and the processor's installed dependencies.

Kiln supplies generated inputs containing shared stylesheet references and Tailwind source declarations. Verify changes against temporary site fixtures outside this repository so package-local dependencies do not hide resolution failures.

## Tests

Use Node's built-in test runner and exercise the command through child processes. Group scenarios by successful compilation, source and plugin variants, then failures. Assert emitted CSS and diagnostic behavior, and keep fixture and invocation helpers after the scenarios that use them.

## Dependencies and packaging

Pin runtime dependencies in `package.json`. Refresh `package-lock.json` and `npmDepsHash` in `default.nix` together when dependencies change. Keep the npm `files` list and Nix source fileset aligned with runtime additions, and include command fixtures in the Nix source so package builds can run the tests.

Add project spellings to `.cspell/words.txt`, one per line in alphabetical order.

## Verification

Run the development checks in [README.md](README.md). Node-side pre-commit hooks skip execution when `node_modules/` is absent, including in the Nix sandbox, so run the npm checks directly. Nix package builds run command tests before installation.

## Releases

The package is versioned independently of kiln. Follow [RELEASING.md](RELEASING.md) for dependency hashes, release tags, and trusted publisher setup.

## Pull requests

Assign pull requests to `hakula139`. Use `enhancement` for features and `bug` for fixes.
