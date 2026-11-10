# AGENTS.md: kiln-tailwindcss

This repository owns the `@kiln-ssg/tailwindcss` npm package and the `kiln-tailwindcss` command consumed by [kiln](https://github.com/hakula139/kiln). The README's [command contract](README.md#command-contract) defines what kiln relies on.

## Dependencies and packaging

Stylesheets import packages such as `tailwindcss` from the command's installation, where pnpm and Nix expose only direct dependencies, so pin every importable package in `dependencies`. A dependency change also updates the `pnpmDeps` hash in `default.nix`. A new runtime file goes in `package.json`'s `files` and in the source fileset and `installPhase` of `default.nix`.

## Verification

```bash
nix develop -c run-hooks
nix flake check
```

`nix flake check` builds the package, which runs the command tests.

## Releases

Follow [RELEASING.md](RELEASING.md).
