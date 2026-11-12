# AGENTS.md: kiln-tailwindcss

This repository owns the `@kiln-ssg/tailwindcss` npm package and the `kiln-tailwindcss` command consumed by [kiln](https://github.com/hakula139/kiln). The README's [command contract](README.md#command-contract) defines what kiln relies on.

## Verification

```bash
nix develop -c run-hooks
nix flake check --all-systems
```

`nix flake check` builds the package, which runs the command tests. Keep test sites outside the checkout so they validate the package's declared dependencies without resolving missing imports through its `node_modules`.

## Releases

Follow [RELEASING.md](RELEASING.md).
