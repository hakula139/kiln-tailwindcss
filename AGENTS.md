# AGENTS.md: kiln-tailwindcss

This repository owns the `@kiln-ssg/tailwindcss` npm package and the `kiln-tailwindcss` command consumed by [kiln](https://github.com/hakula139/kiln). The README's [command contract](README.md#command-contract) defines what kiln relies on.

## Dependencies and packaging

Stylesheets import packages such as `tailwindcss` from the command's installation, where pnpm's isolated layout exposes only direct dependencies, so pin every importable package in `dependencies`. Keep test sites outside the repository, where its `node_modules` cannot hide a missing dependency. A dependency change also updates the `pnpmDeps` hash in `default.nix`, and the Nix package installs the `files` and `bin` that `package.json` lists.

## Verification

```bash
nix develop -c run-hooks
nix flake check --all-systems
```

`nix flake check` builds the package, which runs the command tests.

## Releases

Follow [RELEASING.md](RELEASING.md).
