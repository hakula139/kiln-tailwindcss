# AGENTS.md: kiln-tailwindcss

This repository owns the `@kiln-ssg/tailwindcss` npm package and the `kiln-tailwindcss` command consumed by [kiln](https://github.com/hakula139/kiln). The README's [command contract](README.md#command-contract) defines what kiln relies on.

Declare packages imported by stylesheets in `dependencies` with caret ranges, and leave resolved versions to `pnpm-lock.yaml`. Refresh `pnpmDeps.hash` in `default.nix` with lockfile changes. `files` and `bin` in `package.json` define the package boundary. Keep test sites outside the repository so its `node_modules` cannot hide a missing dependency.

## Verification

```bash
nix develop -c run-hooks
nix flake check --all-systems
```

`nix flake check` builds the package, which runs the command tests.

## Releases

Follow [RELEASING.md](RELEASING.md).
